-- =============================================
-- نظام الأدوار والصلاحيات
-- =============================================

-- إضافة عمود role لجدول employees
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'employee';

-- القيم المسموحة: 'admin' | 'hr_manager' | 'manager' | 'employee'
-- admin       → وصول كامل للإدارة
-- hr_manager  → وصول كامل للإدارة
-- manager     → وصول للإدارة (مدير قسم)
-- employee    → بوابة الموظف فقط

-- تحديث الموظفين الحاليين (إذا وجدوا)
UPDATE employees SET role = 'employee' WHERE role IS NULL;

-- تحقق
SELECT id, first_name, last_name, email, role FROM employees LIMIT 10;
