-- Migration 0008: Credits, Admin Status, and Parent Replies

-- Add credits and is_admin to profiles
alter table public.profiles 
add column if not exists credits integer default 15,
add column if not exists is_admin boolean default false;

-- Table for parent replies to notices
create table if not exists public.parent_replies (
  id uuid default gen_random_uuid() primary key,
  message_id uuid references public.parent_messages(id) on delete cascade not null,
  student_link_code text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.parent_replies enable row level security;

-- Policies for parent_replies
create policy "Anyone can insert parent replies" on public.parent_replies for insert with check (char_length(content) <= 100);
create policy "Anyone can select parent replies" on public.parent_replies for select using (true);

-- Enable Realtime
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'parent_replies'
  ) then
    alter publication supabase_realtime add table public.parent_replies;
  end if;
end $$;
