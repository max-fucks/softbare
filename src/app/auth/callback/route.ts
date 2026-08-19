import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://softbare.vercel.app' : origin)
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Auth callback failed:', error.message)
      return NextResponse.redirect(`${siteUrl}/login?error=auth_callback`)
    }
  }

  // After successfully logging in, send the user back to the Arena (home page)
  return NextResponse.redirect(`${siteUrl}/`)
}
