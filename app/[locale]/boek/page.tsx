import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getDictionary } from '../../../lib/i18n';
import type { Locale } from '../../../lib/i18n';
import styles from './boek.module.css';

const BUY_URL = 'https://www.amazon.com/dp/B0G6MDBLH5';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.boek;
  return { title: t.metaTitle, description: t.metaDesc };
}

export default async function BoekPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.boek;

  const arc = [
    { name: t.arc1Name, text: t.arc1Text, status: t.arc1Status, current: true },
    { name: t.arc2Name, text: t.arc2Text, status: t.arc2Status, current: false },
    { name: t.arc3Name, text: t.arc3Text, status: t.arc3Status, current: false },
  ];

  return (
    <>
      {/* ---- Hero met cover ---- */}
      <section className={styles.bookHero}>
        <div className={`container-wide ${styles.bookHeroInner}`}>
          <div className={styles.coverWrap}>
            <Image
              src="/boek/cover.jpg"
              alt={t.coverAlt}
              width={300}
              height={450}
              className={styles.cover}
              priority
            />
          </div>
          <div className={styles.heroText}>
            <div className={styles.seriesMark}>
              <Image
                src="/boek/lvw-logo.png"
                alt=""
                width={34}
                height={34}
                aria-hidden
                className={styles.seriesSpiral}
              />
              <span>{t.seriesName}</span>
            </div>
            <h1>{t.heroTitle}</h1>
            <div className={styles.bookName}>{t.heroSubtitle}</div>
            <p className={styles.heroTagline}>{t.heroTagline}</p>
            <div className={styles.heroActions}>
              <a href={BUY_URL} className="cta-button" target="_blank" rel="noopener noreferrer">
                {t.ctaButton}
              </a>
              <Link href={`/${locale}/klopt-het-nog`} className="cta-button-outline">
                {t.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Wat dit boek is ---- */}
      <section className="prose">
        <div className="container">
          <div className="label">{t.aboutLabel}</div>
          <h2>{t.aboutTitle}</h2>
          <p>{t.aboutP1}</p>
          <p>{t.aboutP2}</p>
          <p>{t.aboutP3}</p>
        </div>
      </section>

      {/* ---- De kernvraag ---- */}
      <section className={styles.questionSection}>
        <div className="container">
          <div className="label">{t.questionLabel}</div>
          <p className={styles.question}>{t.questionText}</p>
          <p className={styles.questionSub}>{t.questionSub}</p>
        </div>
      </section>

      {/* ---- De trilogie-boog ---- */}
      <section>
        <div className="container">
          <div className="label">{t.arcLabel}</div>
          <h2>{t.arcTitle}</h2>
          <div className={styles.series}>
            <Image
              src="/boek/lvw-logo.png"
              alt=""
              width={40}
              height={40}
              aria-hidden
              className={styles.seriesSpiral}
            />
            <span className={styles.seriesName}>{t.seriesName}</span>
          </div>
          <p className={styles.seriesNote}>{t.seriesNote}</p>
          <ol className={styles.arc}>
            {arc.map((b) => (
              <li
                key={b.name}
                className={`${styles.arcItem} ${b.current ? styles.arcItemCurrent : ''}`}
              >
                <div className={styles.arcHead}>
                  <span className={styles.arcName}>{b.name}</span>
                  <span className={styles.arcStatus}>{b.status}</span>
                </div>
                <p className={styles.arcText}>{b.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- Over de auteur ---- */}
      <section>
        <div className="container">
          <div className="label">{t.authorLabel}</div>
          <div className={styles.author}>
            <div className={styles.portraitWrap}>
              <Image
                src="/boek/gertjan.jpg"
                alt={t.authorPortraitAlt}
                fill
                sizes="128px"
                className={styles.portrait}
              />
            </div>
            <div>
              <h3 className={styles.authorName}>{t.authorName}</h3>
              {t.authorBio.map((paragraph, i) => (
                <p key={i} className={styles.authorBio}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="cta-section">
        <div className="container">
          <div className="label">{t.ctaLabel}</div>
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaText}</p>
          <a href={BUY_URL} className="cta-button" target="_blank" rel="noopener noreferrer">
            {t.ctaButton}
          </a>
        </div>
      </section>
    </>
  );
}
