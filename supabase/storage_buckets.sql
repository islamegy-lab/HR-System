-- =============================================
-- إنشاء كل الـ Buckets في Supabase Storage
-- شغّل هذا في: Supabase → SQL Editor
-- =============================================

-- 1. صور الموظفين (الصورة الشخصية)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars', 'avatars', true,
  5242880, -- 5MB
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do nothing;

-- 2. وثائق الموظفين (PDF، صور، Word)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents', 'documents', true,
  20971520, -- 20MB
  array['application/pdf','image/jpeg','image/png','image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do nothing;

-- 3. شعار الشركة
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'company', 'company', true,
  5242880, -- 5MB
  array['image/jpeg','image/png','image/webp','image/svg+xml']
)
on conflict (id) do nothing;

-- =============================================
-- RLS Policies - السماح للمستخدمين المسجلين
-- =============================================

-- avatars: قراءة عامة + رفع للمسجلين
create policy "public read avatars"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "authenticated upload avatars"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars');

create policy "authenticated update avatars"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars');

create policy "authenticated delete avatars"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars');

-- documents: قراءة عامة + رفع للمسجلين
create policy "public read documents"
  on storage.objects for select using (bucket_id = 'documents');

create policy "authenticated upload documents"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'documents');

create policy "authenticated update documents"
  on storage.objects for update to authenticated
  using (bucket_id = 'documents');

create policy "authenticated delete documents"
  on storage.objects for delete to authenticated
  using (bucket_id = 'documents');

-- company: قراءة عامة + رفع للمسجلين
create policy "public read company"
  on storage.objects for select using (bucket_id = 'company');

create policy "authenticated upload company"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'company');

create policy "authenticated update company"
  on storage.objects for update to authenticated
  using (bucket_id = 'company');

create policy "authenticated delete company"
  on storage.objects for delete to authenticated
  using (bucket_id = 'company');
