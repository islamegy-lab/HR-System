-- إضافة أعمدة جديدة لجدول role_permissions
alter table role_permissions
  add column if not exists label_ar  text,
  add column if not exists color     text default '#2563eb',
  add column if not exists bg        text default '#eff6ff',
  add column if not exists created_at timestamptz not null default now();

-- تحديث الأدوار الموجودة بالتسميات العربية والألوان
update role_permissions set label_ar = 'مدير النظام',           color = '#7c3aed', bg = '#faf5ff' where role = 'super_admin';
update role_permissions set label_ar = 'مدير الموارد البشرية',  color = '#2563eb', bg = '#eff6ff' where role = 'hr_manager';
update role_permissions set label_ar = 'موظف HR',               color = '#0d9488', bg = '#f0fdfa' where role = 'hr_staff';
update role_permissions set label_ar = 'موظف',                  color = '#64748b', bg = '#f8fafc' where role = 'employee';
