import { supabase } from './supabase'
import type { Employee, Attendance, LeaveRequest, Payroll, DashboardStats, EmployeeDocument, AttendanceLocation } from '@/types'

// EMPLOYEES
export const employeesApi = {
  getAll: async (filters?: { department_id?: string; status?: string; search?: string }) => {
    let query = supabase
      .from('employees')
      .select('*, department:departments(id,name,name_ar), job_position:job_positions(id,title,title_ar)')
      .order('created_at', { ascending: false })
    if (filters?.department_id) query = query.eq('department_id', filters.department_id)
    if (filters?.status) query = query.eq('status', filters.status)
    if (filters?.search) query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,employee_number.ilike.%${filters.search}%`)
    return query
  },
  getById: async (id: string) =>
    supabase.from('employees').select('*, department:departments(*), job_position:job_positions(*), manager:employees!manager_id(id,first_name,last_name)').eq('id', id).single(),
  create: async (data: Partial<Employee>) =>
    supabase.from('employees').insert(data).select().single(),
  update: async (id: string, data: Partial<Employee>) =>
    supabase.from('employees').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single(),
  delete: async (id: string) =>
    supabase.from('employees').update({ status: 'terminated' }).eq('id', id),
}

// ATTENDANCE
export const attendanceApi = {
  getAll: async (filters?: { employee_id?: string; date_from?: string; date_to?: string }) => {
    let query = supabase
      .from('attendance')
      .select('*, employee:employees(id,first_name,last_name,employee_number,photo_url)')
      .order('date', { ascending: false })
    if (filters?.employee_id) query = query.eq('employee_id', filters.employee_id)
    if (filters?.date_from) query = query.gte('date', filters.date_from)
    if (filters?.date_to) query = query.lte('date', filters.date_to)
    return query
  },
  upsert: async (data: Partial<Attendance>) =>
    supabase.from('attendance').upsert(data, { onConflict: 'employee_id,date' }).select().single(),
  getTodaySummary: async () => {
    const today = new Date().toISOString().split('T')[0]
    return supabase.from('attendance').select('status').eq('date', today)
  },
  getLocations: async () =>
    supabase.from('attendance_locations').select('*').eq('is_active', true),
  saveLocation: async (data: Partial<AttendanceLocation>) =>
    supabase.from('attendance_locations').upsert(data).select().single(),
}

// LEAVES
export const leavesApi = {
  getAll: async (filters?: { employee_id?: string; status?: string }) => {
    let query = supabase
      .from('leave_requests')
      .select('*, employee:employees(id,first_name,last_name,photo_url), leave_type:leave_types(*)')
      .order('created_at', { ascending: false })
    if (filters?.employee_id) query = query.eq('employee_id', filters.employee_id)
    if (filters?.status) query = query.eq('status', filters.status)
    return query
  },
  create: async (data: Partial<LeaveRequest>) =>
    supabase.from('leave_requests').insert(data).select().single(),
  updateStatus: async (id: string, status: string, approved_by?: string) =>
    supabase.from('leave_requests').update({ status, approved_by, approved_at: new Date().toISOString() }).eq('id', id).select().single(),
  getTypes: async () => supabase.from('leave_types').select('*'),
}

// PAYROLL
export const payrollApi = {
  getAll: async (filters?: { month?: number; year?: number; status?: string }) => {
    let query = supabase
      .from('payroll')
      .select('*, employee:employees(id,first_name,last_name,employee_number,department:departments(name_ar))')
      .order('created_at', { ascending: false })
    if (filters?.month) query = query.eq('month', filters.month)
    if (filters?.year) query = query.eq('year', filters.year)
    if (filters?.status) query = query.eq('status', filters.status)
    return query
  },
  create: async (data: Partial<Payroll>) =>
    supabase.from('payroll').insert(data).select().single(),
  update: async (id: string, data: Partial<Payroll>) =>
    supabase.from('payroll').update(data).eq('id', id).select().single(),
  generateMonthly: async (month: number, year: number) => {
    const { data: employees } = await supabase.from('employees').select('id, basic_salary').eq('status', 'active')
    if (!employees) return { error: 'No employees found' }
    const payrolls = employees.map(emp => ({
      employee_id: emp.id, month, year,
      basic_salary: emp.basic_salary || 0,
      housing_allowance: (emp.basic_salary || 0) * 0.25,
      transport_allowance: 500, other_allowances: 0, overtime_pay: 0, deductions: 0,
      tax: (emp.basic_salary || 0) * 0.025,
      net_salary: (emp.basic_salary || 0) * 1.25 + 500 - (emp.basic_salary || 0) * 0.025,
      status: 'draft',
    }))
    return supabase.from('payroll').upsert(payrolls, { onConflict: 'employee_id,month,year' })
  },
}

// DOCUMENTS
export const documentsApi = {
  getAll: async (filters?: { employee_id?: string; status?: string }) => {
    let query = supabase
      .from('employee_documents')
      .select('*, employee:employees(id,first_name,last_name,employee_number)')
      .order('expiry_date', { ascending: true })
    if (filters?.employee_id) query = query.eq('employee_id', filters.employee_id)
    if (filters?.status) query = query.eq('status', filters.status)
    return query
  },
  getExpiring: async () =>
    supabase.from('expiring_documents').select('*').order('days_remaining', { ascending: true }),
  create: async (data: Partial<EmployeeDocument>) =>
    supabase.from('employee_documents').insert(data).select().single(),
  update: async (id: string, data: Partial<EmployeeDocument>) =>
    supabase.from('employee_documents').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single(),
  delete: async (id: string) =>
    supabase.from('employee_documents').delete().eq('id', id),
}

// RECRUITMENT
export const recruitmentApi = {
  getJobs: async () =>
    supabase.from('recruitment_jobs').select('*, department:departments(name,name_ar)').order('created_at', { ascending: false }),
  createJob: async (data: object) =>
    supabase.from('recruitment_jobs').insert(data).select().single(),
  updateJob: async (id: string, data: object) =>
    supabase.from('recruitment_jobs').update(data).eq('id', id).select().single(),
  getApplications: async (job_id?: string) => {
    let query = supabase.from('job_applications').select('*, job:recruitment_jobs(title)').order('created_at', { ascending: false })
    if (job_id) query = query.eq('job_id', job_id)
    return query
  },
  updateApplicationStage: async (id: string, stage: string) =>
    supabase.from('job_applications').update({ stage }).eq('id', id).select().single(),
}

// TRAINING
export const trainingApi = {
  getAll: async () =>
    supabase.from('training_programs').select('*').order('created_at', { ascending: false }),
  create: async (data: object) =>
    supabase.from('training_programs').insert(data).select().single(),
  enroll: async (training_id: string, employee_id: string) =>
    supabase.from('training_enrollments').insert({ training_id, employee_id }).select().single(),
}

// AUTH
export const authApi = {
  signIn: async (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),
  signOut: async () =>
    supabase.auth.signOut(),
  getSession: async () =>
    supabase.auth.getSession(),
  getUser: async () =>
    supabase.auth.getUser(),
  getEmployeeByUserId: async (userId: string) =>
    supabase.from('employees').select('*, department:departments(id,name,name_ar), job_position:job_positions(id,title,title_ar)').eq('user_id', userId).single(),
}

// DASHBOARD
export const dashboardApi = {
  getStats: async (): Promise<{ data: DashboardStats | null; error: unknown }> => {
    const today = new Date().toISOString().split('T')[0]
    const [employees, todayAttendance, pendingLeaves, openJobs, monthlyPayroll] = await Promise.all([
      supabase.from('employees').select('status'),
      supabase.from('attendance').select('status').eq('date', today),
      supabase.from('leave_requests').select('id').eq('status', 'pending'),
      supabase.from('recruitment_jobs').select('id').eq('status', 'open'),
      supabase.from('payroll').select('net_salary').eq('month', new Date().getMonth() + 1).eq('year', new Date().getFullYear()),
    ])
    return {
      data: {
        total_employees: employees.data?.length || 0,
        active_employees: employees.data?.filter(e => e.status === 'active').length || 0,
        present_today: todayAttendance.data?.filter(a => a.status === 'present').length || 0,
        absent_today: todayAttendance.data?.filter(a => a.status === 'absent').length || 0,
        on_leave_today: todayAttendance.data?.filter(a => a.status === 'on_leave').length || 0,
        pending_leaves: pendingLeaves.data?.length || 0,
        open_jobs: openJobs.data?.length || 0,
        monthly_payroll: monthlyPayroll.data?.reduce((s, p) => s + (p.net_salary || 0), 0) || 0,
      },
      error: null,
    }
  },
}
