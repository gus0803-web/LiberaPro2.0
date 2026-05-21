-- Add beta expiration fields and enforce beta expiry in RLS policies
alter table public.profiles
  add column if not exists beta_tester boolean default false not null,
  add column if not exists beta_expires_at timestamp with time zone;

create or replace function public.is_active_user()
returns boolean
language sql stable as $$
  select coalesce(not (beta_tester and beta_expires_at is not null and beta_expires_at <= timezone('utc', now())), true)
  from public.profiles
  where id = auth.uid();
$$;

-- Profiles: only active users can access their own profile
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (
  auth.uid() = id and public.is_active_user()
);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (
  auth.uid() = id and public.is_active_user()
);

-- User devices: only active users can manage their own devices
drop policy if exists "Users can view own devices" on public.user_devices;
create policy "Users can view own devices" on public.user_devices for select using (
  auth.uid() = user_id and public.is_active_user()
);

drop policy if exists "Users can insert own devices" on public.user_devices;
create policy "Users can insert own devices" on public.user_devices for insert with check (
  auth.uid() = user_id and public.is_active_user()
);

drop policy if exists "Users can update own devices" on public.user_devices;
create policy "Users can update own devices" on public.user_devices for update using (
  auth.uid() = user_id and public.is_active_user()
);

drop policy if exists "Users can delete own devices" on public.user_devices;
create policy "Users can delete own devices" on public.user_devices for delete using (
  auth.uid() = user_id and public.is_active_user()
);

-- User generations: only active users can manage their own generation history
drop policy if exists "Users can view own generations" on public.user_generations;
create policy "Users can view own generations" on public.user_generations for select using (
  auth.uid() = user_id and public.is_active_user()
);

drop policy if exists "Users can insert own generations" on public.user_generations;
create policy "Users can insert own generations" on public.user_generations for insert with check (
  auth.uid() = user_id and public.is_active_user()
);

drop policy if exists "Users can update own generations" on public.user_generations;
create policy "Users can update own generations" on public.user_generations for update using (
  auth.uid() = user_id and public.is_active_user()
);

drop policy if exists "Users can delete own generations" on public.user_generations;
create policy "Users can delete own generations" on public.user_generations for delete using (
  auth.uid() = user_id and public.is_active_user()
);

-- Curriculum: only authenticated active users can read curriculum
drop policy if exists "Authenticated users can read curriculum" on public.nem_curriculum;
create policy "Authenticated users can read curriculum" on public.nem_curriculum for select using (
  auth.role() = 'authenticated' and public.is_active_user()
);
