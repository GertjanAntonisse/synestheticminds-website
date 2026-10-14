'use client';

import { useState } from 'react';
import styles from './grond.module.css';

type Uitspraak = { type: string; text: string; evidenceIds: string[] };
type Bron = { id: string; path: string; startLine: number; endLine: number; text: string };
type Texts = {
  placeholder: string; button: string; busy: string; note: string; tooShort: string; errConn: string; errGeneric: string;
  examples: string[]; typeLabels: Record<string, string>; sourceLine: string; answerNote: string;
};

export default function GrondVraag({ t }: { t: Texts }) {
  const [vraag, setVraag] = useState('');
  const [bezig, setBezig] = useState(false);
  const [melding, setMelding] = useState(t.note);
  const [claims, setClaims] = useState<Uitspraak[]>([]);
  const [bronnen, setBronnen] = useState<Record<string, Bron>>({});

  async function stuur() {
    const schoon = vraag.trim();
    if (schoon.length < 3) { setMelding(t.tooShort); return; }
    setBezig(true); setClaims([]); setMelding(t.note);
    try {
      const response = await fetch('/api/grond/vraag', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ vraag: schoon }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setMelding(data.fout || t.errGeneric); return; }
      setBronnen(Object.fromEntries((data.evidence || []).map((b: Bron) => [b.id, b])));
      setClaims(data.claims || []);
    } catch {
      setMelding(t.errConn);
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className={styles.vraagKader}>
      <textarea
        className={styles.vraagVeld}
        value={vraag}
        maxLength={500}
        onChange={(e) => setVraag(e.target.value)}
        placeholder={t.placeholder}
        aria-label={t.placeholder}
      />
      <div className={styles.voorbeelden}>
        {t.examples.map((v) => (
          <button key={v} type="button" onClick={() => setVraag(v)}>{v}</button>
        ))}
      </div>
      <button type="button" className={styles.stuur} onClick={stuur} disabled={bezig}>{bezig ? t.busy : t.button}</button>
      <p className={styles.melding}>{melding}</p>

      <div aria-live="polite">
        {claims.map((c, i) => (
          <div key={i} className={styles.regel}>
            <span className={`${styles.soort} ${styles[`soort_${c.type}`] || ''}`}>{t.typeLabels[c.type] || c.type}</span>
            {c.text}
            {c.evidenceIds.map((id) => bronnen[id] && (
              <details key={id} className={styles.bron}>
                <summary>{t.sourceLine.replace('{path}', bronnen[id].path).replace('{a}', String(bronnen[id].startLine)).replace('{b}', String(bronnen[id].endLine))}</summary>
                <pre>{bronnen[id].text}</pre>
              </details>
            ))}
          </div>
        ))}
        {claims.length > 0 && <p className={styles.melding}>{t.answerNote}</p>}
      </div>
    </div>
  );
}
