-- 1. Create roles table
create table if not exists public.roles (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create user_roles table
create table if not exists public.user_roles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  role_id uuid references public.roles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, role_id)
);

-- 3. Insert default roles
insert into public.roles (name) values
  ('superadmin'),
  ('admin'),
  ('scheduling-admin'),
  ('catalog-admin'),
  ('supplier-admin'),
  ('supplier-user'),
  ('security'),
  ('guest')
on conflict (name) do nothing;

-- 4. Enable RLS
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;

create policy "Roles are viewable by everyone" on public.roles for select using (true);
create policy "User roles are viewable by everyone" on public.user_roles for select using (true);
