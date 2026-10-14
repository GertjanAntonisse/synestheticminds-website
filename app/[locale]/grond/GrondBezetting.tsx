import styles from './grond.module.css';
import bezetting from '../../../grond-bronnen/bezetting.json';
import controleLog from '../../../grond-bronnen/controle-log.json';
import verzendLog from '../../../grond-bronnen/verzend-log.json';

const minuten = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

// Per dag een cel: gekleurd als er minder mensen waren dan gepland of als dat een gevolg had.
export default function GrondBezetting({ t }: { t: Record<string, any> }) {
  const dagen = [...new Set(controleLog.dagen.map((d) => d.datum))];
  const rijen = bezetting.bezetting;
  const onder = (afdeling: string) => new Map(rijen.filter((r) => r.afdeling === afdeling).map((r) => [r.datum, r]));
  const picken = onder('picken');
  const controle = onder('controle');
  const verzending = onder('verzending');
  const steekproef = new Map(controleLog.dagen.map((d) => [d.datum, d]));
  const naCutoff = new Map<string, number>();
  for (const v of verzendLog.dagen) if (minuten(v.container_klaar_om) > minuten(v.cutoff)) naCutoff.set(v.datum, (naCutoff.get(v.datum) || 0) + 1);

  const regels = [
    { naam: t.staffRowPick, vlag: (d: string) => { const r = picken.get(d)!; return r.aanwezig < r.gepland ? t.staffDayLine.replace('{aanwezig}', r.aanwezig).replace('{gepland}', r.gepland) : null; } },
    { naam: t.staffRowControl, vlag: (d: string) => { const r = controle.get(d)!; return r.aanwezig < r.gepland ? t.staffDayLine.replace('{aanwezig}', r.aanwezig).replace('{gepland}', r.gepland) : null; } },
    { naam: t.staffRowSample, vlag: (d: string) => { const r = steekproef.get(d)!; return r.alleen_steekproef > 0 ? `${r.alleen_steekproef} / ${r.orders}` : null; } },
    { naam: t.staffRowShip, vlag: (d: string) => { const r = verzending.get(d)!; return r.aanwezig < r.gepland ? t.staffDayLine.replace('{aanwezig}', r.aanwezig).replace('{gepland}', r.gepland) : null; } },
    { naam: t.staffRowCutoff, vlag: (d: string) => (naCutoff.has(d) ? String(naCutoff.get(d)) : null) },
  ];

  return (
    <div className={styles.strip}>
      <h3 className={styles.tabPaneelTitel}>{t.staffStripTitle}</h3>
      <p className={styles.klein}>{t.staffStripLegend}</p>
      {regels.map((regel) => (
        <div key={regel.naam} className={styles.stripRij}>
          <span className={styles.stripNaam}>{regel.naam}</span>
          <div className={styles.stripCellen}>
            {dagen.map((d) => {
              const tekst = regel.vlag(d);
              return <span key={d} className={tekst ? styles.cel + ' ' + styles.celAan : styles.cel} title={tekst ? `${d}: ${tekst}` : d} />;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
