import { getDictionary } from '../../../lib/i18n';
import type { Locale } from '../../../lib/i18n';
import styles from '../../klopt-het-nog/klopt-het-nog.module.css';

export default async function KloptHetNogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.kloptHetNog;

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

      {/* ---- Wat is dit ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">{t.aboutLabel}</div>
          <h2>{t.aboutTitle}</h2>
          <p>{t.aboutP1}</p>
          <p>{t.aboutP2}</p>
        </div>
      </section>

      {/* ---- Aanmelding ---- */}
      <section>
        <div className="container">
          <div className="label">{t.formLabel}</div>
          <h2>{t.formTitle}</h2>
          <div className={styles.formCard}>
            <form
              action={`mailto:info@synestheticminds.nl?subject=${encodeURIComponent(t.mailtoSubject)}`}
              method="post"
              encType="text/plain"
            >
              <label className={styles.formLabel} htmlFor="email">
                {t.emailLabel}
              </label>
              <div className={styles.formRow}>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  placeholder={t.emailPlaceholder}
                  className={styles.emailInput}
                />
                <button type="submit" className={styles.submitButton}>
                  {t.submitButton}
                </button>
              </div>
              <p className={styles.formNote}>{t.formNote}</p>
            </form>
            <div className={styles.placeholderBanner}>{t.placeholderBanner}</div>
          </div>
        </div>
      </section>
    </>
  );
}
