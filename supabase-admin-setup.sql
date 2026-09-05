-- Run this in the Supabase SQL editor.
-- Required for gen_random_uuid() used in the admin table.
create extension if not exists pgcrypto;

-- ==========================================================
-- Public storage bucket for admin proof uploads / previews
-- ==========================================================
-- Bucket name is intentionally fixed and public so uploaded files can
-- always be previewed through the public URL without requiring auth.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('prof-upload', 'prof-upload', true, 5242880, ARRAY['image/png','image/jpeg','image/jpg','image/webp','application/pdf'])
on conflict (id) do update
set public = true,
    file_size_limit = 5242880,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-files', 'product-files', false, 52428800, ARRAY['application/pdf','application/zip','application/octet-stream','image/png','image/jpeg','image/webp'])
on conflict (id) do update
set public = false,
    file_size_limit = 52428800,
    allowed_mime_types = excluded.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'public preview for prof upload files'
  ) THEN
    EXECUTE 'CREATE POLICY "public preview for prof upload files" ON storage.objects FOR SELECT USING (bucket_id = ''prof-upload'');';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'authenticated upload to prof upload bucket'
  ) THEN
    EXECUTE 'CREATE POLICY "authenticated upload to prof upload bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''prof-upload'' AND auth.role() = ''authenticated'');';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'guest upload payment proof files'
  ) THEN
    EXECUTE 'CREATE POLICY "guest upload payment proof files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''prof-upload'' AND (storage.foldername(name))[1] = ''orders'');';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'authenticated update to prof upload bucket'
  ) THEN
    EXECUTE 'CREATE POLICY "authenticated update to prof upload bucket" ON storage.objects FOR UPDATE USING (bucket_id = ''prof-upload'' AND auth.role() = ''authenticated'') WITH CHECK (bucket_id = ''prof-upload'' AND auth.role() = ''authenticated'');';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'authenticated delete from prof upload bucket'
  ) THEN
    EXECUTE 'CREATE POLICY "authenticated delete from prof upload bucket" ON storage.objects FOR DELETE USING (bucket_id = ''prof-upload'' AND auth.role() = ''authenticated'');';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'authenticated upload product files'
  ) THEN
    EXECUTE 'CREATE POLICY "authenticated upload product files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''product-files'');';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'authenticated update product files'
  ) THEN
    EXECUTE 'CREATE POLICY "authenticated update product files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = ''product-files'') WITH CHECK (bucket_id = ''product-files'');';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'authenticated read product files'
  ) THEN
    EXECUTE 'CREATE POLICY "authenticated read product files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = ''product-files'');';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'authenticated delete product files'
  ) THEN
    EXECUTE 'CREATE POLICY "authenticated delete product files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = ''product-files'');';
  END IF;
END
$$;

create or replace function public.prof_upload_object_url(file_path text)
returns text
language sql
stable
as $$
  select case
    when file_path is null or trim(file_path) = '' then null
    else '/storage/v1/object/public/prof-upload/' || file_path
  end;
$$;

-- E-commerce tables needed by the storefront and admin dashboard
create table if not exists store_products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric(12,2) default 0,
  category text,
  cover text,
  file_url text,
  currency text default 'NGN',
  is_free boolean default false,
  rating numeric(3,2) default 0,
  reviews integer default 0,
  in_stock boolean default true,
  stock_count integer default 0,
  prime boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists tribe_bookings add column if not exists payment_reference text;
alter table if exists tribe_bookings add column if not exists payment_status text;

-- Keep existing projects compatible when this setup script is run after the table exists.
alter table if exists store_products add column if not exists title text;
alter table if exists store_products add column if not exists description text;
alter table if exists store_products add column if not exists price numeric(12,2) default 0;
alter table if exists store_products add column if not exists category text;
alter table if exists store_products add column if not exists cover text;
alter table if exists store_products add column if not exists file_url text;
alter table if exists store_products add column if not exists currency text default 'NGN';
alter table if exists store_products add column if not exists is_free boolean default false;
alter table if exists store_products add column if not exists rating numeric(3,2) default 0;
alter table if exists store_products add column if not exists reviews integer default 0;
alter table if exists store_products add column if not exists in_stock boolean default true;
alter table if exists store_products add column if not exists stock_count integer default 0;
alter table if exists store_products add column if not exists prime boolean default false;
alter table if exists store_products add column if not exists created_at timestamptz default now();
alter table if exists store_products add column if not exists updated_at timestamptz default now();

