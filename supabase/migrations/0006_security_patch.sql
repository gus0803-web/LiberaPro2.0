-- RLS Security Patch for beta_waitlist, family_link_codes, and parent_messages

-- 1. Restrict beta_waitlist SELECT to admins only (gus0803@gmail.com)
drop policy if exists "Allow authenticated users to view waitlist" on public.beta_waitlist;

create policy "Allow admins to view waitlist" on public.beta_waitlist
  for select using (auth.email() = 'gus0803@gmail.com');

-- 2. Restrict family_link_codes (was previously public)
drop policy if exists "Anyone can insert link codes" on public.family_link_codes;
drop policy if exists "Anyone can select link codes" on public.family_link_codes;
drop policy if exists "Anyone can update link codes" on public.family_link_codes;

create policy "Teachers can insert link codes" on public.family_link_codes 
  for insert with check (auth.role() = 'authenticated' and auth.uid() = teacher_id);
create policy "Teachers can select their link codes" on public.family_link_codes 
  for select using (auth.role() = 'authenticated' and auth.uid() = teacher_id);
create policy "Teachers can update their link codes" on public.family_link_codes 
  for update using (auth.role() = 'authenticated' and auth.uid() = teacher_id);

-- 3. Restrict parent_messages (was previously public)
drop policy if exists "Anyone can insert parent messages" on public.parent_messages;
drop policy if exists "Anyone can select parent messages" on public.parent_messages;

create policy "Teachers can insert parent messages" on public.parent_messages 
  for insert with check (auth.role() = 'authenticated' and auth.uid() = teacher_id);
create policy "Teachers can select their parent messages" on public.parent_messages 
  for select using (auth.role() = 'authenticated' and auth.uid() = teacher_id);

-- 4. Enforce string length constraints at the database level for beta_waitlist to prevent spam
alter table public.beta_waitlist 
  add constraint beta_waitlist_name_length check (char_length(full_name) <= 150),
  add constraint beta_waitlist_email_length check (char_length(email) <= 150),
  add constraint beta_waitlist_school_length check (char_length(school) <= 200);
