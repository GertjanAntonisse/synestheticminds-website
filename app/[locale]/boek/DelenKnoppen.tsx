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
  geplakt: string;
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
  const [geplakt, setGeplakt] = useState(false);

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

  // Tekst plus adres, want alleen een adres zegt de ontvanger niets.
  const volledigBericht = (kanaal: string) => `${teksten.bericht}\n\n${deelUrl(basis, kanaal)}`;

  async function naarKlembord(kanaal: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(volledigBericht(kanaal));
      return true;
    } catch {
      // Zonder klembord (oudere browser, of geen https) gebeurt er niets.
      // De knoppen zelf werken dan nog gewoon.
      return false;
    }
  }

  async function kopieer() {
    if (!(await naarKlembord('link'))) return;
    setGekopieerd(true);
    meld('link');
    setTimeout(() => setGekopieerd(false), 2500);
  }

  // LinkedIn en Facebook hebben het vooraf invullen van tekst afgeschaft: ze
  // nemen alleen het adres aan en laten de schrijver zelf typen. Wat wel kan is
  // de tekst klaarzetten op het klembord, zodat plakken volstaat.
  function naarVenster(kanaal: string) {
    meld(kanaal);
    if (kanaal === 'linkedin' || kanaal === 'facebook') {
      void naarKlembord(kanaal).then((gelukt) => {
        if (!gelukt) return;
        setGeplakt(true);
        setTimeout(() => setGeplakt(false), 6000);
      });
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
          onClick={() => naarVenster(k.naam)}
        >
          {k.label}
        </a>
      ))}
      <button type="button" className={styles.deelKnop} onClick={kopieer}>
        {gekopieerd ? teksten.gekopieerd : teksten.kopieer}
      </button>
      {geplakt && (
        <p className={styles.deelMelding} role="status">
          {teksten.geplakt}
        </p>
      )}
    </div>
  );
}
