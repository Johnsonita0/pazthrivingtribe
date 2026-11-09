CREATE TABLE IF NOT EXISTS public.masterclass_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key text NOT NULL,
  registrant_name text NOT NULL CHECK (char_length(btrim(registrant_name)) BETWEEN 1 AND 120),
  email text NOT NULL CHECK (
    char_length(email) <= 254
    AND email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  phone text NOT NULL CHECK (
    char_length(phone) BETWEEN 7 AND 40
    AND phone ~ '[0-9]'
  ),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS masterclass_registrations_event_created_idx
  ON public.masterclass_registrations (event_key, created_at DESC);

ALTER TABLE public.masterclass_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit masterclass registrations"
  ON public.masterclass_registrations;
CREATE POLICY "Public can submit masterclass registrations"
  ON public.masterclass_registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

REVOKE ALL ON TABLE public.masterclass_registrations FROM PUBLIC, anon, authenticated;
GRANT INSERT ON TABLE public.masterclass_registrations TO anon, authenticated;
GRANT ALL ON TABLE public.masterclass_registrations TO service_role;

NOTIFY pgrst, 'reload schema';
