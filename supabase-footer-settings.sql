CREATE TABLE IF NOT EXISTS public.tribe_site_settings (
  setting_key text PRIMARY KEY,
  setting_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tribe_site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read PAZ site settings" ON public.tribe_site_settings;
CREATE POLICY "Public can read PAZ site settings"
  ON public.tribe_site_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

GRANT SELECT ON public.tribe_site_settings TO anon, authenticated;
GRANT ALL ON public.tribe_site_settings TO service_role;

INSERT INTO public.tribe_site_settings (setting_key, setting_value)
VALUES (
  'footer',
  '{
    "enabled": true,
    "brandName": "Paz Thriving Tribe",
    "description": "Paz Thriving Tribe Coaching, Mentoring and Counselling Organisation is committed to impacting individuals, families, transforming teenagers, positively influencing women, and helping children and young people develop the values, character, and healthy habits they need to thrive and become purposeful leaders.",
    "contactEmail": "pazthrivingtribe@gmail.com",
    "contactPhone": "+234 803 738 3820",
    "location": "Lagos Main Campus, Nigeria",
    "copyright": "Paz Thriving Tribe.",
    "emailFooterNote": "We are here to help your growth journey."
  }'::jsonb
)
ON CONFLICT (setting_key) DO NOTHING;