create table if not exists store_bank_accounts (
  id uuid primary key default gen_random_uuid(),
  bank_name text,
  account_name text,
  account_number text,
  account_type text,
  swift_code text,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists shop_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text,
  email text,
  phone text,
  subtotal numeric(12,2) default 0,
  total numeric(12,2) default 0,
  notes text,
  status text default 'pending',
  payment_proof_path text,
  payment_proof_url text,
  payment_reference text,
  payment_mode text default 'live',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists shop_orders add column if not exists payment_mode text default 'live';

create table if not exists shop_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references shop_orders(id) on delete cascade,
  product_id text,
  title text,
  price numeric(12,2) default 0,
  quantity integer default 1,
  created_at timestamptz default now()
);

-- Vendor marketplace foundation. Vendors remain pending until a main admin approves
-- their identity document and payout details.
create table if not exists vendor_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_name text not null,
  logo_url text,
  contact_email text,
  id_type text not null,
  id_document_path text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  payout_account_name text,
  payout_account_number text,
  payout_bank_name text,
  payout_currency text default 'NGN',
  rejection_reason text,
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists store_products add column if not exists vendor_id uuid references vendor_profiles(id) on delete set null;
alter table if exists store_products add column if not exists vendor_name text;

create table if not exists vendor_sales (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendor_profiles(id) on delete cascade,
  order_number text not null,
  product_id text,
  product_title text,
  quantity integer not null default 1,
  gross_amount numeric(12,2) not null default 0,
  vendor_amount numeric(12,2) not null default 0,
  currency text not null default 'NGN',
  payout_status text not null default 'pending' check (payout_status in ('pending', 'approved', 'paid', 'held')),
  payout_reference text,
  paid_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists product_ratings (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  reviewer_name text not null,
  reviewer_email text,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

create table if not exists vendor_ratings (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendor_profiles(id) on delete cascade,
  reviewer_name text not null,
  reviewer_email text,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

create table if not exists vendor_support_messages (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references vendor_profiles(id) on delete set null,
  sender_email text,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'closed')),
  admin_reply text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists customer_support_messages (
  id uuid primary key default gen_random_uuid(),
  sender_name text not null,
  sender_email text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'closed')),
  admin_reply text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists promotional_ads (
  id uuid primary key default gen_random_uuid(),
  headline text not null,
  eyebrow text,
  product_url text,
  action_label text default 'View product',
  posted_by uuid references auth.users(id) on delete set null,
  posted_by_email text,
  vendor_id uuid references vendor_profiles(id) on delete set null,
  vendor_name text,
  is_platform_ad boolean not null default false,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists promotional_ads add column if not exists vendor_name text;
alter table if exists promotional_ads add column if not exists posted_by_email text;
alter table if exists promotional_ads add column if not exists is_platform_ad boolean not null default false;
alter table if exists promotional_ads drop constraint if exists promotional_ads_status_check;
alter table if exists promotional_ads add constraint promotional_ads_status_check check (status in ('draft', 'pending', 'approved', 'published', 'publish_requested', 'unpublish_requested', 'rejected', 'archived'));

insert into public.promotional_ads (eyebrow, headline, product_url, action_label, posted_by_email, is_platform_ad, status)
select 'PAZ Marketplace', 'Your work belongs in the PAZ Marketplace', '/vendor', 'Become a vendor', 'PAZ Thriving Tribe', true, 'published'
where not exists (select 1 from public.promotional_ads where is_platform_ad = true and headline = 'Your work belongs in the PAZ Marketplace');

insert into public.promotional_ads (eyebrow, headline, product_url, action_label, posted_by_email, is_platform_ad, status)
select 'Creator opportunity', 'Turn your knowledge into a growing storefront', '/vendor', 'Become a vendor', 'PAZ Thriving Tribe', true, 'published'
where not exists (select 1 from public.promotional_ads where is_platform_ad = true and headline = 'Turn your knowledge into a growing storefront');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vendor-verification', 'vendor-verification', false, 10485760, ARRAY['image/png','image/jpeg','image/jpg','image/webp','application/pdf'])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = excluded.allowed_mime_types;

alter table if exists vendor_profiles enable row level security;
alter table if exists vendor_sales enable row level security;
alter table if exists product_ratings enable row level security;
alter table if exists vendor_ratings enable row level security;
alter table if exists vendor_support_messages enable row level security;
alter table if exists customer_support_messages enable row level security;
alter table if exists promotional_ads enable row level security;
drop policy if exists "public read published ads" on public.promotional_ads;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vendor_profiles' AND policyname = 'vendors manage own profile') THEN
    EXECUTE 'CREATE POLICY "vendors manage own profile" ON public.vendor_profiles FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid())';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vendor_profiles' AND policyname = 'public read approved vendors') THEN
    EXECUTE 'CREATE POLICY "public read approved vendors" ON public.vendor_profiles FOR SELECT USING (status = ''approved'')';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vendor_sales' AND policyname = 'vendors read own sales') THEN
    EXECUTE 'CREATE POLICY "vendors read own sales" ON public.vendor_sales FOR SELECT TO authenticated USING (vendor_id = auth.uid())';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'product_ratings' AND policyname = 'public read product ratings') THEN
    EXECUTE 'CREATE POLICY "public read product ratings" ON public.product_ratings FOR SELECT USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'product_ratings' AND policyname = 'public submit product ratings') THEN
    EXECUTE 'CREATE POLICY "public submit product ratings" ON public.product_ratings FOR INSERT WITH CHECK (rating between 1 and 5)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vendor_ratings' AND policyname = 'public read vendor ratings') THEN
    EXECUTE 'CREATE POLICY "public read vendor ratings" ON public.vendor_ratings FOR SELECT USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vendor_ratings' AND policyname = 'public submit vendor ratings') THEN
    EXECUTE 'CREATE POLICY "public submit vendor ratings" ON public.vendor_ratings FOR INSERT WITH CHECK (rating between 1 and 5)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vendor_support_messages' AND policyname = 'vendors read own support messages') THEN
    EXECUTE 'CREATE POLICY "vendors read own support messages" ON public.vendor_support_messages FOR SELECT TO authenticated USING (vendor_id = auth.uid())';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'promotional_ads' AND policyname = 'public read published ads') THEN
    EXECUTE 'CREATE POLICY "public read published ads" ON public.promotional_ads FOR SELECT USING (status in (''approved'', ''published''))';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'promotional_ads' AND policyname = 'approved vendors submit ads') THEN
    EXECUTE 'CREATE POLICY "approved vendors submit ads" ON public.promotional_ads FOR INSERT TO authenticated WITH CHECK (vendor_id = auth.uid() AND posted_by = auth.uid() AND EXISTS (SELECT 1 FROM public.vendor_profiles WHERE id = auth.uid() AND status = ''approved''))';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'promotional_ads' AND policyname = 'vendors read own ads') THEN
    EXECUTE 'CREATE POLICY "vendors read own ads" ON public.promotional_ads FOR SELECT TO authenticated USING (vendor_id = auth.uid())';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'promotional_ads' AND policyname = 'vendors request ad unpublish') THEN
    EXECUTE 'CREATE POLICY "vendors request ad unpublish" ON public.promotional_ads FOR UPDATE TO authenticated USING (vendor_id = auth.uid() AND status in (''approved'', ''published'')) WITH CHECK (vendor_id = auth.uid() AND status = ''unpublish_requested'')';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'promotional_ads' AND policyname = 'vendors request ad publish') THEN
    EXECUTE 'CREATE POLICY "vendors request ad publish" ON public.promotional_ads FOR UPDATE TO authenticated USING (vendor_id = auth.uid() AND status = ''archived'') WITH CHECK (vendor_id = auth.uid() AND status = ''publish_requested'')';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'promotional_ads' AND policyname = 'admins manage promotional ads') THEN
    EXECUTE 'CREATE POLICY "admins manage promotional ads" ON public.promotional_ads FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.site_admins WHERE uid = auth.uid()::text OR lower(email) = lower(auth.jwt() ->> ''email''))) WITH CHECK (EXISTS (SELECT 1 FROM public.site_admins WHERE uid = auth.uid()::text OR lower(email) = lower(auth.jwt() ->> ''email'')))';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'vendors upload own verification documents') THEN
    EXECUTE 'CREATE POLICY "vendors upload own verification documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''vendor-verification'' AND (storage.foldername(name))[1] = ''vendors'' AND (storage.foldername(name))[2] = auth.uid()::text)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'vendors read own verification documents') THEN
    EXECUTE 'CREATE POLICY "vendors read own verification documents" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = ''vendor-verification'' AND (storage.foldername(name))[1] = ''vendors'' AND (storage.foldername(name))[2] = auth.uid()::text)';
  END IF;
