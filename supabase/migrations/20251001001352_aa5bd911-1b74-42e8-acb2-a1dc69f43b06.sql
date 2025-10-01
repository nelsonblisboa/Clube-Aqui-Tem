-- Create partners table to store partner registrations
create table public.partners (
  id uuid primary key default gen_random_uuid(),
  estabelecimento text not null,
  responsavel text not null,
  telefone text not null,
  email text not null,
  endereco text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.partners enable row level security;

-- Policy: Anyone can insert (for form submission)
create policy "Anyone can insert partners"
  on public.partners
  for insert
  to anon, authenticated
  with check (true);

-- Policy: Only authenticated users can view
create policy "Authenticated users can view partners"
  on public.partners
  for select
  to authenticated
  using (true);

-- Create index for email lookups
create index partners_email_idx on public.partners(email);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger partners_updated_at
  before update on public.partners
  for each row
  execute function public.handle_updated_at();

-- Create profiles table for user metadata
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policy: Users can view their own profile
create policy "Users can view own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Policy: Users can update their own profile
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id);

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create updated_at trigger for profiles
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();