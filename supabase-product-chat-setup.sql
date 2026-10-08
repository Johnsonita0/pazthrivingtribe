create table if not exists public.product_chat_conversations (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  product_title text not null,
  vendor_id uuid references public.vendor_profiles(id) on delete set null,
  vendor_name text,
  vendor_email text,
  assigned_to text not null default 'admin' check (assigned_to in ('vendor', 'admin')),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  customer_id uuid references auth.users(id) on delete set null,
  customer_read_at timestamptz not null default now(),
  access_token_hash text not null unique,
  access_token_ciphertext text not null,
  email_reply_token text not null unique,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

alter table public.product_chat_conversations
  add column if not exists access_token_ciphertext text;
alter table public.product_chat_conversations
  add column if not exists email_reply_token text;
alter table public.product_chat_conversations
  add column if not exists customer_id uuid references auth.users(id) on delete set null;
alter table public.product_chat_conversations
  add column if not exists customer_read_at timestamptz not null default now();
create unique index if not exists product_chat_conversations_email_reply_token_idx
  on public.product_chat_conversations (email_reply_token)
  where email_reply_token is not null;

create table if not exists public.product_chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.product_chat_conversations(id) on delete cascade,
  sender_role text not null check (sender_role in ('customer', 'vendor', 'admin')),
  sender_name text not null,
  sender_email text not null,
  message text not null,
  source_email_id text unique,
  created_at timestamptz not null default now()
);

create index if not exists product_chat_conversations_updated_idx
  on public.product_chat_conversations (last_message_at desc);
create index if not exists product_chat_conversations_customer_idx
  on public.product_chat_conversations (customer_id, last_message_at desc);
create index if not exists product_chat_messages_conversation_idx
  on public.product_chat_messages (conversation_id, created_at);

alter table public.product_chat_conversations enable row level security;
alter table public.product_chat_messages enable row level security;
revoke all on public.product_chat_conversations from anon, authenticated;
revoke all on public.product_chat_messages from anon, authenticated;
grant all on public.product_chat_conversations to service_role;
grant all on public.product_chat_messages to service_role;