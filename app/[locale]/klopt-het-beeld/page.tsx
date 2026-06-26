import { getDictionary } from '../../../lib/i18n';
import type { Locale } from '../../../lib/i18n';
import ScanForm from '../../klopt-het-beeld/ScanForm';

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

      <ScanForm
        locale={locale}
        contactHref={`/${locale}/contact`}
        evidentHref={`/${locale}/evident-design`}
        t={{
          introLabel: t.scanLabel,
          introTitle: t.scanTitle,
          introP: t.scanP,
          procesLabel: t.procesLabel,
          procesPlaceholder: t.procesPlaceholder,
          colThema: t.colThema,
          colBeeld: t.colBeeld,
          colWerk: t.colWerk,
          rows: t.rows,
          fillPlaceholder: t.fillPlaceholder,
          exampleNote: t.exampleNote,
          exampleLink: t.exampleLink,
          printButton: t.printButton,
          mirrorLabel: t.mirrorLabel,
          mirrorTitle: t.mirrorTitle,
          mirrorP: t.mirrorP,
          shareLabel: t.shareLabel,
          shareTitle: t.shareTitle,
          shareP: t.shareP,
          nameLabel: t.nameLabel,
          emailLabel: t.emailLabel,
          consentLabel: t.consentLabel,
          shareButton: t.shareButton,
          sending: t.sending,
          sentOk: t.sentOk,
          errInvalidEmail: t.errInvalidEmail,
          errGeneric: t.errGeneric,
          ctaTitle: t.ctaTitle,
          ctaP: t.ctaP,
          ctaButton: t.ctaButton,
          ctaSecondary: t.ctaSecondary,
        }}
      />
    </>
  );
}
