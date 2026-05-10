export type EmployeeStatus = 'active' | 'inactive' | 'on_leave' | 'terminated'
export type ContractType = 'full_time' | 'part_time' | 'contract' | 'intern'
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type PayrollStatus = 'draft' | 'confirmed' | 'paid'
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'holiday'
export type ApplicationStage = 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected'

export interface Department {
  id: string
  name: string
  name_ar?: string
  manager_id?: string
  parent_id?: string
  created_at: string
  manager?: Employee
  employees_count?: number
}

export interface JobPosition {
  id: string
  title: string
  title_ar?: string
  department_id?: string
  description?: string
  created_at: string
  department?: Department
}

export interface Employee {
  id: string
  employee_number: string
  first_name: string
  last_name: string
  first_name_ar?: string
  last_name_ar?: string
  email: string
  phone?: string
  national_id?: string
  date_of_birth?: string
  gender?: string
  marital_status?: string
  nationality?: string
  address?: string
  photo_url?: string
  department_id?: string
  job_position_id?: string
  manager_id?: string
  hire_date: string
  contract_type: ContractType
  status: EmployeeStatus
  basic_salary?: number
  created_at: string
  updated_at: string
  department?: Department
  job_position?: JobPosition
  manager?: Employee
}

export interface Attendance {
  id: string
  employee_id: string
  date: string
  check_in?: string
  check_out?: string
  work_hours?: number
  status: AttendanceStatus
  notes?: string
  created_at: string
  employee?: Employee
}

export interface LeaveType {
  id: string
  name: string
  name_ar?: string
  days_per_year: number
  is_paid: boolean
  color: string
}

export interface LeaveRequest {
  id: string
  employee_id: string
  leave_type_id: string
  start_date: string
  end_date: string
  days_count: number
  reason?: string
  status: LeaveStatus
  approved_by?: string
  approved_at?: string
  created_at: string
  employee?: Employee
  leave_type?: LeaveType
  approver?: Employee
}

export interface Payroll {
  id: string
  employee_id: string
  month: number
  year: number
  basic_salary: number
  housing_allowance: number
  transport_allowance: number
  other_allowances: number
  overtime_pay: number
  deductions: number
  tax: number
  net_salary: number
  status: PayrollStatus
  paid_at?: string
  created_at: string
  employee?: Employee
}

export interface PerformanceReview {
  id: string
  employee_id: string
  reviewer_id?: string
  review_period?: string
  review_date: string
  score?: number
  goals_score?: number
  skills_score?: number
  behavior_score?: number
  comments?: string
  status: string
  created_at: string
  employee?: Employee
  reviewer?: Employee
}

export interface RecruitmentJob {
  id: string
  title: string
  department_id?: string
  positions_count: number
  description?: string
  requirements?: string
  status: string
  deadline?: string
  created_at: string
  department?: Department
  applications_count?: number
}

export interface JobApplication {
  id: string
  job_id: string
  applicant_name: string
  email: string
  phone?: string
  cv_url?: string
  stage: ApplicationStage
  notes?: string
  created_at: string
  job?: RecruitmentJob
}

export interface TrainingProgram {
  id: string
  title: string
  description?: string
  trainer?: string
  start_date?: string
  end_date?: string
  location?: string
  max_participants?: number
  status: string
  created_at: string
  enrollments_count?: number
}

export interface DashboardStats {
  total_employees: number
  active_employees: number
  on_leave_today: number
  present_today: number
  absent_today: number
  pending_leaves: number
  open_jobs: number
  monthly_payroll: number
}
