import { zoekRegels } from '../../../../lib/grond/regels';

export const maxDuration = 30;

const INSTRUCTIES = /^INS-0[1-5]$/;
const schoon = (waarde: string | null, patroon: RegExp) => (waarde && patroon.test(waarde) ? waarde : undefined);

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  const filter = {
    instructie: schoon(q.get('instructie'), INSTRUCTIES),
    periode: schoon(q.get('periode'), /^[AB]$/),
    medewerker: schoon(q.get('medewerker'), /^MW-\d{3}$/),
    locatie: schoon(q.get('locatie'), /^R\d-V\d-L\d$/),
    week: schoon(q.get('week'), /^\d{4}-\d{2}-\d{2}$/),
  };
  if (!filter.instructie) return Response.json({ fout: 'Kies een instructie.' }, { status: 400 });
  const limiet = Math.min(50, Math.max(1, Number(q.get('limiet')) || 25));
  return Response.json(await zoekRegels(filter, limiet), { headers: { 'cache-control': 'public, max-age=3600' } });
}
