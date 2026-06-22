import React from 'react';
import Link from 'next/link';
import { getDictionary } from '../../../lib/i18n';
import type { Locale } from '../../../lib/i18n';
import styles from '../../klopt-het-beeld/klopt-het-beeld.module.css';

export default async function ZelfScanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.zelfScan;

  return (
    <>
      {/* ---- Hero ---- */}
      <section className="hero">
        <div className="container">
          <div className="label">{t.heroLabel}</div>
          <h1>{t.heroTitle}</h1>
          <p className="tagline">{t.heroTagline}</p>
        </div>
      </section>

      {/* ---- Intro + tabel ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">{t.scanLabel}</div>
          <h2>{t.scanTitle}</h2>
          <p>{t.scanP}</p>
          <div className={styles.scanTableWrap}>
            <table className={styles.scanTable}>
              <thead>
                <tr>
                  {t.tableHead.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.rows.map((row, i) => (
                  <tr key={i}>
                    <td>{row.thema}</td>
                    <td>{row.beeld}</td>
                    <td>{row.werk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.downloadRow}>
            {t.downloadLead}{' '}
            <a href={t.downloadUrl} target="_blank" rel="noopener noreferrer">
              {t.downloadLabel}
            </a>
          </p>
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

      {/* ---- En nu? / CTA ---- */}
      <section className="cta-section">
        <div className="container">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaP}</p>
          <div className={styles.ctaButtons}>
            <Link href={`/${locale}/contact`} className="cta-button">
              {t.ctaButton}
            </Link>
            <Link href={`/${locale}/evident-design`} className="cta-button-outline">
              {t.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
