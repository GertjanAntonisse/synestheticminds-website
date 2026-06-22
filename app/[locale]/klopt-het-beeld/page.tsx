import Link from 'next/link';
import { getDictionary } from '../../../lib/i18n';
import type { Locale } from '../../../lib/i18n';
import ScanForm from '../../klopt-het-beeld/ScanForm';
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

      {/* ---- Intro + invulformulier ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">{t.scanLabel}</div>
          <h2>{t.scanTitle}</h2>
          <p>{t.scanP}</p>
          <ScanForm
            t={{
              procesLabel: t.procesLabel,
              procesPlaceholder: t.procesPlaceholder,
              colThema: t.colThema,
              colBeeld: t.colBeeld,
              colWerk: t.colWerk,
              rows: t.rows,
              fillPlaceholder: t.fillPlaceholder,
              nameLabel: t.nameLabel,
              emailLabel: t.emailLabel,
              consentLabel: t.consentLabel,
              printButton: t.printButton,
              sendButton: t.sendButton,
              sending: t.sending,
              sentOk: t.sentOk,
              errInvalidEmail: t.errInvalidEmail,
              errGeneric: t.errGeneric,
            }}
          />
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
