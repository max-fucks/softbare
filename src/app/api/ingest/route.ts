import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// This is the TMDB Person ID for a specific actress. 
// For example, 1245 is Scarlett Johansson. 
// We will start by pulling her data as a test.
const ACTOR_ID = 1245; 
const TMDB_API_KEY = process.env.TMDB_API_KEY;

export async function GET() {
  try {
    // 1. Fetch Actor Details from TMDB
    const actorRes = await fetch(`https://api.themoviedb.org/3/person/${ACTOR_ID}?api_key=${TMDB_API_KEY}`);
    const actorData = await actorRes.json();

    // 2. Insert Actor into Supabase (if they don't exist)
    const { error: actorError } = await supabase
      .from('actors')
      .upsert({
        tmdb_id: actorData.id,
        name: actorData.name,
        gender: actorData.gender,
        popularity: actorData.popularity
      });

    if (actorError) throw actorError;

    // 3. Fetch High-Res Images for this Actor
    // TMDB has a specific endpoint for profiles/images
    const imageRes = await fetch(`https://api.themoviedb.org/3/person/${ACTOR_ID}/images?api_key=${TMDB_API_KEY}`);
    const imageData = await imageRes.json();

    // 4. Format and Insert Images into the "looks" table
    // We filter for high-quality images and build the full URL
    const looksToInsert = imageData.profiles
      .filter((img: any) => img.vote_average > 5) // Only take highly rated images
      .map((img: any) => ({
        actor_id: actorData.id,
        image_url: `https://image.tmdb.org/t/p/original${img.file_path}`,
        // We start everyone at a baseline ELO of 1200
        elo_rating: 1200 
      }));

    const { error: looksError } = await supabase
      .from('looks')
      .upsert(looksToInsert, { onConflict: 'image_url' }); // Prevent duplicates

    if (looksError) throw looksError;

    return NextResponse.json({ 
        success: true, 
        message: `Successfully ingested ${actorData.name} and ${looksToInsert.length} looks.` 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to ingest data' }, { status: 500 });
  }
}
