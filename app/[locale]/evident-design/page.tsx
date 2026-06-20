import React from 'react';
import Link from 'next/link';
import { getDictionary } from '../../../lib/i18n';
import type { Locale } from '../../../lib/i18n';
import styles from '../../evident-design/evident-design.module.css';

export default async function EvidentDesignPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.evidentDesign;

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

      {/* ---- Recognition ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">{t.recogLabel}</div>
          <h2>{t.recogTitle}</h2>
          <p>{t.recogP1}</p>
          <p>{t.recogP2}</p>
          <div className="callout-amber">
            <p>{t.recogCallout}</p>
          </div>
        </div>
      </section>

      {/* ---- The core ---- */}
      <section>
        <div className="container">
          <div className="label">{t.coreLabel}</div>
          <h2>{t.coreTitle}</h2>
          <p>{t.coreP}</p>
          <div className={styles.valueChain}>
            {t.chain.map((item, i, arr) => (
              <React.Fragment key={item}>
                <div className={styles.chainItem}>
                  <span className={styles.chainLabel}>{item}</span>
                </div>
                {i < arr.length - 1 && <div className={styles.chainArrow}>&rarr;</div>}
              </React.Fragment>
            ))}
          </div>
          <p className={styles.chainNote}>{t.chainNote}</p>
        </div>
      </section>

      {/* ---- 4-step approach ---- */}
      <section>
        <div className="container">
          <div className="label">{t.howLabel}</div>
          <h2>{t.howTitle}</h2>
          <div className={styles.stepsRow}>
            {[
              { num: 1, title: t.step1Title, p: t.step1P },
              { num: 2, title: t.step2Title, p: t.step2P },
              { num: 3, title: t.step3Title, p: t.step3P },
              { num: 4, title: t.step4Title, p: t.step4P },
            ].map(({ num, title, p }) => (
              <div key={num} className={styles.stepCard}>
                <div className={styles.stepNum}>{num}</div>
                <h3>{title}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Where it leads ---- */}
      <section>
        <div className="container">
          <div className="label">{t.ladderLabel}</div>
          <h2>{t.ladderTitle}</h2>
          <p>{t.ladderP}</p>
          <div className={styles.valueChain}>
            {t.ladder.map((item, i, arr) => (
              <React.Fragment key={item}>
                <div className={styles.chainItem}>
                  <span className={styles.chainLabel}>{item}</span>
                </div>
                {i < arr.length - 1 && <div className={styles.chainArrow}>&rarr;</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Proven ---- */}
      <section>
        <div className="container">
          <div className="label">{t.provenLabel}</div>
          <h2>{t.provenTitle}</h2>
          <p className={styles.projectNote}>{t.provenNote}</p>
        </div>
      </section>

      {/* ---- SI: onze eigen standaard ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">{t.siLabel}</div>
          <h2>{t.siTitle}</h2>
          <p>{t.siP}</p>
          <div className={styles.siTableWrap}>
            <table className={styles.siTable}>
              <thead>
                <tr>
                  {t.siHead.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.siRows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="cta-section">
        <div className="container">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaP}</p>
          <div className={styles.ctaButtons}>
            <Link href={`/${locale}/contact`} className="cta-button">
              {t.ctaButton}
            </Link>
            <Link href={`/${locale}/invariant-design`} className="cta-button-outline">
              {t.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
