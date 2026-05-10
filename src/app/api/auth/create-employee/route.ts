import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, ...employeeData } = body

    if (!email || !password)
      return NextResponse.json({ error: 'البريد وكلمة المرور مطلوبان' }, { status: 400 })

    // 1. إنشاء مستخدم في Auth
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: body.role || 'employee' },
    })
    if (authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })

    // 2. إنشاء سجل الموظف مربوط بـ user_id
    const { data: employee, error: empError } = await adminSupabase
      .from('employees')
      .insert({ ...employeeData, email, user_id: authData.user.id })
      .select('*, department:departments(id,name,name_ar), job_position:job_positions(id,title,title_ar)')
      .single()

    if (empError) {
      // rollback - احذف Auth user إذا فشل إنشاء الموظف
      await adminSupabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: empError.message }, { status: 400 })
    }

    return NextResponse.json({ data: employee }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'خطأ غير متوقع' }, { status: 500 })
  }
}
