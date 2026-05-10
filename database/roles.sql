-- أضف عمود role لجدول employees
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'employee';

-- تحديث الموظفين الحاليين
UPDATE employees SET role = 'employee' WHERE role IS NULL;

-- تحقق
SELECT id, first_name, last_name, email, role FROM employees LIMIT 10;
