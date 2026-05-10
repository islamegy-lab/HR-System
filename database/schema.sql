-- =============================================
-- HR SYSTEM - COMPLETE DATABASE SCHEMA
-- =============================================

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100),
  manager_id UUID,
  parent_id UUID REFERENCES departments(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE job_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,
  title_ar VARCHAR(100),
  department_id UUID REFERENCES departments(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_number VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  first_name_ar VARCHAR(50),
  last_name_ar VARCHAR(50),
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  national_id VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10),
  marital_status VARCHAR(20),
  nationality VARCHAR(50),
  address TEXT,
  photo_url TEXT,
  department_id UUID REFERENCES departments(id),
  job_position_id UUID REFERENCES job_positions(id),
  manager_id UUID REFERENCES employees(id),
  hire_date DATE NOT NULL,
  contract_type VARCHAR(30) DEFAULT 'full_time',
  status VARCHAR(20) DEFAULT 'active',
  basic_salary DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE departments ADD CONSTRAINT fk_dept_manager
  FOREIGN KEY (manager_id) REFERENCES employees(id);

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  work_hours DECIMAL(4,2),
  status VARCHAR(20) DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

CREATE TABLE leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  name_ar VARCHAR(50),
  days_per_year INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT TRUE,
  color VARCHAR(7) DEFAULT '#3B82F6'
);

CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id UUID REFERENCES leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INTEGER NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  basic_salary DECIMAL(12,2) NOT NULL,
  housing_allowance DECIMAL(12,2) DEFAULT 0,
  transport_allowance DECIMAL(12,2) DEFAULT 0,
  other_allowances DECIMAL(12,2) DEFAULT 0,
  overtime_pay DECIMAL(12,2) DEFAULT 0,
  deductions DECIMAL(12,2) DEFAULT 0,
  tax DECIMAL(12,2) DEFAULT 0,
  net_salary DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

CREATE TABLE performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES employees(id),
  review_period VARCHAR(20),
  review_date DATE NOT NULL,
  score DECIMAL(3,1),
  goals_score DECIMAL(3,1),
  skills_score DECIMAL(3,1),
  behavior_score DECIMAL(3,1),
  comments TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE recruitment_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,
  department_id UUID REFERENCES departments(id),
  positions_count INTEGER DEFAULT 1,
  description TEXT,
  requirements TEXT,
  status VARCHAR(20) DEFAULT 'open',
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES recruitment_jobs(id) ON DELETE CASCADE,
  applicant_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  cv_url TEXT,
  stage VARCHAR(30) DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE training_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  trainer VARCHAR(100),
  start_date DATE,
  end_date DATE,
  location VARCHAR(100),
  max_participants INTEGER,
  status VARCHAR(20) DEFAULT 'planned',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE training_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id UUID REFERENCES training_programs(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'enrolled',
  completion_date DATE,
  score DECIMAL(5,2),
  UNIQUE(training_id, employee_id)
);

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES employees(id),
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEED DATA
INSERT INTO departments (id, name, name_ar) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Human Resources', 'الموارد البشرية'),
  ('d1000000-0000-0000-0000-000000000002', 'Information Technology', 'تقنية المعلومات'),
  ('d1000000-0000-0000-0000-000000000003', 'Finance', 'المالية'),
  ('d1000000-0000-0000-0000-000000000004', 'Operations', 'العمليات'),
  ('d1000000-0000-0000-0000-000000000005', 'Marketing', 'التسويق');

INSERT INTO leave_types (name, name_ar, days_per_year, is_paid, color) VALUES
  ('Annual Leave', 'إجازة سنوية', 21, TRUE, '#3B82F6'),
  ('Sick Leave', 'إجازة مرضية', 14, TRUE, '#EF4444'),
  ('Emergency Leave', 'إجازة طارئة', 3, TRUE, '#F59E0B'),
  ('Unpaid Leave', 'إجازة بدون راتب', 30, FALSE, '#6B7280'),
  ('Maternity Leave', 'إجازة أمومة', 90, TRUE, '#EC4899');

INSERT INTO job_positions (title, title_ar, department_id) VALUES
  ('HR Manager', 'مدير الموارد البشرية', 'd1000000-0000-0000-0000-000000000001'),
  ('HR Specialist', 'أخصائي موارد بشرية', 'd1000000-0000-0000-0000-000000000001'),
  ('Software Engineer', 'مهندس برمجيات', 'd1000000-0000-0000-0000-000000000002'),
  ('IT Manager', 'مدير تقنية المعلومات', 'd1000000-0000-0000-0000-000000000002'),
  ('Accountant', 'محاسب', 'd1000000-0000-0000-0000-000000000003'),
  ('Finance Manager', 'مدير مالي', 'd1000000-0000-0000-0000-000000000003');
