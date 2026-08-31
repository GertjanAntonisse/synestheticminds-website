// De vier edities staan hier, en niet in de pagina, omdat zowel de boekpagina
// als de gelogde omleiding ze nodig heeft. Twee kopieën zouden stil uit elkaar
// lopen: een gewijzigde ASIN op de pagina komt in /api/go op een onbekende
// sleutel uit en stuurt de koper naar de homepage, zonder foutmelding.
//
// Amazon.nl is de primaire markt van de reeks; .com stuurde Nederlandse lezers
// naar de Amerikaanse winkel. De Engelse edities staan op amazon.com, want die
// winkel bedient de lezer die de Engelse pagina krijgt.
export const BOEK_LINKS = {
  'nl-1': 'https://www.amazon.nl/dp/B0G6MDBLH5',
  'nl-2': 'https://www.amazon.nl/dp/B0HGMC6WGN',
  'en-1': 'https://www.amazon.com/dp/B0HGS8HS4C',
  'en-2': 'https://www.amazon.com/dp/B0HGXC697G',
} as const;

export type BoekSleutel = keyof typeof BOEK_LINKS;

export function boekSleutel(locale: string, deel: 1 | 2): BoekSleutel {
  return `${locale === 'en' ? 'en' : 'nl'}-${deel}` as BoekSleutel;
}
