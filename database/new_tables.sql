-- =============================================
-- جداول جديدة - الأوراق الرسمية والحضور بالموقع
-- =============================================

-- جدول الأوراق الرسمية للموظفين
CREATE TABLE IF NOT EXISTS employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  document_name VARCHAR(200) NOT NULL,
  document_number VARCHAR(100),
  issue_date DATE,
  expiry_date DATE,
  notify_days_before INTEGER DEFAULT 30,
  file_url TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول إعدادات الحضور بالموقع
CREATE TABLE IF NOT EXISTS attendance_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius_meters INTEGER DEFAULT 200,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إضافة أعمدة الموقع لجدول الحضور
ALTER TABLE attendance
  ADD COLUMN IF NOT EXISTS check_in_lat DECIMAL(10,8),
  ADD COLUMN IF NOT EXISTS check_in_lng DECIMAL(11,8),
  ADD COLUMN IF NOT EXISTS check_out_lat DECIMAL(10,8),
  ADD COLUMN IF NOT EXISTS check_out_lng DECIMAL(11,8),
  ADD COLUMN IF NOT EXISTS location_verified BOOLEAN DEFAULT FALSE;

-- إضافة user_id للموظفين لربطهم بـ Supabase Auth
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- إضافة موقع افتراضي (الرياض - مثال)
INSERT INTO attendance_locations (name, latitude, longitude, radius_meters)
VALUES ('المقر الرئيسي', 24.7136, 46.6753, 300)
ON CONFLICT DO NOTHING;

-- View لتنبيهات الوثائق المنتهية قريباً
CREATE OR REPLACE VIEW expiring_documents AS
SELECT
  d.*,
  e.first_name,
  e.last_name,
  e.employee_number,
  e.email,
  (d.expiry_date - CURRENT_DATE) AS days_remaining
FROM employee_documents d
JOIN employees e ON e.id = d.employee_id
WHERE
  d.expiry_date IS NOT NULL
  AND d.status = 'active'
  AND (d.expiry_date - CURRENT_DATE) <= d.notify_days_before
  AND (d.expiry_date - CURRENT_DATE) >= 0
ORDER BY d.expiry_date ASC;

-- RLS Policies
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_documents" ON employee_documents FOR ALL USING (true);
CREATE POLICY "allow_all_locations" ON attendance_locations FOR ALL USING (true);
