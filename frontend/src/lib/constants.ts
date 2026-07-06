export const DEPARTMENTS = [
  'Engineering', 'Sales', 'HR', 'Finance', 'Marketing', 'Operations', 'Legal'
] as const

export const COUNTRIES = [
  'US', 'UK', 'India', 'Germany', 'France', 'Canada', 'Australia'
] as const

// Default currency per country — mirrors the seed data so the form can
// auto-fill currency when a country is picked.
export const CURRENCY_BY_COUNTRY: Record<string, string> = {
  US: 'USD',
  UK: 'GBP',
  India: 'INR',
  Germany: 'EUR',
  France: 'EUR',
  Canada: 'CAD',
  Australia: 'AUD'
}
