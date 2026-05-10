import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const currentMonth = today.getMonth() + 1
  const currentYear  = today.getFullYear()

  // آخر 6 أيام للحضور
  const last6Days = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (5 - i))
    return d.toISOString().split('T')[0]
  })

  // آخر 6 أشهر للرواتب
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today)
    d.setMonth(d.getMonth() - (5 - i))
    return { month: d.getMonth() + 1, year: d.getFullYear() }
  })

  const [employees, todayAttendance, pendingLeaves, openJobs, monthlyPayroll, weekAttendance, payrollHistory] = await Promise.all([
    supabase.from('employees').select('status'),
    supabase.from('attendance').select('status').eq('date', todayStr),
    supabase.from('leave_requests').select('id').eq('status', 'pending'),
    supabase.from('recruitment_jobs').select('id').eq('status', 'open'),
    supabase.from('payroll').select('net_salary').eq('month', currentMonth).eq('year', currentYear),
    // حضور آخر 6 أيام
    supabase.from('attendance').select('date,status').in('date', last6Days),
    // رواتب آخر 6 أشهر
    supabase.from('payroll').select('month,year,net_salary')
      .gte('year', last6Months[0].year)
      .or(last6Months.map(m => `and(month.eq.${m.month},year.eq.${m.year})`).join(',')),
  ])

  // بناء بيانات رسم الحضور
  const DAY_NAMES: Record<number, string> = { 0: 'الأحد', 1: 'الاثنين', 2: 'الثلاثاء', 3: 'الأربعاء', 4: 'الخميس', 5: 'الجمعة', 6: 'السبت' }
  const attendanceChart = last6Days.map(dateStr => {
    const dayRecords = weekAttendance.data?.filter(r => r.date === dateStr) || []
    const dayName = DAY_NAMES[new Date(dateStr).getDay()]
    return {
      day: dayName,
      حاضر: dayRecords.filter(r => r.status === 'present').length,
      غائب: dayRecords.filter(r => r.status === 'absent').length,
      متأخر: dayRecords.filter(r => r.status === 'late').length,
    }
  })

  // بناء بيانات رسم الرواتب
  const MONTH_NAMES = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
  const payrollChart = last6Months.map(({ month, year }) => {
    const total = payrollHistory.data
      ?.filter(p => p.month === month && p.year === year)
      .reduce((s, p) => s + (p.net_salary || 0), 0) || 0
    return { month: MONTH_NAMES[month - 1], الرواتب: total }
  })

  return NextResponse.json({
    total_employees:  employees.data?.length || 0,
    active_employees: employees.data?.filter(e => e.status === 'active').length || 0,
    present_today:    todayAttendance.data?.filter(a => a.status === 'present').length || 0,
    absent_today:     todayAttendance.data?.filter(a => a.status === 'absent').length || 0,
    on_leave_today:   todayAttendance.data?.filter(a => a.status === 'on_leave').length || 0,
    pending_leaves:   pendingLeaves.data?.length || 0,
    open_jobs:        openJobs.data?.length || 0,
    monthly_payroll:  monthlyPayroll.data?.reduce((s, p) => s + (p.net_salary || 0), 0) || 0,
    attendance_chart: attendanceChart,
    payroll_chart:    payrollChart,
  })
}
