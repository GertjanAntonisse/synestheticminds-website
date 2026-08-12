import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const show = (label, rows) => {
  console.log(`\n=== ${label} ===`);
  if (!rows.length) console.log('(geen rijen)');
  else console.table(rows);
};

const range = await sql`SELECT count(*)::int AS totaal, min(ts) AS eerste, max(ts) AS laatste FROM events`;
show('Totale event-log', range);

show('Per event-type', await sql`
  SELECT event, count(*)::int AS n, max(ts) AS laatste
  FROM events GROUP BY event ORDER BY n DESC`);

show('Top paden', await sql`
  SELECT path, count(*)::int AS n
  FROM events WHERE path IS NOT NULL
  GROUP BY path ORDER BY n DESC LIMIT 20`);

show('Zelf-scan pagina (klopt-het-beeld)', await sql`
  SELECT event, count(*)::int AS n, max(ts) AS laatste
  FROM events WHERE path ILIKE '%klopt-het-beeld%'
  GROUP BY event ORDER BY n DESC`);

show('Klopt het nog (e-mailreeks)', await sql`
  SELECT event, count(*)::int AS n, max(ts) AS laatste
  FROM events WHERE path ILIKE '%klopt-het-nog%'
  GROUP BY event ORDER BY n DESC`);

show('Ingezonden scans (submit)', await sql`
  SELECT ts, path, consent, meta->>'proces' AS proces
  FROM events WHERE event = 'submit' ORDER BY ts DESC LIMIT 25`);

show('Herkomst (utm_source)', await sql`
  SELECT coalesce(utm_source,'(geen)') AS bron, count(*)::int AS n
  FROM events GROUP BY 1 ORDER BY n DESC LIMIT 15`);

show('Verwijzers', await sql`
  SELECT coalesce(referer,'(geen)') AS referer, count(*)::int AS n
  FROM events WHERE referer IS NOT NULL GROUP BY 1 ORDER BY n DESC LIMIT 15`);

show('Laatste 14 dagen per dag', await sql`
  SELECT date_trunc('day', ts)::date AS dag, count(*)::int AS n
  FROM events WHERE ts > now() - interval '14 days'
  GROUP BY 1 ORDER BY 1 DESC`);
