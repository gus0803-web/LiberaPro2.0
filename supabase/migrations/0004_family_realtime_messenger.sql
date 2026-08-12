-- Migration 0004: Family Realtime Messenger Tables & Supabase Realtime Enablement

-- Create Family Link Codes Table (Student Salon Link Codes)
create table if not exists public.family_link_codes (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references public.profiles(id) on delete cascade,
  school_name text not null,
  grade_group text not null,
  shift text not null,
  student_name text not null,
  parent_name text,
  link_code text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Parent Messages Table (Realtime Announcements Feed)
create table if not exists public.parent_messages (
  id uuid default gen_random_uuid() primary key,
  sender_teacher_id uuid references public.profiles(id) on delete cascade,
  school_name text not null,
  grade_group text not null,
  shift text not null,
  student_link_code text, -- Null for group broadcast, or specific link_code for targeted student
  category text not null check (category in ('recordatorio', 'materiales', 'tareas', 'actividades')),
  title text not null,
  due_date text,
  details text,
  formatted_content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.family_link_codes enable row level security;
alter table public.parent_messages enable row level security;

-- Policies for family_link_codes (Allow insert & select for all to guarantee real-time pairing)
drop policy if exists "Teachers can manage their student link codes" on public.family_link_codes;
drop policy if exists "Public can verify link codes" on public.family_link_codes;
drop policy if exists "Anyone can insert link codes" on public.family_link_codes;
drop policy if exists "Anyone can select link codes" on public.family_link_codes;

create policy "Anyone can insert link codes" on public.family_link_codes for insert with check (true);
create policy "Anyone can select link codes" on public.family_link_codes for select using (true);
create policy "Anyone can update link codes" on public.family_link_codes for update using (true);

-- Policies for parent_messages (Allow insert & select for all to guarantee real-time delivery)
drop policy if exists "Teachers can manage their posted messages" on public.parent_messages;
drop policy if exists "Public can read posted parent messages" on public.parent_messages;
drop policy if exists "Anyone can insert parent messages" on public.parent_messages;
drop policy if exists "Anyone can select parent messages" on public.parent_messages;

create policy "Anyone can insert parent messages" on public.parent_messages for insert with check (true);
create policy "Anyone can select parent messages" on public.parent_messages for select using (true);

-- Enable Supabase Realtime for parent_messages and family_link_codes
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'parent_messages'
  ) then
    alter publication supabase_realtime add table public.parent_messages;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'family_link_codes'
  ) then
    alter publication supabase_realtime add table public.family_link_codes;
  end if;
end $$;
