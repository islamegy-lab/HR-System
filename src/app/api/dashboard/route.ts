import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const today = new Date().toISOString().split('T')[0]
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const [employees, todayAttendance, pendingLeaves, openJobs, monthlyPayroll] = await Promise.all([
    supabase.from('employees').select('status'),
    supabase.from('attendance').select('status').eq('date', today),
    supabase.from('leave_requests').select('id').eq('status', 'pending'),
    supabase.from('recruitment_jobs').select('id').eq('status', 'open'),
    supabase.from('payroll').select('net_salary').eq('month', currentMonth).eq('year', currentYear),
  ])

  return NextResponse.json({
    total_employees: employees.data?.length || 0,
    active_employees: employees.data?.filter(e => e.status === 'active').length || 0,
    present_today: todayAttendance.data?.filter(a => a.status === 'present').length || 0,
    absent_today: todayAttendance.data?.filter(a => a.status === 'absent').length || 0,
    on_leave_today: todayAttendance.data?.filter(a => a.status === 'on_leave').length || 0,
    pending_leaves: pendingLeaves.data?.length || 0,
    open_jobs: openJobs.data?.length || 0,
    monthly_payroll: monthlyPayroll.data?.reduce((s, p) => s + (p.net_salary || 0), 0) || 0,
  })
}
