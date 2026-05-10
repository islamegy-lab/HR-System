-- إضافة أعمدة إعدادات النظام والإشعارات لجدول company_settings
alter table company_settings
  add column if not exists language               text default 'ar',
  add column if not exists timezone              text default 'Asia/Riyadh',
  add column if not exists week_start            text default 'sunday',
  add column if not exists date_format           text default 'ar-SA',
  add column if not exists notify_leave_request   boolean default true,
  add column if not exists notify_leave_approved  boolean default true,
  add column if not exists notify_payroll         boolean default true,
  add column if not exists notify_new_employee    boolean default true,
  add column if not exists notify_document_expiry boolean default true,
  add column if not exists notify_weekly_report   boolean default true;
