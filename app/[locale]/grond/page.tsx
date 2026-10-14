import type { Metadata } from 'next';
import Link from 'next/link';
import { getDictionary } from '../../../lib/i18n';
import type { Locale } from '../../../lib/i18n';
import samenvatting from '../../../grond-bronnen/scan-samenvatting.json';
import GrondOverzicht from './GrondOverzicht';
import GrondVraag from './GrondVraag';
import styles from './grond.module.css';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = (await getDictionary(locale as Locale)).grond;
  return { title: t.metaTitle, description: t.metaDesc, openGraph: { title: t.metaTitle, description: t.metaDesc } };
}

export default async function GrondPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = (await getDictionary(locale as Locale)).grond;
  const stappen = [
    { titel: t.step1Title, tekst: t.step1P },
    { titel: t.step2Title, tekst: t.step2P },
    { titel: t.step3Title, tekst: t.step3P },
  ];

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="label">{t.heroLabel}</div>
          <h1>{t.heroTitle}</h1>
          <p className="tagline">{t.heroTagline}</p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="label">{t.stepsLabel}</div>
          <h2>{t.stepsTitle}</h2>
          <ol className={styles.stappen}>
            {stappen.map((stap, i) => (
              <li key={stap.titel} className={styles.stap}>
                <span className={styles.nummer}>{i + 1}</span>
                <h3>{stap.titel}</h3>
                <p>{stap.tekst}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section>
        <div className="container-wide">
          <div className="label">{t.overviewLabel}</div>
          <h2>{t.overviewTitle}</h2>
          <p className={styles.inleiding}>{t.overviewP}</p>
          <GrondOverzicht locale={locale} data={samenvatting} t={t} />
        </div>
      </section>

      <section>
        <div className="container">
          <div className="label">{t.askLabel}</div>
          <h2>{t.askTitle}</h2>
          <p className={styles.inleiding}>{t.askP}</p>
          <GrondVraag
            t={{
              placeholder: t.askPlaceholder,
              button: t.askButton,
              busy: t.askBusy,
              note: t.askNote,
              tooShort: t.askTooShort,
              errConn: t.errConn,
              errGeneric: t.errGeneric,
              examples: t.examples,
              typeLabels: t.typeLabels,
              sourceLine: t.sourceLine,
              answerNote: t.answerNote,
            }}
          />
        </div>
      </section>

      <section className="prose">
        <div className="container">
          <h2>{t.noteTitle}</h2>
          <p>{t.noteP1}</p>
          <p>{t.noteP2}</p>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaP}</p>
          <div className={styles.knoppen}>
            <Link className="cta-button" href={`/${locale}/klopt-het-beeld`}>{t.ctaButton}</Link>
            <Link className="cta-button-outline" href={`/${locale}/contact`}>{t.ctaSecondary}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
