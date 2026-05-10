-- =============================================
-- جدول ملفات المستخدمين مع الأدوار
-- =============================================

create table if not exists user_profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  employee_id uuid references employees(id) on delete set null,
  email       text,
  role        text not null default 'employee'
                check (role in ('super_admin','hr_manager','hr_staff','employee')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create unique index if not exists user_profiles_user_id_idx on user_profiles(user_id);

-- =============================================
-- جدول صلاحيات الأدوار
-- =============================================

create table if not exists role_permissions (
  id          uuid primary key default gen_random_uuid(),
  role        text not null unique
                check (role in ('super_admin','hr_manager','hr_staff','employee')),
  permissions text[] not null default '{}',
  updated_at  timestamptz not null default now()
);

-- إدراج الصلاحيات الافتراضية
insert into role_permissions (role, permissions) values
  ('super_admin', array['employees.view','employees.create','employees.edit','employees.delete','payroll.view','payroll.manage','leaves.view','leaves.approve','attendance.view','attendance.manage','documents.view','documents.manage','recruitment.view','recruitment.manage','reports.view','settings.manage','roles.manage']),
  ('hr_manager',  array['employees.view','employees.create','employees.edit','employees.delete','payroll.view','payroll.manage','leaves.view','leaves.approve','attendance.view','attendance.manage','documents.view','documents.manage','recruitment.view','recruitment.manage','reports.view']),
  ('hr_staff',    array['employees.view','leaves.view','leaves.approve','attendance.view','attendance.manage','documents.view']),
  ('employee',    array[]::text[])
on conflict (role) do nothing;

-- =============================================
-- Trigger: إنشاء user_profile تلقائياً عند إنشاء مستخدم
-- =============================================

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into user_profiles (user_id, email, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'employee')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =============================================
-- RLS
-- =============================================

alter table user_profiles enable row level security;
alter table role_permissions enable row level security;

create policy "authenticated read user_profiles"
  on user_profiles for select to authenticated using (true);

create policy "authenticated read role_permissions"
  on role_permissions for select to authenticated using (true);

create policy "super_admin manage user_profiles"
  on user_profiles for all to authenticated using (true) with check (true);

create policy "super_admin manage role_permissions"
  on role_permissions for all to authenticated using (true) with check (true);