END
$$;

alter table if exists store_products enable row level security;
alter table if exists store_bank_accounts enable row level security;
alter table if exists shop_orders enable row level security;
alter table if exists shop_order_items enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'store_products' AND policyname = 'allow public read storefront'
  ) THEN
    EXECUTE 'CREATE POLICY "allow public read storefront" ON public.store_products FOR SELECT USING (true);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'store_bank_accounts' AND policyname = 'allow public read bank accounts'
  ) THEN
    EXECUTE 'CREATE POLICY "allow public read bank accounts" ON public.store_bank_accounts FOR SELECT USING (true);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'shop_orders' AND policyname = 'allow public read shop orders'
  ) THEN
    EXECUTE 'CREATE POLICY "allow public read shop orders" ON public.shop_orders FOR SELECT USING (true);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'shop_order_items' AND policyname = 'allow public read order items'
  ) THEN
    EXECUTE 'CREATE POLICY "allow public read order items" ON public.shop_order_items FOR SELECT USING (true);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'store_products' AND policyname = 'allow public insert store products'
  ) THEN
    EXECUTE 'CREATE POLICY "allow public insert store products" ON public.store_products FOR INSERT WITH CHECK (true);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'store_bank_accounts' AND policyname = 'allow public insert bank accounts'
  ) THEN
    EXECUTE 'CREATE POLICY "allow public insert bank accounts" ON public.store_bank_accounts FOR INSERT WITH CHECK (true);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'shop_orders' AND policyname = 'allow public insert shop orders'
  ) THEN
    EXECUTE 'CREATE POLICY "allow public insert shop orders" ON public.shop_orders FOR INSERT WITH CHECK (true);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'shop_orders' AND policyname = 'allow public update payment proof'
  ) THEN
    EXECUTE 'CREATE POLICY "allow public update payment proof" ON public.shop_orders FOR UPDATE USING (true) WITH CHECK (true);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'shop_order_items' AND policyname = 'allow public insert order items'
  ) THEN
    EXECUTE 'CREATE POLICY "allow public insert order items" ON public.shop_order_items FOR INSERT WITH CHECK (true);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'store_products' AND policyname = 'allow authenticated update store products'
  ) THEN
    EXECUTE 'CREATE POLICY "allow authenticated update store products" ON public.store_products FOR UPDATE USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'');';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'store_bank_accounts' AND policyname = 'allow authenticated update bank accounts'
  ) THEN
    EXECUTE 'CREATE POLICY "allow authenticated update bank accounts" ON public.store_bank_accounts FOR UPDATE USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'');';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'store_products' AND policyname = 'allow authenticated delete store products'
  ) THEN
    EXECUTE 'CREATE POLICY "allow authenticated delete store products" ON public.store_products FOR DELETE USING (auth.role() = ''authenticated'');';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'store_bank_accounts' AND policyname = 'allow authenticated delete bank accounts'
  ) THEN
    EXECUTE 'CREATE POLICY "allow authenticated delete bank accounts" ON public.store_bank_accounts FOR DELETE USING (auth.role() = ''authenticated'');';
  END IF;
