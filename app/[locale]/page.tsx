import Link from 'next/link';
import { getDictionary } from '../../lib/i18n';
import type { Locale } from '../../lib/i18n';
import styles from '../home.module.css';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.home;

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

      {/* ---- Three unknowns ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">{t.threeLabel}</div>
          <h2>{t.threeTitle}</h2>
          <p>{t.threeP1}</p>
          <p>{t.threeP2}</p>
          <div className="callout">
            <p>{t.threeCallout}</p>
          </div>
        </div>
      </section>

      {/* ---- What we do ---- */}
      <section>
        <div className="container">
          <div className="label">{t.approachLabel}</div>
          <h2>{t.approachTitle}</h2>
          <div className={styles.cardGrid}>
            <div className={styles.approachCard}>
              <div className={styles.cardLabel}>{t.gertjanLabel}</div>
              <h3>{t.gertjanH3}</h3>
              <p>{t.gertjanP}</p>
            </div>
            <div className={styles.approachCard}>
              <div className={styles.cardLabel}>{t.reneLabel}</div>
              <h3>{t.reneH3}</h3>
              <p>{t.reneP}</p>
            </div>
          </div>
          <p className={styles.belowCards}>{t.belowCards}</p>
        </div>
      </section>

      {/* ---- Two paths ---- */}
      <section>
        <div className="container">
          <div className="label">{t.howLabel}</div>
          <h2>{t.howTitle}</h2>
          <div className={styles.pathGrid}>
            <Link href={`/${locale}/for-companies`} className={styles.pathCard}>
              <div className={styles.pathCardLabel}>{t.path1Label}</div>
              <h3>{t.path1Title}</h3>
              <p>{t.path1P}</p>
              <span className={styles.arrow}>{t.path1Link}</span>
            </Link>
            <Link href={`/${locale}/invariant-design`} className={styles.pathCard}>
              <div className={styles.pathCardLabel}>{t.path2Label}</div>
              <h3>{t.path2Title}</h3>
              <p>{t.path2P}</p>
              <span className={styles.arrow}>{t.path2Link}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ---- The moment to start ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">{t.whenLabel}</div>
          <h2>{t.whenTitle}</h2>
          <p>{t.whenP1}</p>
          <p>{t.whenP2}</p>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="cta-section">
        <div className="container">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaP}</p>
          <Link href={`/${locale}/contact`} className="cta-button">
            {t.ctaButton}
          </Link>
        </div>
      </section>
    </>
  );
}
