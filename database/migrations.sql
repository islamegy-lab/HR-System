-- =============================================
-- HR SYSTEM - كل التحديثات المطلوبة
-- شغّل هذا الملف كاملاً في Supabase SQL Editor
-- =============================================

-- ============================================
-- 1. تحديثات جدول employees
-- ============================================
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ============================================
-- 2. تحديثات جدول attendance (أعمدة الموقع)
-- ============================================
ALTER TABLE attendance
  ADD COLUMN IF NOT EXISTS check_in_lat      DECIMAL(10,8),
  ADD COLUMN IF NOT EXISTS check_in_lng      DECIMAL(11,8),
  ADD COLUMN IF NOT EXISTS check_out_lat     DECIMAL(10,8),
  ADD COLUMN IF NOT EXISTS check_out_lng     DECIMAL(11,8),
  ADD COLUMN IF NOT EXISTS location_verified BOOLEAN DEFAULT FALSE;

-- ============================================
-- 3. جدول الأوراق الرسمية
-- ============================================
CREATE TABLE IF NOT EXISTS employee_documents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id         UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  document_type       VARCHAR(50)  NOT NULL,
  document_name       VARCHAR(200) NOT NULL,
  document_number     VARCHAR(100),
  issue_date          DATE,
  expiry_date         DATE,
  notify_days_before  INTEGER DEFAULT 30,
  file_url            TEXT,
  notes               TEXT,
  status              VARCHAR(20) DEFAULT 'active',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. جدول مواقع الحضور
-- ============================================
CREATE TABLE IF NOT EXISTS attendance_locations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(100) NOT NULL,
  latitude       DECIMAL(10,8) NOT NULL,
  longitude      DECIMAL(11,8) NOT NULL,
  radius_meters  INTEGER DEFAULT 200,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- موقع افتراضي
INSERT INTO attendance_locations (name, latitude, longitude, radius_meters)
VALUES ('المقر الرئيسي', 24.7136, 46.6753, 300)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. جدول إعدادات الشركة (جديد)
-- ============================================
CREATE TABLE IF NOT EXISTS company_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar         VARCHAR(200) NOT NULL DEFAULT 'شركتي',
  name_en         VARCHAR(200),
  logo_url        TEXT,
  address         TEXT,
  phone           VARCHAR(50),
  email           VARCHAR(100),
  website         VARCHAR(200),
  tax_number      VARCHAR(100),
  commercial_reg  VARCHAR(100),
  currency        VARCHAR(10) DEFAULT 'SAR',
  country         VARCHAR(100) DEFAULT 'المملكة العربية السعودية',
  city            VARCHAR(100),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- إدخال صف افتراضي واحد
INSERT INTO company_settings (name_ar, name_en, currency)
VALUES ('شركتي', 'My Company', 'SAR')
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. View للوثائق المنتهية قريباً
-- ============================================
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

-- ============================================
-- 7. RLS Policies
-- ============================================
ALTER TABLE employee_documents   ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_documents"  ON employee_documents;
DROP POLICY IF EXISTS "allow_all_locations"  ON attendance_locations;
DROP POLICY IF EXISTS "allow_all_settings"   ON company_settings;

CREATE POLICY "allow_all_documents"  ON employee_documents   FOR ALL USING (true);
CREATE POLICY "allow_all_locations"  ON attendance_locations FOR ALL USING (true);
CREATE POLICY "allow_all_settings"   ON company_settings     FOR ALL USING (true);

-- ============================================
-- 8. Supabase Storage bucket للوغو والملفات
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('company', 'company', true)
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "allow_all_company"   ON storage.objects;
DROP POLICY IF EXISTS "allow_all_documents" ON storage.objects;

CREATE POLICY "allow_all_company"
  ON storage.objects FOR ALL
  USING (bucket_id = 'company');

CREATE POLICY "allow_all_documents_storage"
  ON storage.objects FOR ALL
  USING (bucket_id = 'documents');

-- ============================================
-- تحقق من النتيجة
-- ============================================
SELECT
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_name = 'company_settings'     AND table_schema = 'public') AS company_settings_exists,
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_name = 'employee_documents'   AND table_schema = 'public') AS employee_documents_exists,
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_name = 'attendance_locations' AND table_schema = 'public') AS attendance_locations_exists,
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_name = 'employees' AND column_name = 'user_id' AND table_schema = 'public') AS user_id_exists,
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_name = 'attendance' AND column_name = 'check_in_lat' AND table_schema = 'public') AS location_cols_exist,
  (SELECT COUNT(*) FROM storage.buckets WHERE id IN ('company','documents')) AS storage_buckets;
