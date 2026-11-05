-- ============================================================
-- Big House — Liste de prix
-- Paste this entire file into: Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1) Products table (admin can add / edit / delete / rename)
create table if not exists public.products (
  id            bigserial primary key,
  name          text not null,
  slug          text,
  category      text not null default '',
  price         numeric(12, 3) not null default 0 check (price >= 0),
  image_url     text,
  sort_order    integer not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists products_sort_order_idx on public.products (sort_order);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_name_idx on public.products using gin (to_tsvector('simple', name));

-- Keep updated_at fresh on every change
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

-- 2) Company info (header of the dashboard)
create table if not exists public.company_info (
  id               smallint primary key default 1 check (id = 1),
  brand_name       text not null default 'Big House',
  tagline          text default 'Papeterie & Fournitures',
  address          text default 'BigHouse, Rue Ibn Khaldoun, Ariana 2050',
  phone            text default '+216 52 271 887',
  email            text default 'bighousetunisia@gmail.com',
  fiscal_id        text default '1992556H/C/N/000',
  logo_url         text,
  updated_at       timestamptz not null default now()
);

insert into public.company_info (id)
values (1)
on conflict (id) do nothing;

-- 3) Storage bucket for product pictures
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- 4) Row Level Security
alter table public.products enable row level security;
alter table public.company_info enable row level security;

-- Anyone can READ the catalogue (public price list)
drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
  on public.products
  for select
  to anon, authenticated
  using (is_active = true or auth.role() = 'authenticated');

-- Only logged-in ADMIN can INSERT / UPDATE / DELETE
drop policy if exists "Admin can insert products" on public.products;
create policy "Admin can insert products"
  on public.products
  for insert
  to authenticated
  with check (true);

drop policy if exists "Admin can update products" on public.products;
create policy "Admin can update products"
  on public.products
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admin can delete products" on public.products;
create policy "Admin can delete products"
  on public.products
  for delete
  to authenticated
  using (true);

-- Company info: public read, admin write
drop policy if exists "Public can read company info" on public.company_info;
create policy "Public can read company info"
  on public.company_info
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Admin can update company info" on public.company_info;
create policy "Admin can update company info"
  on public.company_info
  for update
  to authenticated
  using (true)
  with check (true);

-- 5) Storage policies (product-images bucket)
drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "Admin upload product images" on storage.objects;
create policy "Admin upload product images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "Admin update product images" on storage.objects;
create policy "Admin update product images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

drop policy if exists "Admin delete product images" on storage.objects;
create policy "Admin delete product images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'product-images');

-- 6) Helpful view for the dashboard (ordered catalogue)
create or replace view public.catalogue as
select
  id,
  name,
  slug,
  category,
  price,
  image_url,
  sort_order,
  created_at,
  updated_at
from public.products
where is_active = true
order by sort_order asc, id asc;

-- ============================================================
-- AFTER RUNNING THIS FILE:
-- 1) Authentication → Users → Add user
--    Email:    bighousetunisia@gmail.com   (or your admin email)
--    Password: tarekadmin
--    Auto Confirm User: ON
-- 2) Project Settings → API → copy URL + anon key into .env
-- 3) Run seed.sql (optional) to import existing products
-- ============================================================