END
$$;

-- Replace the legacy open product-insert policy with an approved-vendor policy.
DROP POLICY IF EXISTS "allow public insert store products" ON public.store_products;
DROP POLICY IF EXISTS "approved vendors insert own products" ON public.store_products;
CREATE POLICY "approved vendors insert own products" ON public.store_products
  FOR INSERT TO authenticated
  WITH CHECK (
    vendor_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.vendor_profiles
      WHERE vendor_profiles.id = auth.uid()
        AND vendor_profiles.status = 'approved'
    )
  );

create index if not exists idx_store_products_category on store_products(category);
create index if not exists idx_shop_orders_order_number on shop_orders(order_number);
create index if not exists idx_shop_order_items_order_id on shop_order_items(order_id);

create or replace function public.get_shop_order_with_items(p_order_id uuid)
returns table (
  order_id uuid,
  order_number text,
  customer_name text,
  email text,
  phone text,
  subtotal numeric,
  total numeric,
  status text,
  payment_proof_path text,
  payment_proof_url text,
  order_items jsonb
)
language plpgsql
as $$
begin
  return query
  with order_row as (
    select *
    from shop_orders
    where id = p_order_id
  )
  select
    o.id,
    o.order_number,
    o.customer_name,
    o.email,
    o.phone,
    o.subtotal,
    o.total,
    o.status,
    o.payment_proof_path,
    o.payment_proof_url,
    coalesce(jsonb_agg(jsonb_build_object(
      'product_id', i.product_id,
      'title', i.title,
      'price', i.price,
      'quantity', i.quantity
    ) order by i.created_at) filter (where i.id is not null), '[]'::jsonb)
  from order_row o
  left join shop_order_items i on i.order_id = o.id
  group by o.id, o.order_number, o.customer_name, o.email, o.phone, o.subtotal, o.total, o.status, o.payment_proof_path, o.payment_proof_url;
end;
$$;

-- Create a table to register trusted site admins.
create table if not exists site_admins (
  id uuid primary key default gen_random_uuid(),
  uid text unique,
  email text unique not null,
  created_at timestamp with time zone default now()
);

-- Trusted admin account for the live site.
insert into site_admins (email, uid)
values ('pazthrivingtribe@gmail.com', '44787dbc-03ba-475e-9d5c-86ba765d5b0a')
on conflict (email) do update
set uid = excluded.uid;

-- Keep vendor identity documents private while allowing trusted admins to preview them.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'admins read vendor verification documents'
  ) THEN
    EXECUTE 'CREATE POLICY "admins read vendor verification documents" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = ''vendor-verification'' AND EXISTS (SELECT 1 FROM public.site_admins WHERE uid = auth.uid()::text OR lower(email) = lower(auth.jwt() ->> ''email'')))';
  END IF;
