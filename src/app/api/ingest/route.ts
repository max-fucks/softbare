import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const { actorName, query } = await req.json();
    // e.g., actorName: "Sydney Sweeney", query: "Sydney Sweeney GQ red carpet high res"

    // 1. Ensure the Actor exists in our new independent database
    let { data: actor } = await supabase.from('actors').select('id').eq('name', actorName).single();
    
    if (!actor) {
      const { data: newActor, error } = await supabase.from('actors').insert([{ name: actorName }]).select().single();
      if (error) throw error;
      actor = newActor;
    }

    // 2. Scrape the Open Web (Using Serper.dev for Google Images)
    const scrapeRes = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: { 'X-API-KEY': process.env.SERPER_API_KEY!, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num: 10 }) // Grab top 10 results
    });
    const scrapeData = await scrapeRes.json();
    
    let ingestedCount = 0;

    // 3. Process each scraped image
    for (const img of scrapeData.images) {
      const imageUrl = img.imageUrl;

      // 4. The NSFW Filter (Sightengine API)
      // We instruct it to flag hardcore nudity but allow standard/editorial content
      const nsfwCheck = await fetch(`https://api.sightengine.com/1.0/check.json?models=nudity-2.0&api_user=${process.env.SIGHTENGINE_API_USER}&api_secret=${process.env.SIGHTENGINE_API_SECRET}&url=${encodeURIComponent(imageUrl)}`);
      const nsfwData = await nsfwCheck.json();

      // If it detects explicit sexual activity or full raw nudity, skip this image
      if (nsfwData.nudity && (nsfwData.nudity.sexual_activity > 0.5 || nsfwData.nudity.raw > 0.5)) {
        console.log(`Skipped explicit image for ${actorName}`);
        continue; 
      }

      // 5. Download the image into our own memory
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const fileExtension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
      const fileName = `${actorName.replace(/\s+/g, '-').toLowerCase()}-${uuidv4()}.${fileExtension}`;

      // 6. Upload to your Supabase Storage Bucket ('vault-images')
      const { error: uploadError } = await supabase.storage
        .from('vault-images')
        .upload(fileName, imageBuffer, { contentType: `image/${fileExtension}` });

      if (uploadError) continue; // Skip if upload fails

      const publicUrl = supabase.storage.from('vault-images').getPublicUrl(fileName).data.publicUrl;

      // 7. Log the final, hosted asset into the database
      await supabase.from('looks').insert([{
        actor_id: actor!.id,
        image_url: publicUrl,
        source_url: imageUrl,
        elo_rating: 1200
      }]);

      ingestedCount++;
    }

    return NextResponse.json({ success: true, message: `Scraped, filtered, and hosted ${ingestedCount} new looks for ${actorName}.` });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ingestion pipeline failed' }, { status: 500 });
  }
}
