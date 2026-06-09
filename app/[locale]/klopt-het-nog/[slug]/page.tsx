import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '../../../../lib/i18n';
import type { Locale } from '../../../../lib/i18n';
import SubscribeForm from '../SubscribeForm';
import ShareButtons from './ShareButtons';
import { notities } from '../notities';
import styles from './notitie.module.css';

const SITE = 'https://synestheticminds.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const n = notities[slug];
  if (!n) return {};
  const title = `Klopt het nog? ${n.title}`;
  return {
    title,
    description: n.ogDescription,
    openGraph: {
      title,
      description: n.ogDescription,
      images: [{ url: n.visualUrl, width: 1920, height: 1080, alt: n.title }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: n.ogDescription,
      images: [n.visualUrl],
    },
  };
}

export default async function NotitiePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const n = notities[slug];
  if (!n) notFound();

  const dict = await getDictionary(locale as Locale);
  const t = dict.kloptHetNog;
  const pageUrl = `${SITE}/${locale}/klopt-het-nog/${slug}`;

  return (
    <>
      {/* ---- Hero ---- */}
      <section className="hero">
        <div className="container">
          <div className="label">Klopt het nog?</div>
          <h1>{n.title}</h1>
          <p className="tagline"><em>{n.intro}</em></p>
        </div>
      </section>

      {/* ---- Notitie ---- */}
      <section className="prose">
        <div className="container">
          <figure className={styles.figure}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={n.visualUrl} alt={n.title} />
          </figure>
          <p className={styles.meta}>{n.date}</p>

          {n.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          <p>
            <strong>Klopt het nog?</strong> {n.closer}
          </p>

          <div className={styles.bronnen}>
            <span className={styles.bronnenLabel}>Bronnen</span>
            <span dangerouslySetInnerHTML={{ __html: n.bronnenHtml }} />
          </div>

          <ShareButtons
            pageUrl={pageUrl}
            title={`Klopt het nog? ${n.title}`}
            teaser={n.ogDescription}
            labels={{
              intro: 'Vond je dit de moeite? Deel of stuur door.',
              linkedin: 'LinkedIn',
              whatsapp: 'WhatsApp',
              email: 'E-mail',
            }}
          />
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
