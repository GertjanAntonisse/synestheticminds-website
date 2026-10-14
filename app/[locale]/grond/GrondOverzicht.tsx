import styles from './grond.module.css';
import GrondRegels from './GrondRegels';

type Voorbeeld = { event_id: string; medewerker_id: string; tijdstip_start: string; wat_viel_op: string };
type Periode = { scanregels: number; voldoen: number; afwijkend: number; percentage_voldoet: number; voorbeelden_afwijkend: Voorbeeld[] };
type Instructie = { instructie_id: string; titel: string; op_papier: string; toets: string; periodes: { A: Periode; B: Periode } };
type Week = { week_vanaf: string; gemiddelde_piktijd_seconden: number; scanregels: number };
type Data = {
  periodes: { A: { van: string; tot: string }; B: { van: string; tot: string } };
  instructies: Instructie[];
  piktijd_per_week: Week[];
  piktijd_per_periode: { A: number; B: number };
};

const DAG = 24 * 3600 * 1000;

function vul(sjabloon: string, waarden: Record<string, string | number>) {
  return sjabloon.replace(/\{(\w+)\}/g, (_, sleutel) => String(waarden[sleutel] ?? ''));
}

export default function GrondOverzicht({ locale, data, t }: { locale: string; data: Data; t: Record<string, any> }) {
  const taal = locale === 'en' ? 'en-GB' : 'nl-NL';
  const getal = (n: number) => n.toLocaleString(taal);
  const procent = (n: number) => n.toLocaleString(taal, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const datum = (iso: string) => new Date(iso).toLocaleDateString(taal, { day: 'numeric', month: 'short' });

  const cel = (p: Periode) => (
    <>
      <div className={styles.procent}>{procent(p.percentage_voldoet)}%</div>
      <div className={styles.balk}><i style={{ width: `${p.percentage_voldoet}%` }} /></div>
      <div className={styles.klein}>{vul(t.regelsVan, { n: getal(p.voldoen), m: getal(p.scanregels) })}</div>
    </>
  );

  // grafiek
  const W = 940, H = 280, L = 52, R = 16, T = 20, B = 36;
  const weken = data.piktijd_per_week.map((w) => ({ t: Date.parse(w.week_vanaf) + 3 * DAG, v: w.gemiddelde_piktijd_seconden }));
  const t0 = Date.parse(data.piktijd_per_week[0].week_vanaf);
  const t1 = Date.parse(data.piktijd_per_week[data.piktijd_per_week.length - 1].week_vanaf) + 7 * DAG;
  const waarden = weken.map((w) => w.v);
  const ymin = Math.min(50, Math.min(...waarden) - 5);
  const ymax = Math.max(130, Math.max(...waarden) + 5);
  const X = (ms: number) => L + ((ms - t0) / (t1 - t0)) * (W - L - R);
  const Y = (v: number) => T + ((ymax - v) / (ymax - ymin)) * (H - T - B);
  const stukken: { t: number; v: number }[][] = [];
  weken.forEach((w, i) => {
    if (i === 0 || w.t - weken[i - 1].t > 8 * DAG) stukken.push([]);
    stukken[stukken.length - 1].push(w);
  });
  const wissel = Date.parse(data.periodes.B.van);
  const maanden = [0, 1, 2, 3, 4, 5].map((m) => Date.UTC(2026, m, 1)).filter((ms) => ms >= t0 && ms <= t1);
  const kloof = stukken.length > 1 ? (stukken[0][stukken[0].length - 1].t + stukken[1][0].t) / 2 : null;

  return (
    <>
      <div className={styles.tabelWrap}>
        <table className={styles.tabel}>
          <thead>
            <tr>
              <th>{t.colPapier}</th>
              <th>{t.colVoor}<small>{datum(data.periodes.A.van)} - {datum(data.periodes.A.tot)}</small></th>
              <th>{t.colNa}<small>{datum(data.periodes.B.van)} - {datum(data.periodes.B.tot)}</small></th>
              <th>{t.colBewijs}</th>
            </tr>
          </thead>
          <tbody>
            {data.instructies.map((r) => (
              <tr key={r.instructie_id}>
                <td>
                  <span className={styles.id}>{r.instructie_id}</span><b>{r.titel}</b>
                  <div className={styles.papier}>{r.op_papier}</div>
                  <div className={styles.klein}>{t.gemetenAls}: {r.toets}</div>
                </td>
                <td>{cel(r.periodes.A)}</td>
                <td>{cel(r.periodes.B)}</td>
                <td>
                  <details className={styles.bewijs}>
                    <summary>{vul(t.afwijkend, { n: getal(r.periodes.B.afwijkend) })}</summary>
                    <GrondRegels instructie={r.instructie_id} periode="B" locale={taal} t={{ show: t.showLines, busy: t.showBusy, error: t.showError, total: t.showTotal }} />
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className={styles.grafiekTitel}>{t.chartTitle}</h3>
      <p className={styles.inleiding}>{vul(t.chartP, { a: procent(data.piktijd_per_periode.A), b: procent(data.piktijd_per_periode.B) })}</p>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.chartAria} className={styles.grafiek}>
        <rect x={L} y={Y(120)} width={W - L - R} height={Y(60) - Y(120)} className={styles.band} />
        {[60, 90, 120].map((v) => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} className={styles.raster} />
            <text x={L - 8} y={Y(v) + 4} textAnchor="end" className={styles.as}>{v}</text>
          </g>
        ))}
        <line x1={X(wissel)} x2={X(wissel)} y1={T} y2={H - B} className={styles.markering} />
        <text x={X(wissel) + 8} y={T + 12} className={styles.as}>{t.chartMarker}</text>
        {stukken.map((stuk, i) => (
          <polyline key={i} points={stuk.map((p) => `${X(p.t).toFixed(1)},${Y(p.v).toFixed(1)}`).join(' ')} className={styles.lijn} />
        ))}
        {kloof !== null && <text x={X(kloof)} y={Y(90) - 10} textAnchor="middle" className={styles.as}>{t.chartGap}</text>}
        {maanden.map((ms) => (
          <text key={ms} x={X(ms)} y={H - 12} className={styles.as}>{new Date(ms).toLocaleDateString(taal, { month: 'short', timeZone: 'UTC' })}</text>
        ))}
      </svg>
    </>
  );
}
