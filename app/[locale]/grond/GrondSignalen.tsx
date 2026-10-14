import styles from './grond.module.css';

type Signaal = {
  id: string; naam: string; ziet: string | null; kan_nog_niet?: boolean;
  cijfer: { teller: number; noemer: number; omschrijving: string } | null;
  verklaringen: string[]; om_te_weten: string[]; si: { ids: string[]; tekst: string }; voorstel?: string;
  bewijs_titel: string; bewijs: Record<string, string | number | boolean | null>[];
};

const LABELS: Record<string, string> = {
  datum: 'Datum', pickregels_per_picker: 'Pickregels per picker', orders: 'Orders', alleen_steekproef: 'Alleen steekproef', locatie: 'Locatie', piktijd_voor: 'Piktijd voor (s)', piktijd_na: 'Piktijd na (s)',
  vervoerder: 'Vervoerder', klaar_om: 'Klaar om', cutoff: 'Cut-off', orders_naar_volgende_dag: 'Orders naar volgende dag', order_id: 'Order', verschil: 'Verschil',
  melding_a: 'Melding A', melding_b: 'Melding B', controle: 'Controle', medewerker_id: 'Picker', gevraagd: 'Gevraagd', gepickt: 'Gepickt', pick_id: 'Pick', aantal: 'Aantal',
  controle_alle_artikelen_correct: 'Controle: alle artikelen correct', controle_goedgekeurd: 'Controle: goedgekeurd',
};
const waarde = (v: string | number | boolean | null) => (v === true ? 'ja' : v === false ? 'nee' : v === null ? '-' : String(v));

export default function GrondSignalen({ signalen, t, locale }: { signalen: Signaal[]; t: Record<string, any>; locale: string }) {
  const nl = (n: number) => n.toLocaleString(locale === 'en' ? 'en-GB' : 'nl-NL');
  return (
    <div className={styles.signaalLijst}>
      {signalen.map((s) => (
        <article key={s.id} className={styles.signaal}>
          <h3>{s.naam}</h3>
          <div className={styles.kpiBlok}>
            <span className={styles.kpiLabel}>{t.sigSees}</span>
            {s.kan_nog_niet
              ? <p className={styles.geenNorm}>{t.sigCannot}</p>
              : <p>{s.ziet}</p>}
            {s.cijfer && <div className={styles.kpiGetal}>{nl(s.cijfer.teller)} <small>{t.kpiOf} {nl(s.cijfer.noemer)} {s.cijfer.omschrijving}</small></div>}
          </div>
          <div className={styles.signaalRaster}>
            <div className={styles.kpiBlok}>
              <span className={styles.kpiLabel}>{t.sigMaybe}</span>
              <ul>{s.verklaringen.map((v) => <li key={v}>{v}</li>)}</ul>
            </div>
            <div className={styles.kpiBlok}>
              <span className={styles.kpiLabel}>{t.sigCheck}</span>
              <ul>{s.om_te_weten.map((v) => <li key={v}>{v}</li>)}</ul>
            </div>
            <div className={styles.kpiBlok}>
              <span className={styles.kpiLabel}>{t.sigSi}</span>
              <p className={s.si.ids.length ? undefined : styles.geenNorm}>{s.si.tekst} {s.si.ids.map((id) => <span key={id} className={styles.id}>{id} </span>)}</p>
            </div>
          </div>
          {s.voorstel && (
            <div className={styles.kpiBlok}>
              <span className={styles.kpiLabel}>{t.sigPropose}</span>
              <p>{s.voorstel}</p>
            </div>
          )}
          {s.bewijs.length > 0 && (
            <details className={styles.bewijs}>
              <summary>{t.kpiEvidence}: {s.bewijs_titel}</summary>
              <ul>
                {s.bewijs.map((b, i) => (
                  <li key={i}>{Object.entries(b).map(([sleutel, v]) => `${LABELS[sleutel] || sleutel}: ${waarde(v)}`).join(' · ')}</li>
                ))}
              </ul>
            </details>
          )}
        </article>
      ))}
    </div>
  );
}
