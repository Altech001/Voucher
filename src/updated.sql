-- Create profiles table
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password text not null -- In a real app, this should be a hashed password
);
-- RLS for profiles table
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );
create policy "Allow admin users to insert."
  on profiles for insert
  with check ( (select auth.role()) = 'service_role' );


-- Insert initial admin user, if it doesn't exist
insert into profiles (username, password) values ('admin', 'admin') on conflict (username) do nothing;


-- Create vouchers table
create table if not exists vouchers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  plan_id text not null, -- e.g., 'daily', 'weekly', 'monthly'
  is_used boolean default false,
  used_at timestamptz
);
-- RLS for vouchers table
alter table vouchers enable row level security;
create policy "Allow public read-only access." 
  on vouchers for select 
  using ( true );

-- Allow anonymous users to update the is_used flag
create policy "Allow anon users to purchase vouchers."
  on vouchers for update
  using ( auth.role() = 'anon' )
  with check ( auth.role() = 'anon' );

create policy "Allow admin full access." 
  on vouchers for all 
  using ( (select auth.role()) = 'service_role' );


-- Create purchased_vouchers table
create table if not exists purchased_vouchers (
  id uuid primary key default gen_random_uuid(),
  voucher_id uuid not null references vouchers(id),
  phone_number text not null,
  purchased_at timestamptz not null,
  expires_at timestamptz not null
);
-- RLS for purchased_vouchers table
alter table purchased_vouchers enable row level security;
create policy "Allow public read-only access."
  on purchased_vouchers for select
  using ( true );

-- Allow anonymous users to insert their purchase
create policy "Allow anon users to record their purchase."
  on purchased_vouchers for insert
  with check ( auth.role() = 'anon' );

create policy "Allow admin full access."
  on purchased_vouchers for all
  using ( (select auth.role()) = 'service_role' );

-- Add indexes
create index if not exists idx_purchased_vouchers_phone on purchased_vouchers(phone_number);
create index if not exists idx_purchased_vouchers_expires_at on purchased_vouchers(expires_at);
