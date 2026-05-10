-- أولاً: اجلب الـ user_id من Auth
SELECT id, email FROM auth.users LIMIT 10;

-- ثانياً: أنشئ سجل الموظف للـ admin
-- استبدل 'YOUR_USER_ID' بالـ id من الاستعلام أعلاه
INSERT INTO employees (
  employee_number,
  first_name,
  last_name,
  email,
  hire_date,
  contract_type,
  status,
  role,
  user_id
) VALUES (
  'EMP-001',
  'مدير',
  'النظام',
  'admin@hr.com',       -- غيّر للبريد الفعلي
  CURRENT_DATE,
  'full_time',
  'active',
  'admin',
  'YOUR_USER_ID'        -- غيّر لـ id من الاستعلام أعلاه
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  user_id = EXCLUDED.user_id;
