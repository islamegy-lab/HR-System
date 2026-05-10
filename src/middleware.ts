import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAuthPage     = pathname === '/login'
  const isEmployeePage = pathname.startsWith('/employee')
  const isApiPage      = pathname.startsWith('/api')

  if (isEmployeePage || isApiPage)
    return NextResponse.next()

  const token = request.cookies.get('sb-access-token')?.value

  if (!token) {
    if (isAuthPage) return NextResponse.next()
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // تحقق من صحة الـ token مع Supabase
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
    }
  )

  if (!res.ok) {
    if (isAuthPage) return NextResponse.next()
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const user = await res.json()
  const role = user?.user_metadata?.role || request.cookies.get('sb-role')?.value || 'hr_manager'

  // موظف عادي يحاول يدخل لوحة الإدارة → بوابة الموظف
  if (role === 'employee' && !isAuthPage) {
    return NextResponse.redirect(new URL('/employee/attendance', request.url))
  }

  // مسجل دخول + على /login → داشبورد
  if (isAuthPage) {
    const dest = role === 'employee' ? '/employee/attendance' : '/dashboard'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
