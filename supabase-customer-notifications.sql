create table if not exists public.customer_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete set null,
  title text not null check (length(trim(title)) between 1 and 180),
  message text not null check (length(trim(message)) between 1 and 5000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists customer_notifications_recipient_created_idx
  on public.customer_notifications(recipient_id, created_at desc);
create index if not exists customer_notifications_unread_idx
  on public.customer_notifications(recipient_id)
  where read_at is null;

alter table public.customer_notifications enable row level security;
drop policy if exists customer_notifications_select_own on public.customer_notifications;
drop policy if exists customer_notifications_update_own on public.customer_notifications;
create policy customer_notifications_select_own
  on public.customer_notifications for select to authenticated
  using (recipient_id = auth.uid());
create policy customer_notifications_update_own
  on public.customer_notifications for update to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

revoke all on public.customer_notifications from public, anon, authenticated;
grant select on public.customer_notifications to authenticated;
grant update (read_at) on public.customer_notifications to authenticated;
grant all on public.customer_notifications to service_role;

notify pgrst, 'reload schema';
