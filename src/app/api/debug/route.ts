import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'موجود ✓' : 'غير موجود ✗',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'موجود ✓' : 'غير موجود ✗',
    url_value: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) + '...',
  })
}
