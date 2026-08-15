create table if not exists public.beta_waitlist (
    id uuid default gen_random_uuid() primary key,
    full_name text not null,
    email text not null unique,
    school text,
    status text default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies
alter table public.beta_waitlist enable row level security;

-- Allow anonymous inserts (so anyone can join the waitlist)
create policy "Allow anonymous inserts" on public.beta_waitlist
    for insert
    to anon, authenticated
    with check (true);

-- Only authenticated users (admins) can view the waitlist
create policy "Allow authenticated users to view waitlist" on public.beta_waitlist
    for select
    to authenticated
    using (true);