END
$$;

-- Optional: if you want to allow public applicant inserts and block direct edits.
alter table if exists tribe_applicants enable row level security;

alter table if exists tribe_applicants enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_applicants' AND policyname = 'allow public insert for applicants'
  ) THEN
    EXECUTE 'CREATE POLICY "allow public insert for applicants" ON tribe_applicants FOR INSERT WITH CHECK (true);';
  END IF;
END
$$;

-- Parent mentoring feedback responses. The timestamp is generated when the form is submitted.
create table if not exists tribe_parent_feedback (
  id uuid primary key default gen_random_uuid(),
  parent_name text not null,
  child_name text not null,
  gender text,
  mentoring_duration text,
  positive_changes jsonb default '[]'::jsonb,
  other_change text,
  significant_change text,
  impact_rating text,
  support_areas jsonb default '[]'::jsonb,
  other_support text,
  future_focus text,
  satisfaction text,
  coach_relationship text,
  child_comments text,
  development_notes text,
  improvement_suggestions text,
  recommendation text,
  testimonial text,
  created_at timestamptz not null default now()
);

-- Keep existing feedback tables compatible with the gender field added to the form.
alter table if exists tribe_parent_feedback
  add column if not exists gender text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'tribe_parent_feedback'::regclass
      AND conname = 'tribe_parent_feedback_gender_check'
  ) THEN
    ALTER TABLE tribe_parent_feedback
      ADD CONSTRAINT tribe_parent_feedback_gender_check
      CHECK (gender IS NULL OR gender IN ('male', 'female'));
  END IF;
END
$$;

alter table if exists tribe_parent_feedback enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_parent_feedback' AND policyname = 'allow public insert for parent feedback'
  ) THEN
    EXECUTE 'CREATE POLICY "allow public insert for parent feedback" ON tribe_parent_feedback FOR INSERT WITH CHECK (true);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_parent_feedback' AND policyname = 'allow authenticated read for parent feedback'
  ) THEN
    EXECUTE 'CREATE POLICY "allow authenticated read for parent feedback" ON tribe_parent_feedback FOR SELECT TO authenticated USING (true);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_parent_feedback' AND policyname = 'allow trusted admin update on parent feedback'
  ) THEN
    EXECUTE 'CREATE POLICY "allow trusted admin update on parent feedback" ON tribe_parent_feedback FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM site_admins WHERE uid = auth.uid()::text OR email = auth.jwt()->>''email'')) WITH CHECK (EXISTS (SELECT 1 FROM site_admins WHERE uid = auth.uid()::text OR email = auth.jwt()->>''email''));';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_parent_feedback' AND policyname = 'allow trusted admin delete on parent feedback'
  ) THEN
    EXECUTE 'CREATE POLICY "allow trusted admin delete on parent feedback" ON tribe_parent_feedback FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM site_admins WHERE uid = auth.uid()::text OR email = auth.jwt()->>''email''));';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_applicants' AND policyname = 'deny direct update on applicants'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct update on applicants" ON tribe_applicants FOR UPDATE USING (false);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_applicants' AND policyname = 'deny direct delete on applicants'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct delete on applicants" ON tribe_applicants FOR DELETE USING (false);';
  END IF;
END
$$;

-- Optionally enable RLS on the services, testimonials, and programs tables
-- and keep admin mutations through the secure serverless endpoint.

alter table if exists tribe_services enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_services' AND policyname = 'allow select on tribe_services'
  ) THEN
    EXECUTE 'CREATE POLICY "allow select on tribe_services" ON tribe_services FOR SELECT USING (true);';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_services' AND policyname = 'deny direct insert on tribe_services'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct insert on tribe_services" ON tribe_services FOR INSERT WITH CHECK (false);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_services' AND policyname = 'deny direct update on tribe_services'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct update on tribe_services" ON tribe_services FOR UPDATE USING (false);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_services' AND policyname = 'deny direct delete on tribe_services'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct delete on tribe_services" ON tribe_services FOR DELETE USING (false);';
  END IF;
END
$$;

alter table if exists tribe_testimonials enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_testimonials' AND policyname = 'allow select on tribe_testimonials'
  ) THEN
    EXECUTE 'CREATE POLICY "allow select on tribe_testimonials" ON tribe_testimonials FOR SELECT USING (true);';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_testimonials' AND policyname = 'deny direct insert on tribe_testimonials'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct insert on tribe_testimonials" ON tribe_testimonials FOR INSERT WITH CHECK (false);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_testimonials' AND policyname = 'deny direct update on tribe_testimonials'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct update on tribe_testimonials" ON tribe_testimonials FOR UPDATE USING (false);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_testimonials' AND policyname = 'deny direct delete on tribe_testimonials'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct delete on tribe_testimonials" ON tribe_testimonials FOR DELETE USING (false);';
  END IF;
