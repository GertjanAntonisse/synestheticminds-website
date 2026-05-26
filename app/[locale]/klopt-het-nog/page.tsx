import { getDictionary } from '../../../lib/i18n';
import type { Locale } from '../../../lib/i18n';
import SubscribeForm from './SubscribeForm';

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
          <SubscribeForm
            texts={{
              emailLabel: t.emailLabel,
              emailPlaceholder: t.emailPlaceholder,
              submitButton: t.submitButton,
              submittingButton: t.submittingButton,
              formNote: t.formNote,
              successTitle: t.successTitle,
              successBody: t.successBody,
              errorInvalid: t.errorInvalid,
              errorGeneric: t.errorGeneric,
              placeholderBanner: t.placeholderBanner,
              mailtoSubject: t.mailtoSubject,
            }}
          />
        </div>
      </section>
    </>
  );
}
