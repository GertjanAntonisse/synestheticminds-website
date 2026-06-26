'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { submitScan } from './actions';
import styles from './klopt-het-beeld.module.css';

type Utm = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
};

export interface ScanStrings {
  introLabel: string;
  introTitle: string;
  introP: string;
  procesLabel: string;
  procesPlaceholder: string;
  colThema: string;
  colBeeld: string;
  colWerk: string;
  rows: { thema: string; beeld: string; werk: string }[];
  fillPlaceholder: string;
  exampleNote: string;
  exampleLink: string;
  printButton: string;
  mirrorLabel: string;
  mirrorTitle: string;
  mirrorP: string;
  shareLabel: string;
  shareTitle: string;
  shareP: string;
  nameLabel: string;
  emailLabel: string;
  consentLabel: string;
  shareButton: string;
  sending: string;
  sentOk: string;
  errInvalidEmail: string;
  errGeneric: string;
  ctaTitle: string;
  ctaP: string;
  ctaButton: string;
  ctaSecondary: string;
}

export default function ScanForm({
  t,
  locale,
  contactHref,
  evidentHref,
}: {
  t: ScanStrings;
  locale: string;
  contactHref: string;
  evidentHref: string;
}) {
  const [proces, setProces] = useState('');
  const [answers, setAnswers] = useState(t.rows.map(() => ({ beeld: '', werk: '' })));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [utm, setUtm] = useState<Utm>({ utm_source: '', utm_medium: '', utm_campaign: '', utm_content: '' });

  // Capture the campaign parameters of the landing URL once, so they can travel
  // with the print event and the submission for per-campaign attribution.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setUtm({
      utm_source: sp.get('utm_source') ?? '',
      utm_medium: sp.get('utm_medium') ?? '',
      utm_campaign: sp.get('utm_campaign') ?? '',
      utm_content: sp.get('utm_content') ?? '',
    });
  }, []);

  function setAnswer(i: number, key: 'beeld' | 'werk', value: string) {
    setAnswers((prev) => prev.map((a, j) => (j === i ? { ...a, [key]: value } : a)));
  }

  function handlePrint() {
    try {
      const payload = JSON.stringify({
        event: 'save',
        path: window.location.pathname,
        locale,
        ...utm,
      });
      navigator.sendBeacon?.('/api/event', new Blob([payload], { type: 'application/json' }));
    } catch {
      // Logging is best-effort; never block the print.
    }
    window.print();
  }

  async function handleSend() {
    setErrorMsg('');
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_RE.test(email)) {
      setStatus('error');
      setErrorMsg(t.errInvalidEmail);
      return;
    }
    setStatus('sending');
    const fd = new FormData();
    fd.set('name', name);
    fd.set('email', email);
    fd.set('proces', proces);
    if (consent) fd.set('consent', 'on');
    fd.set('locale', locale);
    fd.set('utm_source', utm.utm_source);
    fd.set('utm_medium', utm.utm_medium);
    fd.set('utm_campaign', utm.utm_campaign);
    fd.set('utm_content', utm.utm_content);
    fd.set(
      'rows',
      JSON.stringify(t.rows.map((r, i) => ({ thema: r.thema, beeld: answers[i].beeld, werk: answers[i].werk })))
    );
    const res = await submitScan(fd);
    if (res.ok) {
      setStatus('ok');
    } else {
      setStatus('error');
      setErrorMsg(res.error === 'invalid_email' ? t.errInvalidEmail : t.errGeneric);
    }
  }

  return (
    <>
      {/* ---- Intro + invulformulier + print ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">{t.introLabel}</div>
          <h2>{t.introTitle}</h2>
          <p>{t.introP}</p>

          <div className={styles.procesField}>
            <label htmlFor="proces">{t.procesLabel}</label>
            <input
              id="proces"
              type="text"
              value={proces}
              onChange={(e) => setProces(e.target.value)}
              placeholder={t.procesPlaceholder}
            />
          </div>

          <div className={styles.scanTableWrap}>
            <table className={styles.scanTable}>
              <thead>
                <tr>
                  <th>{t.colThema}</th>
                  <th>{t.colBeeld}</th>
                  <th>{t.colWerk}</th>
                </tr>
              </thead>
              <tbody>
                {t.rows.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <span className={styles.themaTitle}>{row.thema}</span>
                    </td>
                    <td>
                      <span className={styles.cellQ}>{row.beeld}</span>
                      <textarea
                        value={answers[i].beeld}
                        onChange={(e) => setAnswer(i, 'beeld', e.target.value)}
                        placeholder={t.fillPlaceholder}
                        rows={2}
                      />
                    </td>
                    <td>
                      <span className={styles.cellQ}>{row.werk}</span>
                      <textarea
                        value={answers[i].werk}
                        onChange={(e) => setAnswer(i, 'werk', e.target.value)}
                        placeholder={t.fillPlaceholder}
                        rows={2}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className={styles.exampleNote}>
            {t.exampleNote}{' '}
            <Link href={evidentHref}>{t.exampleLink}</Link>
          </p>

          <div className={styles.printRow}>
            <button type="button" className="cta-button-outline" onClick={handlePrint}>
              {t.printButton}
            </button>
          </div>
        </div>
      </section>

      {/* ---- De spiegel ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">{t.mirrorLabel}</div>
          <h2>{t.mirrorTitle}</h2>
          <div className="callout-amber">
            <p>{t.mirrorP}</p>
          </div>
        </div>
      </section>

      {/* ---- Deel je ingevulde scan ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">{t.shareLabel}</div>
          <h2>{t.shareTitle}</h2>
          <p>{t.shareP}</p>

          {status === 'ok' ? (
            <p className={styles.sentOk}>{t.sentOk}</p>
          ) : (
            <div className={styles.sendCard}>
              <div className={styles.sendFields}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.nameLabel}
                  aria-label={t.nameLabel}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailLabel}
                  aria-label={t.emailLabel}
                />
              </div>
              <label className={styles.consent}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>{t.consentLabel}</span>
              </label>
              <button
                type="button"
                className={`cta-button ${styles.sendButton}`}
                onClick={handleSend}
                disabled={status === 'sending'}
              >
                {status === 'sending' ? t.sending : t.shareButton}
              </button>
              {status === 'error' && <p className={styles.errorMsg}>{errorMsg}</p>}
            </div>
          )}
        </div>
      </section>

      {/* ---- En nu? (afsluitende band) ---- */}
      <section className="cta-section">
        <div className="container">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaP}</p>
          <div className={styles.altLinks}>
            <Link href={contactHref} className="cta-button">
              {t.ctaButton}
            </Link>
            <Link href={evidentHref} className="cta-button-outline">
              {t.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
