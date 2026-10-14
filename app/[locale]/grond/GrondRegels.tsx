'use client';

import { useState } from 'react';
import styles from './grond.module.css';

type Regel = { event_id: string; medewerker_id: string; locatie: string; tijdstip_start: string; piktijd_seconden: number; wat_viel_op: string };
type Texts = { show: string; busy: string; error: string; total: string };

export default function GrondRegels({ instructie, periode, t, locale }: { instructie: string; periode: string; t: Texts; locale: string }) {
  const [regels, setRegels] = useState<Regel[] | null>(null);
  const [totaal, setTotaal] = useState(0);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState('');

  async function laad() {
    setBezig(true); setFout('');
    try {
      const response = await fetch(`/api/grond/regels?instructie=${instructie}&periode=${periode}&limiet=25`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.fout);
      setRegels(data.regels); setTotaal(data.totaal);
    } catch {
      setFout(t.error);
    } finally {
      setBezig(false);
    }
  }

  if (!regels) {
    return (
      <>
        <button type="button" className={styles.toonRegels} onClick={laad} disabled={bezig}>{bezig ? t.busy : t.show}</button>
        {fout && <p className={styles.melding}>{fout}</p>}
      </>
    );
  }
  return (
    <>
      <p className={styles.klein}>{t.total.replace('{n}', regels.length.toLocaleString(locale)).replace('{m}', totaal.toLocaleString(locale))}</p>
      <ul className={styles.regelLijst}>
        {regels.map((r) => (
          <li key={r.event_id}><b>{r.event_id}</b> · {r.medewerker_id} · {r.locatie} · {r.tijdstip_start.replace('T', ' ')}<br />{r.wat_viel_op}</li>
        ))}
      </ul>
    </>
  );
}
