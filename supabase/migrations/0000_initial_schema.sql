-- Enable pgvector extension for RAG
create extension if not exists vector;

-- Create Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  stripe_customer_id text,
  subscription_status text default 'inactive',
  state text,
  time_saved_hours integer default 0,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create User Devices Table (For FingerprintJS hardware locking)
create table if not exists public.user_devices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  fingerprint_hash text not null,
  last_active timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, fingerprint_hash)
);

-- Create NEM Curriculum Table (The "Brain")
create table if not exists public.nem_curriculum (
  id uuid default gen_random_uuid() primary key,
  fase text not null,
  proyecto text not null,
  eje_articulador text not null,
  pda_text text not null,
  book_reference text not null,
  page integer,
  url text,
  embedding vector(1536)
);

-- Create User Generations Table (History of plans/exams)
create table if not exists public.user_generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('planeacion', 'examen')),
  content jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.user_devices enable row level security;
alter table public.nem_curriculum enable row level security;
alter table public.user_generations enable row level security;

-- Profiles: Users can read and update their own profile
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- User Devices: Users can read and manage their own devices
drop policy if exists "Users can view own devices" on public.user_devices;
create policy "Users can view own devices" on public.user_devices for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own devices" on public.user_devices;
create policy "Users can insert own devices" on public.user_devices for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own devices" on public.user_devices;
create policy "Users can update own devices" on public.user_devices for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own devices" on public.user_devices;
create policy "Users can delete own devices" on public.user_devices for delete using (auth.uid() = user_id);

-- NEM Curriculum: Publicly readable for authenticated users (or anonymous if needed, here authenticated)
drop policy if exists "Authenticated users can read curriculum" on public.nem_curriculum;
create policy "Authenticated users can read curriculum" on public.nem_curriculum for select using (auth.role() = 'authenticated');

-- User Generations: Users can read, insert, update, delete their own generations
drop policy if exists "Users can view own generations" on public.user_generations;
create policy "Users can view own generations" on public.user_generations for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own generations" on public.user_generations;
create policy "Users can insert own generations" on public.user_generations for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own generations" on public.user_generations;
create policy "Users can update own generations" on public.user_generations for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own generations" on public.user_generations;
create policy "Users can delete own generations" on public.user_generations for delete using (auth.uid() = user_id);

-- Trigger to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert current user
insert into public.profiles (id, full_name, subscription_status)
select id, raw_user_meta_data->>'full_name', 'active'
from auth.users
where id not in (select id from public.profiles);
