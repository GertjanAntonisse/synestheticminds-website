#!/usr/bin/env node
/**
 * Bouwt het verkeersdashboard van synestheticminds.com als zelfstandige HTML.
 *
 * Waarom gegenereerd en niet live: de pagina wordt gepubliceerd in sm-overzicht,
 * en een gepubliceerde pagina kan de database niet bevragen zonder de sleutel mee
 * te geven. Bovendien hoort bij een meting het moment waarop ze is gedaan. Een
 * dashboard dat altijd "nu" zegt, verbergt dat het al een week niet is ververst.
 *
 *   node scripts/maak-verkeer-overzicht.mjs [uitvoerpad]
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const HIER = dirname(fileURLToPath(import.meta.url));
// Standaard buiten elke repo. sm-overzicht is een publieke repo met GitHub Pages
// eronder, en dan zouden je bezoekcijfers, je lege downloadteller en de reeksen
// van losse bezoekers op straat liggen. Wie hem wel wil publiceren, geeft zelf een
// pad op en weet dan wat hij doet.
const UIT = process.argv[2]
  ? resolve(process.argv[2])
  : join(process.env.HOME, 'ai-projects', 'verkeer-dashboard.html');

const config = JSON.parse(readFileSync(join(HIER, 'eigen-verkeer.json'), 'utf8'));
const EIGEN = config.afdrukken;
const SONDE = new RegExp(config.sondepaden, 'i');

const sql = neon(process.env.DATABASE_URL);
const alles = await sql`
  SELECT ts, event, path, locale, utm_source, utm_medium, utm_campaign, utm_content,
         referer, ua_hash, meta
  FROM events ORDER BY ts`;

// ── Wie tellen er mee ────────────────────────────────────────────────────────
// Een afdruk die ooit een sondepad raakte (wp-login, /admin, .env) is geen lezer.
// Dat is een grover filter dan de user-agent-lijst in de middleware, en het vangt
// juist de scanners die zich als browser voordoen.
const botAfdrukken = new Set(
  alles.filter((r) => r.path && SONDE.test(r.path)).map((r) => r.ua_hash).filter(Boolean),
);
// Een handeling (download, koop, deel) loopt langs /api/go en wordt daar
// vastgelegd, ook als een crawler de link volgt. Ze telt dus alleen als mens
// wanneer ze uit een van onze eigen pagina's komt. Dat is geen waterdichte grens:
// een bezoeker met strenge privacy-instellingen stuurt ook geen verwijzing mee, en
// valt hier dus ten onrechte af. De pagina noemt dat, zodat het getal niet
// zekerder oogt dan het is.
const EIGEN_PAGINA = /^https?:\/\/(www\.)?synestheticminds\.com\//i;
const HANDELING = new Set(['download', 'koop', 'deel']);
const soort = (r) => {
  if (r.ua_hash && EIGEN[r.ua_hash]) return 'eigen';
  if (r.ua_hash && botAfdrukken.has(r.ua_hash)) return 'bot';
  if (r.meta && r.meta.bot) return 'bot';
  if (HANDELING.has(r.event) && !(r.referer && EIGEN_PAGINA.test(r.referer))) return 'losse-klik';
  return 'mens';
};
const mens = alles.filter((r) => soort(r) === 'mens');
const losseKliks = alles.filter((r) => soort(r) === 'losse-klik');
const weggelaten = {
  bot: alles.filter((r) => soort(r) === 'bot').length,
  botAfdrukken: botAfdrukken.size,
  eigen: alles.filter((r) => soort(r) === 'eigen').length,
  eigenAfdrukken: Object.keys(EIGEN).length,
  los: losseKliks.length,
  losAfdrukken: new Set(losseKliks.map((r) => r.ua_hash)).size,
};

// ── Rekenwerk ────────────────────────────────────────────────────────────────
const tel = (rijen, sleutel) => {
  const m = new Map();
  for (const r of rijen) {
    const k = sleutel(r);
    if (k === null || k === undefined) continue;
    m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};
const dag = (ts) => new Date(ts).toISOString().slice(0, 10);

const bezoeken = mens.filter((r) => r.event === 'visit');
const downloads = mens.filter((r) => r.event === 'download');
const delen = mens.filter((r) => r.event === 'deel');
const kopen = mens.filter((r) => r.event === 'koop');
const scans = mens.filter((r) => r.event === 'submit');
const bezoekers = new Set(mens.map((r) => r.ua_hash).filter(Boolean)).size;

// laatste 30 dagen, ook de dagen zonder bezoek, anders liegt de vorm van de grafiek
const vandaag = new Date();
const dagen = [];
for (let i = 29; i >= 0; i--) {
  const d = new Date(vandaag); d.setUTCDate(d.getUTCDate() - i);
  dagen.push(d.toISOString().slice(0, 10));
}
const perDag = new Map(tel(bezoeken, (r) => dag(r.ts)));
const reeks = dagen.map((d) => ({ dag: d, n: perDag.get(d) || 0 }));

const perPagina = tel(bezoeken, (r) => r.path).slice(0, 12);
const perDownload = tel(downloads, (r) => r.utm_content || '(zonder code)');
const perKanaal = tel(delen, (r) => r.utm_content || '(onbekend)');

// herkomst: alleen wat een code draagt, met wat die bezoekers daarna deden
const herkomst = new Map();
for (const r of mens) {
  if (!r.utm_source) continue;
  const k = [r.utm_source, r.utm_medium || '', r.utm_content || ''].join(' · ');
  const h = herkomst.get(k) || { bezoek: 0, download: 0, deel: 0 };
  if (r.event === 'visit') h.bezoek++;
  if (r.event === 'download') h.download++;
  if (r.event === 'deel') h.deel++;
  herkomst.set(k, h);
}

// bezoekersreeksen: wat deed iemand achter elkaar, met een half uur als grens
const sessies = [];
for (const afdruk of new Set(mens.map((r) => r.ua_hash).filter(Boolean))) {
  const eigen = mens.filter((r) => r.ua_hash === afdruk);
  let huidig = null;
  for (const r of eigen) {
    const t = new Date(r.ts).getTime();
    if (!huidig || t - huidig.eind > 30 * 60 * 1000) {
      huidig = { afdruk, start: t, eind: t, stappen: [] };
      sessies.push(huidig);
    }
    huidig.eind = t;
    huidig.stappen.push(r.event === 'visit' ? (r.path || '?') : r.event.toUpperCase());
  }
}
sessies.sort((a, b) => b.start - a.start);

// ── Opmaak ───────────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const nl = (n) => n.toLocaleString('nl-NL');
const tijd = (t) => new Date(t).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// Eén reeks, één kleur. Identiteit hangt hier nooit aan kleur: elke staaf draagt
// haar eigen label, dus er is niets te verwarren en geen legenda nodig.
const hoogste = Math.max(1, ...reeks.map((d) => d.n));
const BB = 26, BH = 150;
const staven = reeks.map((d, i) => {
  const h = Math.round((d.n / hoogste) * BH);
  const x = i * BB;
  return `<g class="staaf"><rect x="${x + 4}" y="${BH - h}" width="${BB - 8}" height="${Math.max(h, d.n ? 2 : 0)}" rx="4" fill="#0f766e"/>`
    + `<rect x="${x}" y="0" width="${BB}" height="${BH}" fill="transparent"><title>${d.dag}: ${d.n} ${d.n === 1 ? 'bezoek' : 'bezoeken'}</title></rect></g>`;
}).join('');

const balk = (n, max) => `<span class="balk" style="width:${Math.max(2, Math.round((n / Math.max(max, 1)) * 100))}%"></span>`;
const maxPagina = perPagina.length ? perPagina[0][1] : 1;

const html = `<!DOCTYPE html><html lang="nl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Verkeer · Synesthetic Minds</title>
<style>
:root{--bg:#f6f3ec;--surface:#fffdf8;--ink:#1f2937;--muted:#667085;--line:#ddd5c7;--accent:#0f766e}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Inter",sans-serif;background:var(--bg);color:var(--ink);padding:40px 20px;line-height:1.5}
.wrap{max-width:1000px;margin:0 auto}
h1{font-size:28px;font-weight:800;letter-spacing:-.01em}
h2{font-size:18px;font-weight:700;margin:0 0 14px}
.meta{color:var(--muted);font-size:14px;margin-top:4px}
section{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:24px 26px;margin-top:22px}
.tegels{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin-top:22px}
.tegel{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:18px 20px}
.tegel .n{font-size:32px;font-weight:800;line-height:1.1}
.tegel .l{color:var(--muted);font-size:13px;margin-top:2px}
table{width:100%;border-collapse:collapse;font-size:14px}
th{text-align:left;font-weight:600;color:var(--muted);font-size:12px;letter-spacing:.06em;text-transform:uppercase;padding:0 10px 8px 0;border-bottom:1px solid var(--line)}
td{padding:9px 10px 9px 0;border-bottom:1px solid #efeade;vertical-align:middle}
td.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
tr:last-child td{border-bottom:none}
.balkcel{width:38%}
.balk{display:block;height:8px;background:var(--accent);border-radius:4px;opacity:.85}
.staaf rect:first-child{transition:fill .15s}
.staaf:hover rect:first-child{fill:#0b5c56}
.as{font-size:11px;fill:var(--muted)}
.let-op{background:#fdf6e8;border:1px solid #e8d9b5;border-radius:12px;padding:16px 18px;margin-top:22px;font-size:14px}
.pad{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px}
.stap{display:inline-block;background:#f1ede3;border-radius:5px;padding:1px 7px;margin:2px 4px 2px 0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px}
.stap.doel{background:#dcefe9;color:#0b5c56;font-weight:700}
footer{color:var(--muted);font-size:13px;margin-top:26px}
@media(max-width:680px){body{padding:20px 14px}.balkcel{display:none}}
</style></head><body><div class="wrap">

<h1>Verkeer op synestheticminds.com</h1>
<div class="meta">Meting van ${tijd(Date.now())}. Eerste vastlegging ${tijd(alles[0].ts)}. Dit is een momentopname, geen live beeld.</div>

<div class="tegels">
  <div class="tegel"><div class="n">${nl(bezoekers)}</div><div class="l">bezoekers</div></div>
  <div class="tegel"><div class="n">${nl(bezoeken.length)}</div><div class="l">bezoeken</div></div>
  <div class="tegel"><div class="n">${nl(downloads.length)}</div><div class="l">downloads</div></div>
  <div class="tegel"><div class="n">${nl(delen.length)}</div><div class="l">deel-kliks</div></div>
  <div class="tegel"><div class="n">${nl(scans.length)}</div><div class="l">scans ingevuld</div></div>
  <div class="tegel"><div class="n">${nl(kopen.length)}</div><div class="l">koop-kliks</div></div>
</div>

<div class="let-op"><strong>Wat hier niet in zit.</strong>
${nl(weggelaten.bot)} gebeurtenissen van ${weggelaten.botAfdrukken} bezoekers die ergens een sondepad raakten (${esc(config.sondepaden)}), en ${nl(weggelaten.eigen)} van ${weggelaten.eigenAfdrukken} eigen afdrukken.
En ${nl(weggelaten.los)} handelingen van ${weggelaten.losAfdrukken} afdrukken die niet vanaf een eigen pagina kwamen: een download of koop-klik zonder dat er ooit een pagina werd geopend, wat crawlers doen die de links aflopen.
Samen ${nl(weggelaten.bot + weggelaten.eigen + weggelaten.los)} van de ${nl(alles.length)} vastgelegde gebeurtenissen, oftewel ${Math.round(((weggelaten.bot + weggelaten.eigen + weggelaten.los) / alles.length) * 100)} procent.
Wie dat zijn en waarom staat in <span class="pad">scripts/eigen-verkeer.json</span>.
<div style="margin-top:10px;color:var(--muted)">Die laatste grens is niet waterdicht: wie met strenge privacy-instellingen surft, stuurt ook geen verwijzing mee en valt hier ten onrechte af. Het getal is dus eerder te laag dan te hoog.</div></div>

<section>
  <h2>Bezoeken per dag, laatste dertig dagen</h2>
  <svg viewBox="0 0 ${30 * BB} ${BH + 22}" width="100%" height="${BH + 22}" role="img" aria-label="Bezoeken per dag over de laatste dertig dagen">
    ${staven}
    <line x1="0" y1="${BH}" x2="${30 * BB}" y2="${BH}" stroke="#ddd5c7" stroke-width="1"/>
    <text class="as" x="0" y="${BH + 16}">${reeks[0].dag.slice(5)}</text>
    <text class="as" x="${30 * BB}" y="${BH + 16}" text-anchor="end">${reeks[29].dag.slice(5)}</text>
  </svg>
  <div class="meta">Hoogste dag: ${hoogste} ${hoogste === 1 ? 'bezoek' : 'bezoeken'}. Wijs een staaf aan voor de datum.</div>
</section>

<section>
  <h2>Waar mensen komen</h2>
  <table><thead><tr><th>Pagina</th><th></th><th class="n">Bezoeken</th></tr></thead><tbody>
  ${perPagina.map(([p, n]) => `<tr><td class="pad">${esc(p)}</td><td class="balkcel">${balk(n, maxPagina)}</td><td class="n">${nl(n)}</td></tr>`).join('')}
  </tbody></table>
</section>

<section>
  <h2>Wat er wordt opgehaald</h2>
  ${downloads.length ? `<table><thead><tr><th>Bestand</th><th class="n">Downloads</th><th class="n">Laatste</th></tr></thead><tbody>
  ${perDownload.map(([k, n]) => `<tr><td class="pad">${esc(k)}</td><td class="n">${nl(n)}</td><td class="n">${tijd(downloads.filter((d) => (d.utm_content || '(zonder code)') === k).slice(-1)[0].ts)}</td></tr>`).join('')}
  </tbody></table>` : '<div class="meta">Nog geen downloads van buiten de eigen afdrukken.</div>'}
  ${delen.length ? `<h2 style="margin-top:22px">Doorgegeven via</h2><table><tbody>${perKanaal.map(([k, n]) => `<tr><td>${esc(k)}</td><td class="n">${nl(n)}</td></tr>`).join('')}</tbody></table>` : ''}
</section>

<section>
  <h2>Waar ze vandaan kwamen</h2>
  ${herkomst.size ? `<table><thead><tr><th>Bron · kanaal · plek</th><th class="n">Bezoeken</th><th class="n">Downloads</th><th class="n">Gedeeld</th></tr></thead><tbody>
  ${[...herkomst.entries()].sort((a, b) => b[1].bezoek - a[1].bezoek).map(([k, h]) => `<tr><td>${esc(k)}</td><td class="n">${nl(h.bezoek)}</td><td class="n">${nl(h.download)}</td><td class="n">${nl(h.deel)}</td></tr>`).join('')}
  </tbody></table>
  <div class="meta" style="margin-top:12px">Alleen bezoek met een campagnecode. Al het andere komt binnen zonder herkomst en staat hierboven bij de pagina's.</div>` : '<div class="meta">Nog geen verkeer met een campagnecode.</div>'}
</section>

<section>
  <h2>Wat bezoekers achter elkaar deden</h2>
  <table><thead><tr><th>Wanneer</th><th>Stappen</th></tr></thead><tbody>
  ${sessies.slice(0, 20).map((s) => `<tr><td class="n" style="text-align:left">${tijd(s.start)}</td><td>${s.stappen.map((p) => `<span class="stap${/DOWNLOAD|DEEL|SUBMIT|KOOP/.test(p) ? ' doel' : ''}">${esc(p)}</span>`).join('')}</td></tr>`).join('')}
  </tbody></table>
  <div class="meta" style="margin-top:12px">Een reeks breekt af na een half uur stilte. Groen is een handeling, de rest is een pagina.</div>
</section>

<footer>Gegenereerd met <span class="pad">scripts/maak-verkeer-overzicht.mjs</span> uit de events-tabel. Opnieuw draaien geeft een nieuwe momentopname.</footer>
</div></body></html>`;

writeFileSync(UIT, html);
console.log(`Klaar: ${UIT}`);
console.log(`${bezoekers} bezoekers, ${bezoeken.length} bezoeken, ${downloads.length} downloads, ${delen.length} deel-kliks`);
console.log(`weggelaten: ${weggelaten.bot} bot + ${weggelaten.eigen} eigen van ${alles.length} gebeurtenissen`);
