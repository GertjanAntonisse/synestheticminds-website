import fs from 'node:fs/promises';
import path from 'node:path';
import { retrieveEvidence } from './retrieval.mjs';
import { answerQuestion } from './questions.mjs';
import { MODEL_SYSTEM_PROMPT, buildModelPrompt, parseModelAnswer } from './model.mjs';

const MODEL = process.env.GROND_MODEL || 'claude-haiku-5-5';
const MAX_TOKENS = Number(process.env.GROND_MAX_TOKENS || 3500);
const PER_BEZOEKER = Number(process.env.GROND_PER_BEZOEKER_PER_DAG || 20);
const IN_TOTAAL = Number(process.env.GROND_IN_TOTAAL_PER_DAG || 300);

const SYSTEM = `${MODEL_SYSTEM_PROMPT}
Geef maximaal 12 uitspraken, elk hooguit twee zinnen, in het Nederlands. Wees kort en concreet.
De gegevens zijn gesimuleerd. Noem dat niet bij elke uitspraak.`;

const PROJECT = {
  id: 'speeltuin',
  name: 'Speeltuin: gesimuleerd magazijn voor kleding en schoenen',
  goal: 'Laat bezoekers ervaren hoe Grond het werk op papier naast het vastgelegde werk legt, op gesimuleerde gegevens.',
  boundaries: 'Alle gegevens zijn gesimuleerd. Alleen de bronnen in deze speeltuin worden gebruikt. Het dagwerk van de ordercontrole en de verzending (controle-log, verzend-log, bezetting van controle en verzending) is niet gekoppeld aan de 120 orders. Leg dus geen verband tussen een bepaalde order, zoals de goedgekeurde orders met een verschil, en de bezetting of het dagwerk van een bepaalde dag. Een norm op papier is wat de bronnen noemen; zeg niet dat een afwijking de bedoeling is.',
  ownerLogin: '',
  participants: [],
  githubRepositories: [],
  localRepositories: ['grond-bronnen'],
  sourceFolders: [],
  sourceGrants: [],
  models: [{ task: 'gesprek', provider: 'anthropic', model: MODEL }],
};
const IDENTITY = { kind: 'local', login: '', name: 'Bezoeker' };

// Begrenzing in het geheugen: per draaiende instantie. De echte uitgavenlimiet staat in het Anthropic-account.
const teller: { dag: string; totaal: number; perBezoeker: Map<string, number> } = { dag: '', totaal: 0, perBezoeker: new Map() };

export function begrens(bezoeker: string): string {
  const vandaag = new Date().toISOString().slice(0, 10);
  if (teller.dag !== vandaag) { teller.dag = vandaag; teller.totaal = 0; teller.perBezoeker = new Map(); }
  const gebruikt = teller.perBezoeker.get(bezoeker) || 0;
  if (teller.totaal >= IN_TOTAAL) return 'Grond heeft vandaag genoeg vragen gehad. Probeer het morgen opnieuw.';
  if (gebruikt >= PER_BEZOEKER) return `Je hebt vandaag ${PER_BEZOEKER} vragen gesteld. Morgen kun je weer verder.`;
  teller.totaal += 1;
  teller.perBezoeker.set(bezoeker, gebruikt + 1);
  return '';
}

// Bronnen die bij elke vraag meegaan. Zonder deze twee kan een vraag over orders of picks
// niet worden vergeleken met het werk op papier, omdat de zoekstap ze dan niet kiest.
const KERN_BESTANDEN = ['werkinstructies.json', 'werkinstructies-afdelingen.json', 'kern-overzicht.json'];

