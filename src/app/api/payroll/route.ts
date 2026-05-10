import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')
  const year = searchParams.get('year')

  let query = supabase
    .from('payroll')
    .select('*, employee:employees(id,first_name,last_name,employee_number,department:departments(name_ar))')
    .order('created_at', { ascending: false })

  if (month) query = query.eq('month', Number(month))
  if (year) query = query.eq('year', Number(year))

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (body.generate) {
    const { month, year } = body
    const { data: employees } = await supabase.from('employees').select('id,basic_salary').eq('status', 'active')
    if (!employees) return NextResponse.json({ error: 'No employees' }, { status: 400 })

    const payrolls = employees.map(emp => ({
      employee_id: emp.id,
      month, year,
      basic_salary: emp.basic_salary || 0,
      housing_allowance: (emp.basic_salary || 0) * 0.25,
      transport_allowance: 500,
      other_allowances: 0,
      overtime_pay: 0,
      deductions: 0,
      tax: (emp.basic_salary || 0) * 0.025,
      net_salary: (emp.basic_salary || 0) * 1.25 + 500 - (emp.basic_salary || 0) * 0.025,
      status: 'draft',
    }))

    const { data, error } = await supabase.from('payroll').upsert(payrolls, { onConflict: 'employee_id,month,year' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, count: payrolls.length })
  }

  const { data, error } = await supabase.from('payroll').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
