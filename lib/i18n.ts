export type Locale = 'nl' | 'en';

export const locales: Locale[] = ['nl', 'en'];
export const defaultLocale: Locale = 'nl';

// Dutch-speaking countries: Netherlands, Belgium, Suriname, Aruba, Curaçao, Sint Maarten, Bonaire/SS/Saba
export const NL_COUNTRIES = new Set(['NL', 'BE', 'SR', 'AW', 'CW', 'SX', 'BQ']);

export function getLocaleFromCountry(country: string | null | undefined): Locale {
  if (country && NL_COUNTRIES.has(country)) return 'nl';
  return 'en';
}

const dictionaries = {
  nl: () => import('../messages/nl.json').then((m) => m.default),
  en: () => import('../messages/en.json').then((m) => m.default),
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}
