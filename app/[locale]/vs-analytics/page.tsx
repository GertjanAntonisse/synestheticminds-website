import Link from 'next/link';
import { getDictionary } from '../../../lib/i18n';
import type { Locale } from '../../../lib/i18n';
import styles from '../../vs-analytics/vs-analytics.module.css';

export default async function VsAnalyticsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.vsAnalytics;

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

      {/* ---- Core distinction ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">{t.coreLabel}</div>
          <h2>{t.coreTitle}</h2>
          <p>{t.coreP1}</p>
          <p>{t.coreP2}</p>
          <div className="callout">
            <p>{t.coreCallout}</p>
          </div>
        </div>
      </section>

      {/* ---- Comparison table ---- */}
      <section>
        <div className="container">
          <div className="label">{t.tableLabel}</div>
          <h2>{t.tableTitle}</h2>
          <div className={styles.comparisonTable}>
            <div className={styles.tableHeader}>
              <div className={styles.tableCol} />
              <div className={`${styles.tableCol} ${styles.tableColAnalytics}`}>
                {t.tableColAnalytics}<br />
                <span className={styles.tableSubhead}>{t.tableColAnalyticsSub}</span>
              </div>
              <div className={`${styles.tableCol} ${styles.tableColInvariant}`}>
                {t.tableColInvariant}
              </div>
            </div>
            {t.tableRows.map((row, i) => (
              <div key={i} className={styles.tableRow}>
                <div className={`${styles.tableCol} ${styles.tableQuestion}`}>{row.question}</div>
                <div className={`${styles.tableCol} ${styles.tableAnalytics}`}>{row.analytics}</div>
                <div className={`${styles.tableCol} ${styles.tableInvariant}`}>{row.invariant}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Same journey two views ---- */}
      <section>
        <div className="container">
          <div className="label">{t.journeyLabel}</div>
          <h2>{t.journeyTitle}</h2>
          <div className={styles.twoViews}>
            <div className={styles.viewCard}>
              <div className={styles.viewCardLabel}>{t.analyticsView}</div>
              <div className={styles.funnelSteps}>
                {t.funnelSteps.map((s) => (
                  <div key={s.label} className={styles.funnelStep}>
                    <span className={styles.funnelLabel}>{s.label}</span>
                    <span className={styles.funnelPct}>{s.pct}</span>
                    <span className={styles.funnelOk}>&#10003;</span>
                  </div>
                ))}
              </div>
              <p className={styles.viewNote}>{t.analyticsConclusion}</p>
            </div>
            <div className={styles.viewCard}>
              <div className={styles.viewCardLabel}>{t.invariantView}</div>
              <div className={styles.funnelSteps}>
                {t.invariantSteps.map((s) => (
                  <div
                    key={s.label}
                    className={`${styles.funnelStep} ${s.ok ? '' : styles.funnelStepFail}`}
                  >
                    <span className={styles.funnelLabel}>{s.label}</span>
                    {'signal' in s && s.signal && (
                      <span className={styles.funnelSignal}>{s.signal}</span>
                    )}
                    <span className={s.ok ? styles.funnelOk : styles.funnelFail}>
                      {s.ok ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
              <p className={`${styles.viewNote} ${styles.viewNoteFail}`}>{t.invariantConclusion}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Blind spots ---- */}
      <section>
        <div className="container">
          <div className="label">{t.blindLabel}</div>
          <h2>{t.blindTitle}</h2>
          <div className={styles.blindSpots}>
            <div className={styles.blindSpot}>
              <h3>{t.blind1Title}</h3>
              <p>{t.blind1P}</p>
            </div>
            <div className={styles.blindSpot}>
              <h3>{t.blind2Title}</h3>
              <p>{t.blind2P}</p>
            </div>
            <div className={styles.blindSpot}>
              <h3>{t.blind3Title}</h3>
              <p>{t.blind3P}</p>
            </div>
            <div className={styles.blindSpot}>
              <h3>{t.blind4Title}</h3>
              <p>{t.blind4P}</p>
            </div>
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
            <Link href={`/${locale}/in-practice`} className="cta-button-outline">
              {t.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
