import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // اختبر الاتصال بـ Supabase Auth
  try {
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { 'apikey': key! }
    })
    const data = await res.json()
    return NextResponse.json({
      url_ok: !!url,
      key_ok: !!key,
      supabase_reachable: res.ok,
      supabase_status: res.status,
      email_enabled: data?.external?.email ?? 'unknown',
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message })
  }
}
