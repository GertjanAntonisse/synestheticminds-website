import React from 'react';
import Link from 'next/link';
import { getDictionary } from '../../../lib/i18n';
import type { Locale } from '../../../lib/i18n';
import styles from '../../invariant-design/invariant-design.module.css';

export default async function InvariantDesignPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.invariantDesign;

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
            {['Promise', 'Invariant', 'Runtime check', 'Signal on the row', 'Decision'].map((item, i, arr) => (
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

      {/* ---- Defense rings ---- */}
      <section>
        <div className="container">
          <div className="label">{t.structureLabel}</div>
          <h2>{t.structureTitle}</h2>
          <div className={styles.ringsGrid}>
            <div className={`${styles.ring} ${styles.ringGreen}`}>
              <div className={styles.ringHeader}>
                <span className={styles.ringBadge}>{t.ring1Badge}</span>
                <span className={styles.ringAction}>{t.ring1Action}</span>
              </div>
              <h3>{t.ring1Title}</h3>
              <p>{t.ring1P}</p>
            </div>
            <div className={`${styles.ring} ${styles.ringBlue}`}>
              <div className={styles.ringHeader}>
                <span className={styles.ringBadge}>{t.ring2Badge}</span>
                <span className={styles.ringAction}>{t.ring2Action}</span>
              </div>
              <h3>{t.ring2Title}</h3>
              <p>{t.ring2P}</p>
            </div>
            <div className={`${styles.ring} ${styles.ringAmber}`}>
              <div className={styles.ringHeader}>
                <span className={styles.ringBadge}>{t.ring3Badge}</span>
                <span className={styles.ringAction}>{t.ring3Action}</span>
              </div>
              <h3>{t.ring3Title}</h3>
              <p>{t.ring3P}</p>
            </div>
            <div className={`${styles.ring} ${styles.ringPlum}`}>
              <div className={styles.ringHeader}>
                <span className={styles.ringBadge}>{t.ring4Badge}</span>
                <span className={styles.ringAction}>{t.ring4Action}</span>
              </div>
              <h3>{t.ring4Title}</h3>
              <p>{t.ring4P}</p>
            </div>
          </div>
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

      {/* ---- Where applied ---- */}
      <section>
        <div className="container">
          <div className="label">{t.provenLabel}</div>
          <h2>{t.provenTitle}</h2>
          <div className={styles.projectGrid}>
            {['ThreadC', 'TrackAndBack', 'SessionMCP', 'Tradeflow'].map((name) => (
              <div key={name} className={styles.projectTag}>{name}</div>
            ))}
          </div>
          <p className={styles.projectNote}>{t.provenNote}</p>
        </div>
      </section>

      {/* ---- Stats card ---- */}
      <section>
        <div className="container">
          <div className={styles.proofCard}>
            <div className="label">{t.numbersLabel}</div>
            <h2>{t.numbersTitle}</h2>
            <div className={styles.proofStats}>
              <div className={styles.proofStat}>
                <span className={styles.statNum}>{t.stat1Num}</span>
                <span className={styles.statLabel}>{t.stat1Label}</span>
              </div>
              <div className={styles.proofStat}>
                <span className={styles.statNum}>{t.stat2Num}</span>
                <span className={styles.statLabel}>{t.stat2Label}</span>
              </div>
              <div className={styles.proofStat}>
                <span className={styles.statNum}>{t.stat3Num}</span>
                <span className={styles.statLabel}>{t.stat3Label}</span>
              </div>
            </div>
            <p className={styles.proofDesc}>{t.numbersDesc}</p>
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="cta-section">
        <div className="container">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaP}</p>
          <div className={styles.ctaButtons}>
            <a
              href="https://www.linkedin.com/in/reneluijk/"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button"
            >
              {t.ctaButton}
            </a>
            <Link href={`/${locale}/for-companies`} className="cta-button-outline">
              {t.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
