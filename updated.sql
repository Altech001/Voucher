-- Create profiles table if it doesn't exist
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password text not null -- In a real app, this should be a hashed password
);

-- Ensure RLS is enabled on profiles
alter table profiles enable row level security;

-- Drop existing policies for profiles to avoid conflicts, then create new ones
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

-- Insert initial admin user, if it doesn't exist
insert into profiles (username, password) values ('admin', 'admin') on conflict (username) do nothing;


-- Create vouchers table if it doesn't exist
create table if not exists vouchers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  plan_id text not null, -- e.g., 'daily', 'weekly', 'monthly'
  is_used boolean default false,
  used_at timestamptz
);

-- Ensure RLS is enabled on vouchers
alter table vouchers enable row level security;

-- Drop existing policies for vouchers to avoid conflicts, then create new ones
drop policy if exists "Allow public read-only access." on vouchers;
create policy "Allow public read-only access."
  on vouchers for select
  using ( is_used = false );

drop policy if exists "Allow anon to update vouchers." on vouchers;
create policy "Allow anon to update vouchers."
  on vouchers for update
  using ( auth.role() = 'anon' );

drop policy if exists "Allow admin full access." on vouchers;
create policy "Allow admin full access." 
  on vouchers for all 
  using ( (select auth.role()) = 'service_role' );


-- Create purchased_vouchers table if it doesn't exist
create table if not exists purchased_vouchers (
  id uuid primary key default gen_random_uuid(),
  voucher_id uuid not null references vouchers(id),
  phone_number text not null,
  purchased_at timestamptz not null
);

-- Use ALTER TABLE to add the expires_at column if it does not exist
alter table purchased_vouchers add column if not exists expires_at timestamptz not null default now();


-- Ensure RLS is enabled on purchased_vouchers
alter table purchased_vouchers enable row level security;

-- Drop existing policies for purchased_vouchers to avoid conflicts, then create new ones
drop policy if exists "Allow public read-only access." on purchased_vouchers;
create policy "Allow public read-only access."
  on purchased_vouchers for select
  using ( true );

drop policy if exists "Allow anon to insert purchased vouchers." on purchased_vouchers;
create policy "Allow anon to insert purchased vouchers."
  on purchased_vouchers for insert
  with check ( auth.role() = 'anon' );

drop policy if exists "Allow admin full access." on purchased_vouchers;
create policy "Allow admin full access."
  on purchased_vouchers for all
  using ( (select auth.role()) = 'service_role' );

-- Add indexes if they don't exist
create index if not exists idx_vouchers_plan_id_is_used on vouchers (plan_id, is_used);
create index if not exists idx_purchased_vouchers_phone on purchased_vouchers(phone_number);
create index if not exists idx_purchased_vouchers_expires_at on purchased_vouchers(expires_at);
