import React from 'react';
import Link from 'next/link';
import { getDictionary } from '../../../lib/i18n';
import type { Locale } from '../../../lib/i18n';
import styles from '../../in-practice/in-practice.module.css';

export default async function InPracticePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.inPractice;

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

      {/* ---- Two sources ---- */}
      <section>
        <div className="container">
          <div className="label">{t.sourcesLabel}</div>
          <h2>{t.sourcesTitle}</h2>
          <div className={styles.sourcesGrid}>
            <div className={styles.sourceCard}>
              <div className={styles.sourceLabel}>{t.source1Label}</div>
              <h3>{t.source1Title}</h3>
              <p>{t.source1P1}</p>
              <p>{t.source1P2}</p>
            </div>
            <div className={styles.sourceCard}>
              <div className={styles.sourceLabel}>{t.source2Label}</div>
              <h3>{t.source2Title}</h3>
              <p>{t.source2P1}</p>
              <p>{t.source2P2}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- The cycle ---- */}
      <section>
        <div className="container">
          <div className="label">{t.cycleLabel}</div>
          <h2>{t.cycleTitle}</h2>
          <div className={styles.cycleSteps}>
            {[
              { num: 1, title: t.cycle1Title, p: t.cycle1P },
              { num: 2, title: t.cycle2Title, p: t.cycle2P },
              { num: 3, title: t.cycle3Title, p: t.cycle3P },
              { num: 4, title: t.cycle4Title, p: t.cycle4P },
            ].map(({ num, title, p }, i, arr) => (
              <React.Fragment key={num}>
                <div className={styles.cycleStep}>
                  <div className={styles.cycleNum}>{num}</div>
                  <div className={styles.cycleContent}>
                    <h3>{title}</h3>
                    <p>{p}</p>
                  </div>
                </div>
                {i < arr.length - 1 && <div className={styles.cycleArrow}>↓</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CI card ---- */}
      <section>
        <div className="container">
          <div className="label">{t.ciLabel}</div>
          <h2>{t.ciTitle}</h2>
          <div className={styles.ciCard}>
            <div className={styles.ciHeader}>
              <span className={styles.ciTitle}>{t.ciHeader}</span>
              <span className={styles.ciBranch}>{t.ciBranch}</span>
            </div>
            <div className={styles.ciRuns}>
              {[
                { name: 'Pipeline Smoke Tests', status: 'pass', duration: '1m 12s' },
                { name: 'Critical User Journey Gates', status: 'pass', duration: '3m 44s' },
                { name: 'Identity Regression Pack', status: 'pass', duration: '2m 08s' },
                { name: 'Face Grounding Regressions', status: 'pass', duration: '4m 22s' },
                { name: 'Synthesis Provenance Probe', status: 'fail', duration: '5m 01s' },
              ].map((run) => (
                <div
                  key={run.name}
                  className={`${styles.ciRun} ${run.status === 'fail' ? styles.ciRunFail : ''}`}
                >
                  <span className={run.status === 'pass' ? styles.ciPass : styles.ciFail}>
                    {run.status === 'pass' ? '✓' : '✗'}
                  </span>
                  <span className={styles.ciName}>{run.name}</span>
                  <span className={styles.ciDuration}>{run.duration}</span>
                </div>
              ))}
            </div>
            <div className={styles.ciFooter}>
              <span className={styles.ciStatus}>{t.ciFooter}</span>
            </div>
          </div>
          <div className="callout">
            <p>{t.ciCallout}</p>
          </div>
        </div>
      </section>

      {/* ---- Before / after ---- */}
      <section>
        <div className="container">
          <div className="label">{t.baLabel}</div>
          <h2>{t.baTitle}</h2>
          <div className={styles.beforeAfter}>
            <div className={styles.beforeCard}>
              <div className={styles.beforeAfterLabel}>{t.beforeLabel}</div>
              <ul className={styles.contrastList}>
                {[t.before1, t.before2, t.before3, t.before4].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className={styles.afterCard}>
              <div className={styles.beforeAfterLabel}>{t.afterLabel}</div>
              <ul className={styles.contrastList}>
                {[t.after1, t.after2, t.after3, t.after4].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Beyond deploy ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">{t.beyondLabel}</div>
          <h2>{t.beyondTitle}</h2>
          <p>{t.beyondP1}</p>
          <p>{t.beyondP2}</p>
          <div className="callout">
            <p>{t.beyondCallout}</p>
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
