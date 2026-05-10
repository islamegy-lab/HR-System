import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_ROLES = ['admin', 'hr_manager', 'manager']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // ── صفحات عامة لا تحتاج حماية ──
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/favicon.ico')
    return supabaseResponse

  // ── /login (الإدارة) ──
  if (pathname === '/login') {
    if (user) return NextResponse.redirect(new URL('/dashboard', request.url))
    return supabaseResponse
  }

  // ── /employee/login ──
  if (pathname === '/employee/login') {
    if (user) return NextResponse.redirect(new URL('/employee', request.url))
    return supabaseResponse
  }

  // ── بوابة الموظف /employee/* ──
  if (pathname.startsWith('/employee')) {
    if (!user) return NextResponse.redirect(new URL('/employee/login', request.url))
    return supabaseResponse
  }

  // ── لوحة الإدارة /dashboard وباقي الصفحات ──
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  // تحقق من الدور — فقط أصحاب الأدوار الإدارية يدخلون الإدارة
  const { data: emp } = await supabase
    .from('employees')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const role = emp?.role || 'employee'

  if (!ADMIN_ROLES.includes(role)) {
    // موظف عادي حاول الدخول للإدارة → وجّهه لبوابته
    return NextResponse.redirect(new URL('/employee', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
