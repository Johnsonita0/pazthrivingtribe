export const DEFAULT_FOOTER_SETTINGS = Object.freeze({
  enabled: true,
  brandName: 'Paz Thriving Tribe',
  description: 'Paz Thriving Tribe Coaching, Mentoring and Counselling Organisation is committed to impacting individuals, families, transforming teenagers, positively influencing women, and helping children and young people develop the values, character, and healthy habits they need to thrive and become purposeful leaders.',
  contactEmail: 'pazthrivingtribe@gmail.com',
  contactPhone: '+234 803 738 3820',
  location: 'Lagos Main Campus, Nigeria',
  copyright: 'Paz Thriving Tribe.',
  emailFooterNote: 'We are here to help your growth journey.'
});

export function normalizeFooterSettings(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ...DEFAULT_FOOTER_SETTINGS };
  }

  return {
    ...DEFAULT_FOOTER_SETTINGS,
    ...value,
    enabled: value.enabled !== false
  };
}
