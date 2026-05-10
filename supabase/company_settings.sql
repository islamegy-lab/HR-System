-- =============================================
-- جدول إعدادات الشركة (company_settings)
-- =============================================

create table if not exists company_settings (
  id               uuid primary key default gen_random_uuid(),
  name_ar          text not null default 'شركتي',
  name_en          text,
  logo_url         text,
  address          text,
  city             text,
  country          text default 'المملكة العربية السعودية',
  phone            text,
  email            text,
  website          text,
  tax_number       text,
  commercial_reg   text,
  currency         text not null default 'SAR',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- إدراج صف واحد افتراضي إن لم يكن موجوداً
insert into company_settings (name_ar, currency)
select 'شركتي', 'SAR'
where not exists (select 1 from company_settings);

-- =============================================
-- إذا كان الجدول موجوداً بالفعل وتحتاج فقط
-- إضافة عمود currency
-- =============================================

-- alter table company_settings
--   add column if not exists currency text not null default 'SAR';

-- =============================================
-- RLS (Row Level Security)
-- =============================================

alter table company_settings enable row level security;

-- السماح للمستخدمين المسجلين بالقراءة
create policy "authenticated can read company_settings"
  on company_settings for select
  to authenticated
  using (true);

-- السماح للمستخدمين المسجلين بالتعديل
create policy "authenticated can update company_settings"
  on company_settings for update
  to authenticated
  using (true)
  with check (true);
