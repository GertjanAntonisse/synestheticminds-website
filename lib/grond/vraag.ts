import path from 'node:path';
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
  boundaries: 'Alle gegevens zijn gesimuleerd. Alleen de bronnen in deze speeltuin worden gebruikt.',
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
    generate: genereer,
    log: undefined,
  });
  return { claims: resultaat.claims, evidence: resultaat.evidence, model: MODEL };
}

export const BRONNEN_MAP = path.join(process.cwd(), 'grond-bronnen');
