import { getDictionary } from '../../../lib/i18n';
import type { Locale } from '../../../lib/i18n';
import styles from '../../contact/contact.module.css';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.contact;

  const linkedinSvg = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );

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

      {/* ---- Contact cards ---- */}
      <section>
        <div className="container">
          <div className={styles.contactCards}>
            <div className={styles.contactCard}>
              <div className={styles.contactLabel}>{t.gertjanLabel}</div>
              <h2>Gertjan Antonisse</h2>
              <p>{t.gertjanP}</p>
              <a
                href="https://www.linkedin.com/in/gertjan-antonisse/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkedinButton}
              >
                {linkedinSvg}
                {t.gertjanLinkedin}
              </a>
            </div>
            <div className={styles.contactCard}>
              <div className={styles.contactLabel}>{t.reneLabel}</div>
              <h2>René Luijk</h2>
              <p>{t.reneP}</p>
              <a
                href="https://www.linkedin.com/in/reneluijk/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkedinButton}
              >
                {linkedinSvg}
                {t.reneLinkedin}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---- What to expect ---- */}
      <section>
        <div className="container">
          <h2>{t.expectTitle}</h2>
          <div className={styles.expectList}>
            {[t.expect1, t.expect2, t.expect3].map((text, i) => (
              <div key={i} className={styles.expectItem}>
                <div className={styles.expectNum}>{i + 1}</div>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
