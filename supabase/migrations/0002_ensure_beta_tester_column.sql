-- Ensure beta tester columns exist on profiles
alter table public.profiles
  add column if not exists beta_tester boolean default false not null,
  add column if not exists beta_expires_at timestamp with time zone;

-- Note: If your Supabase project uses migrations via the Supabase CLI, run the migration
-- with the CLI or apply the SQL directly to your database. See instructions below.