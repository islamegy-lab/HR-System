import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({ email, password }),
    }
  )

  const data = await res.json()

  if (!res.ok || data.error) {
    return NextResponse.json({ error: data.error_description || data.error || 'خطأ في تسجيل الدخول' }, { status: 401 })
  }

  // احفظ الـ role من user_metadata
  const role: string = data.user?.user_metadata?.role || 'employee'

  const response = NextResponse.json({ ok: true, role })

  const cookieOpts = {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 أيام
  }

  response.cookies.set('sb-access-token',  data.access_token,  cookieOpts)
  response.cookies.set('sb-refresh-token', data.refresh_token, cookieOpts)
  response.cookies.set('sb-role',          role,               { ...cookieOpts, httpOnly: false })

  return response
}
