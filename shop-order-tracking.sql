-- Apply this migration in the Supabase SQL editor before enabling order tracking.
alter table public.shop_orders
  add column if not exists tracking_status text not null default 'order_placed',
  add column if not exists tracking_number text,
  add column if not exists estimated_delivery_at timestamptz,
  add column if not exists tracking_updated_at timestamptz not null default now();

alter table public.shop_orders
  drop constraint if exists shop_orders_tracking_status_check;

alter table public.shop_orders
  add constraint shop_orders_tracking_status_check
  check (tracking_status in (
    'order_placed',
    'processing',
    'dispatched',
    'out_for_delivery',
    'delivered',
    'cancelled'
  ));

create table if not exists public.shop_order_tracking_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.shop_orders(id) on delete cascade,
  status text not null check (status in (
    'order_placed',
    'processing',
    'dispatched',
    'out_for_delivery',
    'delivered',
    'cancelled'
  )),
  note text,
  created_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists shop_order_tracking_events_order_created_idx
  on public.shop_order_tracking_events (order_id, created_at desc);

alter table public.shop_order_tracking_events enable row level security;

drop policy if exists shop_order_tracking_events_customer_select
  on public.shop_order_tracking_events;
create policy shop_order_tracking_events_customer_select
  on public.shop_order_tracking_events for select to authenticated
  using (
    exists (
      select 1
      from public.shop_orders as customer_order
      where customer_order.id = shop_order_tracking_events.order_id
        and (
          customer_order.customer_id = auth.uid()
          or public.is_confirmed_shop_customer(customer_order.email)
          or exists (
            select 1 from public.site_admins
            where uid = auth.uid()::text
              or lower(email) = lower(auth.jwt() ->> 'email')
          )
        )
    )
  );

insert into public.shop_order_tracking_events (order_id, status, note, created_at)
select orders.id, orders.tracking_status, 'Order tracking started', orders.created_at
from public.shop_orders as orders
where not exists (
  select 1
  from public.shop_order_tracking_events as events
  where events.order_id = orders.id
);

create or replace function public.record_new_shop_order_tracking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.shop_order_tracking_events (order_id, status, note, created_at)
  values (new.id, new.tracking_status, 'Order tracking started', new.created_at);
  return new;
end;
$$;

revoke all on function public.record_new_shop_order_tracking() from public, anon, authenticated;

drop trigger if exists shop_order_tracking_initial_event on public.shop_orders;
create trigger shop_order_tracking_initial_event
  after insert on public.shop_orders
  for each row execute function public.record_new_shop_order_tracking();

create or replace function public.admin_update_shop_order_tracking(
  p_order_id uuid,
  p_status text,
  p_note text default null,
  p_tracking_number text default null,
  p_estimated_delivery_at timestamptz default null,
  p_updated_by uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_order public.shop_orders%rowtype;
begin
  if p_status not in (
    'order_placed',
    'processing',
    'dispatched',
    'out_for_delivery',
    'delivered',
    'cancelled'
  ) then
    raise exception 'Invalid order tracking status';
  end if;

  update public.shop_orders
  set tracking_status = p_status,
      tracking_number = nullif(btrim(p_tracking_number), ''),
      estimated_delivery_at = p_estimated_delivery_at,
      tracking_updated_at = now(),
      updated_at = now()
  where id = p_order_id
  returning * into updated_order;

  if not found then
    raise exception 'Order not found';
  end if;

  insert into public.shop_order_tracking_events (order_id, status, note, created_by)
  values (
    p_order_id,
    p_status,
    nullif(btrim(p_note), ''),
    p_updated_by
  );

  return jsonb_build_object(
    'id', updated_order.id,
    'tracking_status', updated_order.tracking_status,
    'tracking_number', updated_order.tracking_number,
    'estimated_delivery_at', updated_order.estimated_delivery_at,
    'tracking_updated_at', updated_order.tracking_updated_at
  );
end;
$$;

revoke all on function public.admin_update_shop_order_tracking(uuid, text, text, text, timestamptz, uuid) from public, anon, authenticated;
grant execute on function public.admin_update_shop_order_tracking(uuid, text, text, text, timestamptz, uuid) to service_role;

grant select on public.shop_order_tracking_events to authenticated;