// Uitsplitsingen gaan mee als de vraag erom vraagt. Ze zijn klein genoeg om heel mee te geven,
// en een afgekapte tabel geeft een verkeerd gevoel van volledigheid.
const UITSPLITSINGEN: { bestand: string; patroon: RegExp }[] = [
  { bestand: 'kpi-orders.json', patroon: /kpi|afspraak|afgesproken|norm|keten|retour|klant|verzonden|verzend|controle|goedgekeurd|dashboard|papier|verwachting/i },
  { bestand: 'order-controle.json', patroon: /order|pick|inpak|controle|artikel|verzend|retour|klant|bestel|gevraagd|gepickt|ontbr|fout/i },
  { bestand: 'verzendcontrole.json', patroon: /controle|inpak|verzend|goedgekeurd|afgekeurd|keur|gezien|gemist/i },
  { bestand: 'signalen.json', patroon: /signaal|signalen|verklaring|oorzaak|waarom|herplan|schuiv|locatie|\bsi\b|standaard instructie|gezond verstand|vastgelegd|piktijd|cut-?off|steekproef|goedgekeurd/i },
  { bestand: 'kpi-afdelingen.json', patroon: /kpi|norm|afgesproken|papier|verwachting|bezetting|gepland|planning|aanwezig|ziek|verlof|personeel|medewerkers|steekproef|cut-?off|container|route|vervoerder|dhl|dpd|postnl|verzend|controle|pickregels|dagdoel/i },
  { bestand: 'afdelingen-per-week.json', patroon: /week|weken|verloop|trend|bezetting|gepland|aanwezig|ziek|verlof|steekproef|cut-?off|container|verzend|controle|onderbezet|minder mensen/i },
  { bestand: 'scan-per-medewerker.json', patroon: /medewerker|picker|persoon|personen|mensen|\bwie\b|iemand|\bmw-\d/i },
  { bestand: 'scan-per-week.json', patroon: /week|weken|verloop|trend|tijd|maand|maart|april|mei\b|januari|februari|periode|voor en na/i },
  { bestand: 'scan-per-vak.json', patroon: /locatie|\brij\b|rijen|vak|laag|zone|\bwaar\b|plek|magazijn|hoogvolume|\br\d/i },
  // De dagbestanden zijn groot. Ze gaan alleen mee als de vraag over een bepaalde datum gaat; de weekoverzichten en het bewijs bij de KPI's dekken de rest.
  { bestand: 'bezetting.json', patroon: /\b2026-\d\d-\d\d\b|\b\d{1,2} (januari|februari|maart|april|mei)\b|\b\d{1,2}-\d{1,2}-2026\b/i },
  { bestand: 'controle-log.json', patroon: /\b2026-\d\d-\d\d\b|\b\d{1,2} (januari|februari|maart|april|mei)\b|\b\d{1,2}-\d{1,2}-2026\b/i },
  { bestand: 'verzend-log.json', patroon: /\b2026-\d\d-\d\d\b|\b\d{1,2} (januari|februari|maart|april|mei)\b|\b\d{1,2}-\d{1,2}-2026\b/i },
];

const PASSAGE_TEKENS = 7500; // buildModelPrompt kapt een passage af op 8000 tekens

async function vastePassages(vraag: string) {
  const map = path.join(process.cwd(), 'grond-bronnen');
  const bestanden = [...KERN_BESTANDEN, ...UITSPLITSINGEN.filter(({ patroon }) => patroon.test(vraag)).map(({ bestand }) => bestand)];
  const passages: Record<string, unknown>[] = [];
  for (const naam of bestanden) {
    const regels = (await fs.readFile(path.join(map, naam), 'utf8')).trim().split('\n');
    let begin = 0;
    while (begin < regels.length) {
      let eind = begin;
      let lengte = 0;
      while (eind < regels.length && (eind === begin || lengte + regels[eind].length + 1 <= PASSAGE_TEKENS)) { lengte += regels[eind].length + 1; eind += 1; }
      passages.push({
        id: `kern-${passages.length + 1}`,
        status: 'geldig',
        source: 'local:grond-bronnen',
        path: naam,
        version: 'speeltuin-1',
        startLine: begin + 1,
        endLine: eind,
        text: regels.slice(begin, eind).join('\n'),
        score: 1000,
      });
      begin = eind;
    }
  }
  return { passages, bestanden };
}

async function ophalen(args: { sources: string[]; question: string; workspaceRoot: string }) {
  const gevonden = await retrieveEvidence(args);
  const { passages, bestanden } = await vastePassages(args.question);
  const rest = gevonden.evidence.filter((passage: { path: string }) => !bestanden.includes(passage.path));
  return { ...gevonden, evidence: [...passages, ...rest] };
}

async function genereer({ question, project, evidence }: { question: string; project: unknown; evidence: unknown[] }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Grond is nog niet aangesloten op een model.');
  const input = buildModelPrompt({ question, project, evidence });
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, output_config: { effort: 'low' }, system: SYSTEM, messages: [{ role: 'user', content: input }] }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Modelaanroep mislukt (${response.status})`);
  if (data.stop_reason === 'max_tokens') throw new Error('Het antwoord werd te lang. Stel de vraag iets scherper.');
  console.log(JSON.stringify({ grond: { gebruik: data.usage, model: MODEL } }));
  const tekst = (data.content || []).filter((deel: { type: string }) => deel.type === 'text').map((deel: { text: string }) => deel.text).join('\n');
  return { ...parseModelAnswer(tekst), requestId: data.id || '' };
}

export async function beantwoord(vraag: string) {
  const resultaat = await answerQuestion({
    project: PROJECT,
    identity: IDENTITY,
    question: vraag,
    workspaceRoot: process.cwd(),
    retrieve: ophalen,
    generate: genereer,
    log: undefined,
  });
  return { claims: resultaat.claims, evidence: resultaat.evidence, model: MODEL };
}

export const BRONNEN_MAP = path.join(process.cwd(), 'grond-bronnen');
