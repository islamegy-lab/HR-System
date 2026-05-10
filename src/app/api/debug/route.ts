import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    has_supabase_url:          !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    has_anon_key:              !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    has_service_role_key:      !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    service_role_key_preview:  process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20) + '...',
    node_env:                  process.env.NODE_ENV,
  })
}
