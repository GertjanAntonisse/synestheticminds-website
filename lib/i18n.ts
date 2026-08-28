export type Locale = 'nl' | 'en';

export const locales: Locale[] = ['nl', 'en'];
export const defaultLocale: Locale = 'nl';

// Dutch-speaking countries: Netherlands, Belgium, Suriname, Aruba, Curaçao, Sint Maarten, Bonaire/SS/Saba
export const NL_COUNTRIES = new Set(['NL', 'BE', 'SR', 'AW', 'CW', 'SX', 'BQ']);

export function getLocaleFromCountry(country: string | null | undefined): Locale {
  if (country && NL_COUNTRIES.has(country)) return 'nl';
  return 'en';
}

// Onthoudt een taalkeuze die de bezoeker zelf maakt. Alleen de wisselknop
// schrijft dit cookie; de landdetectie nooit. Anders zou iemand vastzitten in
// de taal van het land waar hij toevallig was toen hij voor het eerst kwam, en
// dat is geen keuze maar een gevolg.
export const LOCALE_COOKIE = 'locale';

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'nl' || value === 'en';
}

const dictionaries = {
  nl: () => import('../messages/nl.json').then((m) => m.default),
  en: () => import('../messages/en.json').then((m) => m.default),
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}
