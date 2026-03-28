import Link from 'next/link';
import { getDictionary } from '../../../lib/i18n';
import type { Locale } from '../../../lib/i18n';
import styles from '../../why-now/why-now.module.css';

export default async function WhyNowPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.whyNow;

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

      {/* ---- The gap ---- */}
      <section>
        <div className="container">
          <div className="label">{t.gapLabel}</div>
          <h2>{t.gapTitle}</h2>
          <p>{t.gapP}</p>
          <div className={styles.gapViz}>
            <div className={styles.gapRow}>
              <span className={styles.gapLabel}>{t.gapRow1Label}</span>
              <div className={styles.gapBar}>
                <div className={`${styles.gapFill} ${styles.gapFillAccent}`} style={{ width: '75%' }} />
              </div>
              <span className={styles.gapValue}>{t.gapRow1Value}</span>
            </div>
            <div className={styles.gapRow}>
              <span className={styles.gapLabel}>{t.gapRow2Label}</span>
              <div className={styles.gapBar}>
                <div className={`${styles.gapFill} ${styles.gapFillAmber}`} style={{ width: '88%' }} />
              </div>
              <span className={styles.gapValue}>{t.gapRow2Value}</span>
            </div>
            <div className={styles.gapRow}>
              <span className={styles.gapLabel}>{t.gapRow3Label}</span>
              <div className={styles.gapBar}>
                <div className={`${styles.gapFill} ${styles.gapFillMuted}`} style={{ width: '22%' }} />
              </div>
              <span className={styles.gapValue}>{t.gapRow3Value}</span>
            </div>
          </div>
          <div className="callout-amber">
            <p>{t.gapCallout}</p>
          </div>
        </div>
      </section>

      {/* ---- Timeline ---- */}
      <section>
        <div className="container">
          <div className="label">{t.timelineLabel}</div>
          <h2>{t.timelineTitle}</h2>
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineMarker}>
                <span className={styles.timelineWeek}>{t.week1}</span>
              </div>
              <div className={styles.timelineContent}>
                <h3>{t.week1Title}</h3>
                <p>{t.week1P}</p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <div className={`${styles.timelineMarker} ${styles.timelineMarkerAmber}`}>
                <span className={styles.timelineWeek}>{t.week2}</span>
              </div>
              <div className={styles.timelineContent}>
                <h3>{t.week2Title}</h3>
                <p>{t.week2P}</p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <div className={`${styles.timelineMarker} ${styles.timelineMarkerRed}`}>
                <span className={styles.timelineWeek}>{t.week3}</span>
              </div>
              <div className={styles.timelineContent}>
                <h3>{t.week3Title}</h3>
                <p>{t.week3P}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- The insight ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">{t.insightLabel}</div>
          <h2>{t.insightTitle}</h2>
          <p>{t.insightP1}</p>
          <p>{t.insightP2}</p>
          <div className="callout">
            <p>{t.insightCallout}</p>
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="cta-section">
        <div className="container">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaP}</p>
          <div className={styles.ctaButtons}>
            <Link href={`/${locale}/invariant-design`} className="cta-button">
              {t.ctaButton}
            </Link>
            <Link href={`/${locale}/vs-analytics`} className="cta-button-outline">
              {t.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
