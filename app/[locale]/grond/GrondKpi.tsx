import styles from './grond.module.css';

type Kpi = {
  id: string; naam: string; verwachting: string | null; bron_verwachting: string | null;
  cijfer: { teller: number; noemer: number; omschrijving: string };
  bewijs_titel: string; bewijs_totaal?: number; bewijs: Record<string, string | number | boolean | null>[];
};

const LABELS: Record<string, string> = {
  order_id: 'Order', pick_id: 'Pick', retour_id: 'Retour', artikel_id: 'Artikel', aantal: 'Aantal', verschil: 'Verschil',
  controle_alle_artikelen_correct: 'Controle: alle artikelen correct', controle_goedgekeurd: 'Controle: goedgekeurd', reden: 'Reden', reden_retour: 'Reden retour',
  datum: 'Datum', vervoerder: 'Vervoerder', gepland: 'Gepland', aanwezig: 'Aanwezig', ziek: 'Ziek', verlof: 'Verlof', orders: 'Orders', controleurs: 'Controleurs', capaciteit: 'Capaciteit',
  alleen_steekproef: 'Alleen steekproef', afgekeurd: 'Afgekeurd', seconden_per_order: 'Seconden per order', pickregels_per_picker: 'Pickregels per picker', pickers: 'Pickers',
  vastgesteld_om: 'Vastgesteld om', klaar_om: 'Klaar om', cutoff: 'Cut-off', orders_naar_volgende_dag: 'Orders naar volgende dag', verzendmedewerkers: 'Verzendmedewerkers',
};
const waarde = (v: string | number | boolean | null) => (v === true ? 'ja' : v === false ? 'nee' : v === null ? '-' : String(v));

export default function GrondKpi({ kpis, t, locale }: { kpis: Kpi[]; t: Record<string, any>; locale: string }) {
  const nl = (n: number) => n.toLocaleString(locale === 'en' ? 'en-GB' : 'nl-NL');
  return (
    <div className={styles.kpiRaster}>
      {kpis.map((k) => (
        <article key={k.id} className={styles.kpiKaart}>
          <h3>{k.naam}</h3>
          <div className={styles.kpiBlok}>
            <span className={styles.kpiLabel}>{t.kpiPaper}</span>
            {k.verwachting
              ? <p>{k.verwachting} <span className={styles.id}>{k.bron_verwachting}</span></p>
              : <p className={styles.geenNorm}>{t.kpiNoNorm}</p>}
          </div>
          <div className={styles.kpiBlok}>
            <span className={styles.kpiLabel}>{t.kpiReality}</span>
            <div className={styles.kpiGetal}>{nl(k.cijfer.teller)} <small>{t.kpiOf} {nl(k.cijfer.noemer)}</small></div>
            <div className={styles.klein}>{k.cijfer.omschrijving}</div>
          </div>
          <details className={styles.bewijs}>
            <summary>{t.kpiEvidence}: {k.bewijs_titel}</summary>
            {k.bewijs_totaal !== undefined && k.bewijs_totaal > k.bewijs.length && (
              <div className={styles.klein}>{t.kpiShown.replace('{n}', String(k.bewijs.length)).replace('{totaal}', nl(k.bewijs_totaal))}</div>
            )}
            <ul>
              {k.bewijs.map((b, i) => (
                <li key={i}>{Object.entries(b).map(([sleutel, v]) => `${LABELS[sleutel] || sleutel}: ${waarde(v)}`).join(' · ')}</li>
              ))}
            </ul>
          </details>
        </article>
      ))}
    </div>
  );
}
