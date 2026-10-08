-- Run this in Supabase SQL Editor after the existing PAZ shop schema is installed.
create table if not exists public.customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  full_name text,
  avatar_url text,
  delivery_address jsonb,
  expo_push_token text,
  phone text,
  country_code text not null default 'NG',
  language text not null default 'English',
  currency text not null default 'NGN',
  notifications_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customer_profiles add column if not exists email text;
alter table public.customer_profiles add column if not exists first_name text;
alter table public.customer_profiles add column if not exists last_name text;
alter table public.customer_profiles add column if not exists full_name text;
alter table public.customer_profiles add column if not exists avatar_url text;
alter table public.customer_profiles add column if not exists delivery_address jsonb;
alter table public.customer_profiles add column if not exists expo_push_token text;
alter table public.customer_profiles add column if not exists phone text;
alter table public.customer_profiles add column if not exists country_code text not null default 'NG';
alter table public.customer_profiles add column if not exists language text not null default 'English';
alter table public.customer_profiles add column if not exists currency text not null default 'NGN';
alter table public.customer_profiles add column if not exists notifications_enabled boolean not null default false;
alter table public.customer_profiles add column if not exists created_at timestamptz not null default now();
alter table public.customer_profiles add column if not exists updated_at timestamptz not null default now();
alter table public.shop_orders add column if not exists currency text;
alter table public.shop_orders add column if not exists delivery_address jsonb;
alter table public.shop_orders
  add column if not exists customer_id uuid references auth.users(id) on delete set null;

alter table public.customer_profiles enable row level security;
alter table public.shop_orders enable row level security;
alter table public.shop_order_items enable row level security;

-- Existing permissive SELECT policies are ORed together by Postgres, so remove
-- every old read policy before installing customer- and admin-scoped policies.
do $$
declare
  old_policy record;
begin
  for old_policy in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('customer_profiles', 'shop_orders', 'shop_order_items')
      and cmd in ('SELECT', 'ALL')
  loop
    execute format('drop policy %I on %I.%I', old_policy.policyname, old_policy.schemaname, old_policy.tablename);
  end loop;
end
$$;

create or replace function public.is_confirmed_shop_customer(customer_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users as account
    where account.id = auth.uid()
      and account.email_confirmed_at is not null
      and lower(account.email) = lower(customer_email)
  );
$$;

revoke all on function public.is_confirmed_shop_customer(text) from public;
grant execute on function public.is_confirmed_shop_customer(text) to authenticated;

drop policy if exists customer_profiles_select_own on public.customer_profiles;
drop policy if exists customer_profiles_insert_own on public.customer_profiles;
drop policy if exists customer_profiles_update_own on public.customer_profiles;

create policy customer_profiles_select_own
  on public.customer_profiles for select to authenticated
  using (id = auth.uid());
create policy customer_profiles_insert_own
  on public.customer_profiles for insert to authenticated
  with check (id = auth.uid());
create policy customer_profiles_update_own
  on public.customer_profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy shop_orders_select_customer_or_admin
  on public.shop_orders for select to authenticated
  using (
    customer_id = auth.uid()
    or public.is_confirmed_shop_customer(email)
    or exists (
      select 1 from public.site_admins
      where uid = auth.uid()::text
        or lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

create policy shop_order_items_select_customer_or_admin
  on public.shop_order_items for select to authenticated
  using (
    exists (
      select 1
      from public.shop_orders as customer_order
      where customer_order.id = shop_order_items.order_id
        and (
          public.is_confirmed_shop_customer(customer_order.email)
          or exists (
            select 1 from public.site_admins
            where uid = auth.uid()::text
              or lower(email) = lower(auth.jwt() ->> 'email')
          )
        )
    )
  );

grant select, insert, update on public.customer_profiles to authenticated;
grant select on public.shop_orders, public.shop_order_items to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('customer-avatars', 'customer-avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do update
set public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists customer_avatars_insert_own on storage.objects;
drop policy if exists customer_avatars_select_own on storage.objects;
drop policy if exists customer_avatars_update_own on storage.objects;
drop policy if exists customer_avatars_delete_own on storage.objects;
create policy customer_avatars_select_own
  on storage.objects for select to authenticated
  using (bucket_id = 'customer-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy customer_avatars_insert_own
  on storage.objects for insert to authenticated
  with check (bucket_id = 'customer-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy customer_avatars_update_own
  on storage.objects for update to authenticated
  using (bucket_id = 'customer-avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'customer-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy customer_avatars_delete_own
  on storage.objects for delete to authenticated
  using (bucket_id = 'customer-avatars' and (storage.foldername(name))[1] = auth.uid()::text);
