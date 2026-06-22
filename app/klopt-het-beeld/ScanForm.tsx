'use client';

import React, { useState } from 'react';
import { submitScan } from './actions';
import styles from './klopt-het-beeld.module.css';

export interface ScanStrings {
  procesLabel: string;
  procesPlaceholder: string;
  colThema: string;
  colBeeld: string;
  colWerk: string;
  rows: { thema: string; beeld: string; werk: string }[];
  fillPlaceholder: string;
  nameLabel: string;
  emailLabel: string;
  consentLabel: string;
  printButton: string;
  sendButton: string;
  sending: string;
  sentOk: string;
  errInvalidEmail: string;
  errGeneric: string;
}

export default function ScanForm({ t }: { t: ScanStrings }) {
  const [proces, setProces] = useState('');
  const [answers, setAnswers] = useState(t.rows.map(() => ({ beeld: '', werk: '' })));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function setAnswer(i: number, key: 'beeld' | 'werk', value: string) {
    setAnswers((prev) => prev.map((a, j) => (j === i ? { ...a, [key]: value } : a)));
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
    <div>
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

      {status === 'ok' ? (
        <p className={styles.sentOk}>{t.sentOk}</p>
      ) : (
        <div className={styles.actions}>
          <button type="button" className="cta-button-outline" onClick={() => window.print()}>
            {t.printButton}
          </button>

          <div className={styles.sendBlock}>
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
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>{t.consentLabel}</span>
            </label>
            <button
              type="button"
              className="cta-button"
              onClick={handleSend}
              disabled={status === 'sending'}
            >
              {status === 'sending' ? t.sending : t.sendButton}
            </button>
            {status === 'error' && <p className={styles.errorMsg}>{errorMsg}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
