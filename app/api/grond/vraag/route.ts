import { begrens, beantwoord } from '../../../../lib/grond/vraag';

export const maxDuration = 60;

function bezoekerVan(request: Request): string {
  const doorgestuurd = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  return doorgestuurd || 'onbekend';
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const vraag = String(body?.vraag || '').trim().slice(0, 500);
  if (vraag.length < 3) return Response.json({ fout: 'Stel een vraag van minstens drie tekens.' }, { status: 400 });
  const grens = begrens(bezoekerVan(request));
  if (grens) return Response.json({ fout: grens }, { status: 429 });
  try {
    return Response.json(await beantwoord(vraag), { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    console.error(`grond-fout: ${error instanceof Error ? error.message : 'onbekend'}`);
    return Response.json({ fout: 'Dit antwoord is niet gelukt. Probeer de vraag anders te formuleren.' }, { status: 500 });
  }
}
