-- One invoice-issuing business profile per authenticated BillFlow user.
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  phone text check (phone is null or char_length(phone) <= 30),
  email text check (email is null or char_length(email) <= 254),
  address text check (address is null or char_length(address) <= 500),
  gst_number text check (gst_number is null or char_length(gst_number) <= 30),
  logo_url text check (logo_url is null or char_length(logo_url) <= 2048),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists businesses_set_updated_at on public.businesses;

create trigger businesses_set_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

alter table public.businesses enable row level security;

create policy "Users can view their own business"
on public.businesses
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own business"
on public.businesses
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own business"
on public.businesses
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
