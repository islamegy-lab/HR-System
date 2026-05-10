import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date_from = searchParams.get('date_from')
  const date_to = searchParams.get('date_to')
  const employee_id = searchParams.get('employee_id')

  let query = supabase
    .from('attendance')
    .select('*, employee:employees(id,first_name,last_name,employee_number)')
    .order('date', { ascending: false })

  if (employee_id) query = query.eq('employee_id', employee_id)
  if (date_from) query = query.gte('date', date_from)
  if (date_to) query = query.lte('date', date_to)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await supabase
    .from('attendance')
    .upsert(body, { onConflict: 'employee_id,date' })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
