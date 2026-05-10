import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey)
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY غير موجود في متغيرات البيئة' }, { status: 500 })

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const body = await req.json()
    const { email, password, role, housing_allowance, transport_allowance, other_allowances, ...employeeData } = body

    if (!email || !password)
      return NextResponse.json({ error: 'البريد وكلمة المرور مطلوبان' }, { status: 400 })

    // 1. إنشاء مستخدم في Auth
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: role || 'employee' },
    })

    if (authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })

    // 2. تنظيف البيانات - فقط الأعمدة الموجودة في جدول employees
    const cleanEmployee = {
      email,
      user_id:         authData.user.id,
      first_name:      employeeData.first_name      || '',
      last_name:       employeeData.last_name       || '',
      employee_number: employeeData.employee_number || `EMP-${Date.now()}`,
      phone:           employeeData.phone           || null,
      national_id:     employeeData.national_id     || null,
      date_of_birth:   employeeData.date_of_birth   || null,
      gender:          employeeData.gender          || null,
      nationality:     employeeData.nationality     || null,
      address:         employeeData.address         || null,
      department_id:   employeeData.department_id   || null,
      job_position_id: employeeData.job_position_id || null,
      hire_date:       employeeData.hire_date       || new Date().toISOString().split('T')[0],
      contract_type:   employeeData.contract_type   || 'full_time',
      status:          employeeData.status          || 'active',
      basic_salary:    employeeData.basic_salary    ? Number(employeeData.basic_salary) : null,
    }

    const { data: employee, error: empError } = await adminSupabase
      .from('employees')
      .insert(cleanEmployee)
      .select('*, department:departments(id,name,name_ar), job_position:job_positions(id,title,title_ar)')
      .single()

    if (empError) {
      await adminSupabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: empError.message, details: empError }, { status: 400 })
    }

    return NextResponse.json({ data: employee }, { status: 201 })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'خطأ غير متوقع' }, { status: 500 })
  }
}