END
$$;

alter table if exists tribe_programs enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_programs' AND policyname = 'allow select on tribe_programs'
  ) THEN
    EXECUTE 'CREATE POLICY "allow select on tribe_programs" ON tribe_programs FOR SELECT USING (true);';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_programs' AND policyname = 'deny direct insert on tribe_programs'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct insert on tribe_programs" ON tribe_programs FOR INSERT WITH CHECK (false);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_programs' AND policyname = 'deny direct update on tribe_programs'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct update on tribe_programs" ON tribe_programs FOR UPDATE USING (false);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_programs' AND policyname = 'deny direct delete on tribe_programs'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct delete on tribe_programs" ON tribe_programs FOR DELETE USING (false);';
  END IF;
END
$$;

-- Create a table for social media preview data and allow public reads.
create table if not exists tribe_social_feed (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  icon text,
  color text,
  badge_text text,
  title text,
  summary text,
  timestamp text,
  target_url text,
  embed_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

insert into tribe_social_feed (platform, icon, color, badge_text, title, summary, timestamp, target_url, embed_url)
select 'YouTube', 'fa-brands fa-youtube', '#FF0000', 'Featured Masterclass Broadcast', 'Marriage Alignment Frameworks: Annual Summit Highlights', 'Watch the full 45-minute premium streaming segment breaking down advanced relationship intake assessments, milestone mapping, and interactive couple exercises.', 'Streamed 3 days ago', 'https://youtube.com/shorts/-vOSeWpU1Xs?feature=share', 'https://www.youtube.com/embed/-vOSeWpU1Xs'
where not exists (select 1 from tribe_social_feed where platform = 'YouTube');

alter table if exists tribe_social_feed enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_social_feed' AND policyname = 'allow select on tribe_social_feed'
  ) THEN
    EXECUTE 'CREATE POLICY "allow select on tribe_social_feed" ON tribe_social_feed FOR SELECT USING (true);';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_social_feed' AND policyname = 'deny direct insert on tribe_social_feed'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct insert on tribe_social_feed" ON tribe_social_feed FOR INSERT WITH CHECK (false);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_social_feed' AND policyname = 'deny direct update on tribe_social_feed'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct update on tribe_social_feed" ON tribe_social_feed FOR UPDATE USING (false);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_social_feed' AND policyname = 'deny direct delete on tribe_social_feed'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct delete on tribe_social_feed" ON tribe_social_feed FOR DELETE USING (false);';
  END IF;
END
$$;

-- If you want the admin endpoint to be able to bypass these policies, it will do so using the service-role key.
-- Keep the service-role key secret and do not expose it in client-side code.

-- ==========================================================
-- Additional table DDL expected by the frontend
-- ==========================================================

-- Applicants (registration form submissions)
create table if not exists tribe_applicants (
  id uuid primary key default gen_random_uuid(),
  registration_type text,
  parent_or_guardian_name text,
  full_name text,
  email text,
  phone text,
  home_address text,
  children_count integer,
  source text,
  children_details jsonb,
  notes text,
  track text,
  message text,
  payment_reference text,
  payment_status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists tribe_applicants add column if not exists registration_type text;
alter table if exists tribe_bookings add column if not exists payment_reference text;
alter table if exists tribe_bookings add column if not exists payment_status text;
alter table if exists tribe_applicants add column if not exists parent_or_guardian_name text;
alter table if exists tribe_applicants add column if not exists full_name text;
alter table if exists tribe_applicants add column if not exists email text;
alter table if exists tribe_applicants add column if not exists phone text;
alter table if exists tribe_applicants add column if not exists home_address text;
alter table if exists tribe_applicants add column if not exists children_count integer;
alter table if exists tribe_applicants add column if not exists source text;
alter table if exists tribe_applicants add column if not exists children_details jsonb;
alter table if exists tribe_applicants add column if not exists notes text;
alter table if exists tribe_applicants add column if not exists track text;
alter table if exists tribe_applicants add column if not exists message text;
alter table if exists tribe_applicants add column if not exists payment_reference text;
alter table if exists tribe_applicants add column if not exists payment_status text;

alter table if exists tribe_applicants enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_applicants' AND policyname = 'allow trusted admin delete on applicants'
  ) THEN
    EXECUTE 'CREATE POLICY "allow trusted admin delete on applicants" ON tribe_applicants FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM site_admins WHERE uid = auth.uid()::text OR lower(email) = lower(auth.jwt()->>''email'')));';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_applicants' AND policyname = 'allow public insert for applicants'
  ) THEN
    EXECUTE 'CREATE POLICY "allow public insert for applicants" ON tribe_applicants FOR INSERT WITH CHECK (true);';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_applicants' AND policyname = 'deny direct update on applicants'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct update on applicants" ON tribe_applicants FOR UPDATE USING (false);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_applicants' AND policyname = 'deny direct delete on applicants'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct delete on applicants" ON tribe_applicants FOR DELETE USING (false);';
  END IF;
