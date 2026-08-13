-- Create a table to register trusted site admins
create table if not exists site_admins (
  id uuid primary key default gen_random_uuid(),
  uid text unique,
  email text unique not null,
  created_at timestamp with time zone default now()
);

-- Trusted admin account for the live site
insert into site_admins (email, uid)
values ('pazthrivingtribe@gmail.com', '44787dbc-03ba-475e-9d5c-86ba765d5b0a')
on conflict (email) do update set uid = excluded.uid;

-- Enable row level security on applicant table if you want to allow only specific inserts.
-- This example allows public inserts for applicants and denies all other direct mutations.

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
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists tribe_bookings enable row level security;

DO $$
BEGIN
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
  created_at timestamptz default now()
);

-- Indexes (add as needed)
create index if not exists idx_tribe_applicants_created_at on tribe_applicants (created_at);
create index if not exists idx_tribe_bookings_created_at on tribe_bookings (created_at);

