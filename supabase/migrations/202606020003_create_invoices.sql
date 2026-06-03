-- User-owned invoices and their line items. Inventory and payment tracking are
-- intentionally outside the BillFlow MVP scope.
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  invoice_number text not null check (char_length(invoice_number) between 1 and 50),
  invoice_date date not null default current_date,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  notes text check (notes is null or char_length(notes) <= 2000),
  currency char(3) not null default 'INR',
  -- Preserve the issued document even if profile records change later.
  business_name text not null,
  business_phone text,
  business_email text,
  business_address text,
  business_gst_number text,
  customer_name text not null,
  customer_phone text,
  customer_email text,
  customer_address text,
  subtotal numeric(14, 2) not null default 0 check (subtotal >= 0),
  tax_rate numeric(7, 4) not null default 0 check (tax_rate >= 0),
  tax_total numeric(14, 2) not null default 0 check (tax_total >= 0),
  discount_total numeric(14, 2) not null default 0 check (discount_total >= 0),
  grand_total numeric(14, 2) not null default 0 check (grand_total >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, invoice_number)
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  item_name text not null check (char_length(item_name) between 1 and 200),
  quantity numeric(12, 3) not null check (quantity > 0),
  rate numeric(14, 2) not null check (rate >= 0),
  line_total numeric(14, 2) not null check (line_total >= 0),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists invoices_user_created_at_idx
on public.invoices (user_id, created_at desc);

create index if not exists invoices_user_status_idx
on public.invoices (user_id, status);

create index if not exists invoices_customer_id_idx
on public.invoices (customer_id);

create index if not exists invoice_items_invoice_sort_order_idx
on public.invoice_items (invoice_id, sort_order);

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

drop trigger if exists invoice_items_set_updated_at on public.invoice_items;
create trigger invoice_items_set_updated_at
before update on public.invoice_items
for each row execute function public.set_updated_at();

alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

create policy "Users can view their own invoices"
on public.invoices for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own invoices"
on public.invoices for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own invoices"
on public.invoices for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own invoices"
on public.invoices for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can view items for their own invoices"
on public.invoice_items for select to authenticated
using (
  exists (
    select 1 from public.invoices
    where invoices.id = invoice_items.invoice_id
      and invoices.user_id = (select auth.uid())
  )
);

create policy "Users can create items for their own invoices"
on public.invoice_items for insert to authenticated
with check (
  exists (
    select 1 from public.invoices
    where invoices.id = invoice_items.invoice_id
      and invoices.user_id = (select auth.uid())
  )
);

create policy "Users can update items for their own invoices"
on public.invoice_items for update to authenticated
using (
  exists (
    select 1 from public.invoices
    where invoices.id = invoice_items.invoice_id
      and invoices.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.invoices
    where invoices.id = invoice_items.invoice_id
      and invoices.user_id = (select auth.uid())
  )
);

create policy "Users can delete items for their own invoices"
on public.invoice_items for delete to authenticated
using (
  exists (
    select 1 from public.invoices
    where invoices.id = invoice_items.invoice_id
      and invoices.user_id = (select auth.uid())
  )
);