END
$$;

-- Bookings (session booking requests)
create table if not exists tribe_bookings (
  id uuid primary key default gen_random_uuid(),
  registration_type text,
  contact_name text,
  email text,
  phone text,
  home_address text,
  program_type text,
  preferred_date date,
  preferred_time text,
  session_format text,
  notes text,
  payment_reference text,
  payment_status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists tribe_bookings enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_bookings' AND policyname = 'allow trusted admin read on bookings'
  ) THEN
    EXECUTE 'CREATE POLICY "allow trusted admin read on bookings" ON tribe_bookings FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM site_admins WHERE uid = auth.uid()::text OR lower(email) = lower(auth.jwt()->>''email'')));';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_bookings' AND policyname = 'allow public insert for bookings'
  ) THEN
    EXECUTE 'CREATE POLICY "allow public insert for bookings" ON tribe_bookings FOR INSERT WITH CHECK (true);';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_bookings' AND policyname = 'deny direct update on bookings'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct update on bookings" ON tribe_bookings FOR UPDATE USING (false);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_bookings' AND policyname = 'deny direct delete on bookings'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct delete on bookings" ON tribe_bookings FOR DELETE USING (false);';
  END IF;
END
$$;

-- Services
create table if not exists tribe_services (
  id uuid primary key default gen_random_uuid(),
  title text,
  slug text,
  description text,
  image text,
  order_index integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists tribe_services enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_services' AND policyname = 'allow select on tribe_services'
  ) THEN
    EXECUTE 'CREATE POLICY "allow select on tribe_services" ON tribe_services FOR SELECT USING (true);';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_services' AND policyname = 'deny direct insert on tribe_services'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct insert on tribe_services" ON tribe_services FOR INSERT WITH CHECK (false);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_services' AND policyname = 'deny direct update on tribe_services'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct update on tribe_services" ON tribe_services FOR UPDATE USING (false);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_services' AND policyname = 'deny direct delete on tribe_services'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct delete on tribe_services" ON tribe_services FOR DELETE USING (false);';
  END IF;
END
$$;

-- Programs
create table if not exists tribe_programs (
  id uuid primary key default gen_random_uuid(),
  service text,
  title text,
  description text,
  duration text,
  schedule text,
  level text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists tribe_programs enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_programs' AND policyname = 'allow select on tribe_programs'
  ) THEN
    EXECUTE 'CREATE POLICY "allow select on tribe_programs" ON tribe_programs FOR SELECT USING (true);';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_programs' AND policyname = 'deny direct insert on tribe_programs'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct insert on tribe_programs" ON tribe_programs FOR INSERT WITH CHECK (false);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_programs' AND policyname = 'deny direct update on tribe_programs'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct update on tribe_programs" ON tribe_programs FOR UPDATE USING (false);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_programs' AND policyname = 'deny direct delete on tribe_programs'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct delete on tribe_programs" ON tribe_programs FOR DELETE USING (false);';
  END IF;
END
$$;

