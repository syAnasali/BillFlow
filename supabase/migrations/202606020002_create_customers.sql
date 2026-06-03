-- User-owned customer contacts used when preparing invoices.
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  phone text check (phone is null or char_length(phone) <= 30),
  email text check (email is null or char_length(email) <= 254),
  address text check (address is null or char_length(address) <= 500),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists customers_user_created_at_idx
on public.customers (user_id, created_at desc);

create index if not exists customers_user_name_idx
on public.customers (user_id, name);

drop trigger if exists customers_set_updated_at on public.customers;

create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

alter table public.customers enable row level security;

create policy "Users can view their own customers"
on public.customers
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own customers"
on public.customers
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own customers"
on public.customers
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own customers"
on public.customers
for delete
to authenticated
using ((select auth.uid()) = user_id);
