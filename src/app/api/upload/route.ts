import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const actorName = formData.get('actorName') as string;

    if (!file || !actorName) {
      return NextResponse.json({ error: 'Missing file or actor name' }, { status: 400 });
    }

    // 1. Convert file to buffer for Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `user-upload-${uuidv4()}.${fileExtension}`;

    // 2. Upload directly to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('vault-images')
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    // Get the public URL of the newly hosted image
    const publicUrl = supabase.storage.from('vault-images').getPublicUrl(fileName).data.publicUrl;

    // 3. Ensure Actor exists (or create them)
    let { data: actor } = await supabase.from('actors').select('id').eq('name', actorName).single();
    if (!actor) {
      const { data: newActor, error: actorErr } = await supabase.from('actors').insert([{ name: actorName }]).select().single();
      if (actorErr) throw actorErr;
      actor = newActor;
    }

    // 4. Inject into the Arena (Starts at base ELO of 1000 for user uploads to prove their worth)
    await supabase.from('looks').insert([{
      actor_id: actor!.id,
      image_url: publicUrl,
      elo_rating: 1000, 
    }]);

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: unknown) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