-- Testimonials
create table if not exists tribe_testimonials (
  id uuid primary key default gen_random_uuid(),
  author text,
  origin text,
  text text,
  image_type text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Seed the three testimonials currently shown by the homepage fallback.
-- This gives them database ids so the Published Slider dashboard can manage them.
insert into tribe_testimonials (author, origin, text, image_type)
select 'Jojo''s Mom', 'Parent', 'Ms. Rosaline has been a truly exceptional tutor and coach for my 10-year-old daughter. My daughter will have her 9th class this week. From the beginning, she created a fun, warm, and engaging environment that made my daughter genuinely excited for every lesson—often looking forward to it even before it starts. What makes Ms. Rosaline stand out is her real impact. She has played a major role in building my daughter''s personality—developing her sense of responsibility and, most importantly, her inner motivation. Today, my daughter attends her classes because she wants to, not because I ask her to—and that, to me, is incredibly valuable. Through her constant encouragement, positivity, and genuine care, Ms. Rosaline has helped my daughter grow in confidence, independence, self-love, and communication. She also nurtures leadership skills and teaches children how to handle different life situations with confidence and awareness. Her dedication, patience, and uplifting spirit truly make a lasting difference. I''m deeply grateful for her efforts and highly recommend her as an inspiring and impactful life coach for children.', 'logo'
where not exists (select 1 from tribe_testimonials where author = 'Jojo''s Mom');

insert into tribe_testimonials (author, origin, text, image_type)
select 'Chukwunonso', 'Community', 'Good evening Coach Roseline thank you for the things you have done for me, my grades are improving now.', 'logo'
where not exists (select 1 from tribe_testimonials where author = 'Chukwunonso');

insert into tribe_testimonials (author, origin, text, image_type)
select 'A and A''s Dad', 'Parent', 'Thank You hope they are making progress in line with the schedule. They enjoyed their sessions.', 'logo'
where not exists (select 1 from tribe_testimonials where author = 'A and A''s Dad');

alter table if exists tribe_testimonials enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_testimonials' AND policyname = 'allow trusted admin delete on testimonials'
  ) THEN
    EXECUTE 'CREATE POLICY "allow trusted admin delete on testimonials" ON tribe_testimonials FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM site_admins WHERE uid = auth.uid()::text OR lower(email) = lower(auth.jwt()->>''email'')));';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_testimonials' AND policyname = 'allow trusted admin insert on testimonials'
  ) THEN
    EXECUTE 'CREATE POLICY "allow trusted admin insert on testimonials" ON tribe_testimonials FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM site_admins WHERE uid = auth.uid()::text OR lower(email) = lower(auth.jwt()->>''email'')));';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_testimonials' AND policyname = 'allow select on tribe_testimonials'
  ) THEN
    EXECUTE 'CREATE POLICY "allow select on tribe_testimonials" ON tribe_testimonials FOR SELECT USING (true);';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_testimonials' AND policyname = 'deny direct insert on tribe_testimonials'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct insert on tribe_testimonials" ON tribe_testimonials FOR INSERT WITH CHECK (false);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_testimonials' AND policyname = 'deny direct update on tribe_testimonials'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct update on tribe_testimonials" ON tribe_testimonials FOR UPDATE USING (false);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_testimonials' AND policyname = 'deny direct delete on tribe_testimonials'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct delete on tribe_testimonials" ON tribe_testimonials FOR DELETE USING (false);';
  END IF;
END
$$;

-- Contact messages
create table if not exists tribe_contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  subject text,
  message text,
  created_at timestamptz default now()
);

alter table if exists tribe_social_feed enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_social_feed' AND policyname = 'allow select on tribe_social_feed'
  ) THEN
    EXECUTE 'CREATE POLICY "allow select on tribe_social_feed" ON tribe_social_feed FOR SELECT USING (true);';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_social_feed' AND policyname = 'deny direct insert on tribe_social_feed'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct insert on tribe_social_feed" ON tribe_social_feed FOR INSERT WITH CHECK (false);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_social_feed' AND policyname = 'deny direct update on tribe_social_feed'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct update on tribe_social_feed" ON tribe_social_feed FOR UPDATE USING (false);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'tribe_social_feed' AND policyname = 'deny direct delete on tribe_social_feed'
  ) THEN
    EXECUTE 'CREATE POLICY "deny direct delete on tribe_social_feed" ON tribe_social_feed FOR DELETE USING (false);';
  END IF;
END
$$;

-- Activity / page views
create table if not exists tribe_activity (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  user_id text,
  path text,
  method text,
  ip_address text,
  device_type text,
  location text,
  created_at timestamptz default now()
);

alter table if exists tribe_activity add column if not exists session_id text;
alter table if exists tribe_activity add column if not exists user_id text;
alter table if exists tribe_activity add column if not exists path text;
alter table if exists tribe_activity add column if not exists method text;
alter table if exists tribe_activity add column if not exists ip_address text;
alter table if exists tribe_activity add column if not exists device_type text;
alter table if exists tribe_activity add column if not exists location text;
alter table if exists tribe_activity add column if not exists created_at timestamptz default now();
alter table if exists tribe_activity enable row level security;

drop policy if exists "allow trusted admin read on activity" on tribe_activity;
drop policy if exists "allow trusted admin delete on activity" on tribe_activity;

DO $$
BEGIN
  EXECUTE 'CREATE POLICY "allow trusted admin read on activity" ON tribe_activity FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM site_admins WHERE uid = auth.uid()::text OR lower(email) = lower(auth.jwt()->>''email'')));';
  EXECUTE 'CREATE POLICY "allow trusted admin delete on activity" ON tribe_activity FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM site_admins WHERE uid = auth.uid()::text OR lower(email) = lower(auth.jwt()->>''email'')));';
END
$$;

create index if not exists idx_tribe_activity_created_at on tribe_activity (created_at desc);
create index if not exists idx_tribe_activity_ip_address on tribe_activity (ip_address);

-- Indexes (add as needed)
create index if not exists idx_tribe_applicants_created_at on tribe_applicants (created_at);
create index if not exists idx_tribe_bookings_created_at on tribe_bookings (created_at);

