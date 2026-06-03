-- Create a table to register trusted site admins
create table if not exists site_admins (
  id uuid primary key default gen_random_uuid(),
  uid text unique,
  email text unique not null,
  created_at timestamp with time zone default now()
);

-- Example insert for a known admin email
-- Replace with your actual admin address or Supabase user UID
insert into site_admins (email) values ('admin@example.com');

-- Enable row level security on applicant table if you want to allow only specific inserts.
-- This example allows public inserts for applicants and denies all other direct mutations.

alter table if exists tribe_applicants enable row level security;

create policy if not exists "allow public insert for applicants"
  on tribe_applicants
  for insert
  using (true);

create policy if not exists "deny direct update delete on applicants"
  on tribe_applicants
  for update, delete
  using (false);

-- Optionally enable RLS on the services, testimonials, and programs tables
-- and keep admin mutations through the secure serverless endpoint.

alter table if exists tribe_services enable row level security;
create policy if not exists "allow select on tribe_services" on tribe_services for select using (true);
create policy if not exists "deny direct mutations on tribe_services" on tribe_services for insert, update, delete using (false);

alter table if exists tribe_testimonials enable row level security;
create policy if not exists "allow select on tribe_testimonials" on tribe_testimonials for select using (true);
create policy if not exists "deny direct mutations on tribe_testimonials" on tribe_testimonials for insert, update, delete using (false);

alter table if exists tribe_programs enable row level security;
create policy if not exists "allow select on tribe_programs" on tribe_programs for select using (true);
create policy if not exists "deny direct mutations on tribe_programs" on tribe_programs for insert, update, delete using (false);

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

alter table if exists tribe_social_feed enable row level security;
create policy if not exists "allow select on tribe_social_feed" on tribe_social_feed for select using (true);
create policy if not exists "deny direct mutations on tribe_social_feed" on tribe_social_feed for insert, update, delete using (false);

-- If you want the admin endpoint to be able to bypass these policies, it will do so using the service-role key.
-- Keep the service-role key secret and do not expose it in client-side code.
