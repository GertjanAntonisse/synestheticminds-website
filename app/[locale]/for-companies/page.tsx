import Link from 'next/link';
import { getDictionary } from '../../../lib/i18n';
import type { Locale } from '../../../lib/i18n';
import styles from '../../for-companies/for-companies.module.css';

export default async function ForCompaniesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.forCompanies;

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

      {/* ---- The mechanism ---- */}
      <section>
        <div className="container">
          <div className="label">{t.howLabel}</div>
          <h2>{t.howTitle}</h2>
          <div className={styles.stepFlow}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>{t.step1Title}</h3>
                <p>{t.step1P}</p>
              </div>
            </div>
            <div className={styles.stepConnector} />
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>{t.step2Title}</h3>
                <p>{t.step2P}</p>
              </div>
            </div>
            <div className={styles.stepConnector} />
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>{t.step3Title}</h3>
                <p>{t.step3P}</p>
              </div>
            </div>
          </div>
          <div className="callout-amber">
            <p>{t.callout}</p>
          </div>
        </div>
      </section>

      {/* ---- What we do ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">{t.approachLabel}</div>
          <h2>{t.approachTitle}</h2>
          <p>{t.approachP}</p>
          <div className={styles.approachSteps}>
            <div className={styles.approachStep}>
              <div className={styles.stepNum}>1</div>
              <div>
                <h3>{t.step1ApTitle}</h3>
                <p>{t.step1ApP}</p>
              </div>
            </div>
            <div className={styles.approachStep}>
              <div className={styles.stepNum}>2</div>
              <div>
                <h3>{t.step2ApTitle}</h3>
                <p>{t.step2ApP}</p>
              </div>
            </div>
            <div className={styles.approachStep}>
              <div className={styles.stepNum}>3</div>
              <div>
                <h3>{t.step3ApTitle}</h3>
                <p>{t.step3ApP}</p>
              </div>
            </div>
            <div className={styles.approachStep}>
              <div className={styles.stepNum}>4</div>
              <div>
                <h3>{t.step4ApTitle}</h3>
                <p>{t.step4ApP}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Where AI fits ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">{t.aiLabel}</div>
          <h2>{t.aiTitle}</h2>
          <p>{t.aiP1}</p>
          <p>{t.aiP2}</p>
          <div className="callout">
            <p>{t.aiCallout}</p>
          </div>
        </div>
      </section>

      {/* ---- What it looks like ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">{t.practiceLabel}</div>
          <h2>{t.practiceTitle}</h2>
          <p>{t.practiceP1}</p>
          <p>{t.practiceP2}</p>
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
