import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // We pass the user's top actor and a custom title in the URL
    const username = searchParams.get('username') || 'Aesthetic Voter';
    const topLookUrl = searchParams.get('topLook') || 'https://image.tmdb.org/t/p/original/fallback.jpg';
    const eloScore = searchParams.get('elo') || '1500';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#09090b', // Deep Zinc Dark Mode
            fontFamily: 'sans-serif',
            backgroundImage: 'radial-gradient(circle at 50% -20%, #f43f5e 0%, #09090b 70%)', // Red neon glow
          }}
        >
          {/* The User's "S-Tier" Pick */}
          <div style={{ display: 'flex', overflow: 'hidden', borderRadius: '24px', boxShadow: '0 0 40px rgba(0,0,0,0.8)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={topLookUrl} 
              height="400" 
              width="400" 
              style={{ objectFit: 'cover' }} 
              alt="Top Look"
            />
          </div>

          <h1 style={{ fontSize: '60px', color: 'white', marginTop: '40px', fontWeight: 900 }}>
            {username}&apos;s Top Aesthetic
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
            <span style={{ fontSize: '32px', color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Global ELO: {eloScore}
            </span>
          </div>

          <div style={{ position: 'absolute', bottom: '40px', color: '#71717a', fontSize: '24px' }}>
            softbare.app
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response(`Failed to generate image`, { status: 500 });
  }
}
