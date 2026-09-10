'use client';

import { useEffect, useState } from 'react';
import styles from './boek.module.css';

interface DelenTeksten {
  whatsapp: string;
  linkedin: string;
  facebook: string;
  email: string;
  kopieer: string;
  gekopieerd: string;
  natief: string;
  bericht: string;
  mailOnderwerp: string;
}

interface DelenKnoppenProps {
  locale: string;
  teksten: DelenTeksten;
}

// Elk kanaal krijgt zijn eigen bron in de URL, zodat in de log te zien is via
// welke weg iemand binnenkwam. Zonder dat is doorgeven wel mogelijk maar niet
// waarneembaar, en dan weten we alleen dat er op een knop is gedrukt.
const deelUrl = (basis: string, kanaal: string) =>
  `${basis}?utm_source=${kanaal}&utm_medium=doorgeven&utm_campaign=logica-van-werk`;

export default function DelenKnoppen({ locale, teksten }: DelenKnoppenProps) {
  // De server kent het adres van de bezoeker niet, dus begint dit op het
  // canonieke adres en wordt het na het monteren bijgesteld. Zo klopt de eerste
  // weergave met die van de server en werkt de knop ook op een testomgeving.
  const [basis, setBasis] = useState(`https://synestheticminds.com/${locale}/boek`);
  const [kanNatief, setKanNatief] = useState(false);
  const [gekopieerd, setGekopieerd] = useState(false);

  useEffect(() => {
    setBasis(window.location.origin + window.location.pathname);
    setKanNatief(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, []);

  function meld(kanaal: string) {
    // Losgelaten en niet afgewacht: het doorgeven zelf mag hier nooit op wachten.
    void fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'deel',
        path: `/${locale}/boek`,
        locale,
        utm_campaign: 'logica-van-werk',
        utm_content: kanaal,
      }),
      keepalive: true,
    }).catch(() => {});
  }

  async function kopieer() {
    try {
      await navigator.clipboard.writeText(deelUrl(basis, 'link'));
      setGekopieerd(true);
      meld('link');
      setTimeout(() => setGekopieerd(false), 2500);
    } catch {
      // Zonder klembord (oudere browser, of geen https) gebeurt er niets.
      // De andere knoppen werken dan nog gewoon.
    }
  }

  async function deelNatief() {
    try {
      await navigator.share({ title: teksten.bericht, text: teksten.bericht, url: deelUrl(basis, 'natief') });
      meld('natief');
    } catch {
      // De bezoeker kan het deelvenster ook sluiten; dat is geen fout.
    }
  }

  const kanalen = [
    { naam: 'whatsapp', label: teksten.whatsapp,
      href: `https://wa.me/?text=${encodeURIComponent(`${teksten.bericht} ${deelUrl(basis, 'whatsapp')}`)}` },
    { naam: 'linkedin', label: teksten.linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(deelUrl(basis, 'linkedin'))}` },
    { naam: 'facebook', label: teksten.facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(deelUrl(basis, 'facebook'))}` },
    { naam: 'email', label: teksten.email,
      href: `mailto:?subject=${encodeURIComponent(teksten.mailOnderwerp)}`
          + `&body=${encodeURIComponent(`${teksten.bericht}\n\n${deelUrl(basis, 'email')}`)}` },
  ];

  return (
    <div className={styles.delen}>
      {kanNatief && (
        <button type="button" className={styles.deelKnop} onClick={deelNatief}>
          {teksten.natief}
        </button>
      )}
      {kanalen.map((k) => (
        <a
          key={k.naam}
          href={k.href}
          className={styles.deelKnop}
          target="_blank"
          rel="noopener"
          onClick={() => meld(k.naam)}
        >
          {k.label}
        </a>
      ))}
      <button type="button" className={styles.deelKnop} onClick={kopieer}>
        {gekopieerd ? teksten.gekopieerd : teksten.kopieer}
      </button>
    </div>
  );
}
