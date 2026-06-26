import { getDb } from './db';
import { sha8 } from './hash';

// One logger for every tracked action. Middleware, the on-page beacon, the
// logged-redirect and the submit action all funnel through here, so a new thing
// to measure is just a new `event` name, never a new table or code path.
export interface EventInput {
  event: string;
  path?: string | null;
  locale?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  referer?: string | null;
  email?: string | null;
  consent?: boolean | null;
  meta?: Record<string, unknown> | null;
  userAgent?: string | null; // hashed here, never stored raw
}

const str = (v: unknown): string | null => (typeof v === 'string' && v ? v : null);

export async function logEvent(input: EventInput): Promise<void> {
  const sql = getDb();
  if (!sql) return; // no DATABASE_URL: stay dormant, never break the request

  const ua_hash = input.userAgent ? await sha8(input.userAgent) : null;
  const metaJson = input.meta ? JSON.stringify(input.meta) : null;

  try {
    await sql`
      INSERT INTO events (
        event, path, locale,
        utm_source, utm_medium, utm_campaign, utm_content,
        referer, ua_hash, email, consent, meta
      )
      VALUES (
        ${input.event}, ${str(input.path)}, ${str(input.locale)},
        ${str(input.utm_source)}, ${str(input.utm_medium)}, ${str(input.utm_campaign)}, ${str(input.utm_content)},
        ${str(input.referer)}, ${ua_hash}, ${str(input.email)},
        ${input.consent ?? null}, ${metaJson}::jsonb
      )
    `;
  } catch (err) {
    console.error('events insert failed:', err);
  }
}

// Convenience: pull the four UTM params out of a URLSearchParams-like source.
export function readUtm(sp: URLSearchParams) {
  return {
    utm_source: sp.get('utm_source'),
    utm_medium: sp.get('utm_medium'),
    utm_campaign: sp.get('utm_campaign'),
    utm_content: sp.get('utm_content'),
  };
}
