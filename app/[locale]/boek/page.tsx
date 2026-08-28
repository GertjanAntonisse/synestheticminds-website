import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getDictionary } from '../../../lib/i18n';
import type { Locale } from '../../../lib/i18n';
import styles from './boek.module.css';

// Amazon.nl is de primaire markt van de reeks; .com stuurde Nederlandse lezers
// naar de Amerikaanse winkel.
const BUY_NL_1 = 'https://www.amazon.nl/dp/B0G6MDBLH5';
const BUY_NL_2 = 'https://www.amazon.nl/dp/B0HGMC6WGN';
// De Engelse editie van deel 1 staat op amazon.com; een zoekopdracht als link
// liet de lezer zelf uitzoeken welk boek bedoeld werd. Deel 2 bestaat nog
// alleen in het Nederlands, dus daar wijst de Engelse pagina naar de
// Nederlandse uitgave.
const BUY_EN_1 = 'https://www.amazon.com/dp/B0HGS8HS4C';

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

  const boeken = [
    { naam: t.book1Name, meta: t.book1Meta, tekst: t.book1Text, cta: t.book1Cta,
      cover: t.cover1, alt: t.coverAlt1, url: locale === 'en' ? BUY_EN_1 : BUY_NL_1 },
    { naam: t.book2Name, meta: t.book2Meta, tekst: t.book2Text, cta: t.book2Cta,
      cover: t.cover2, alt: t.coverAlt2, url: BUY_NL_2 },
  ];

  const arc = [
    // De markering betekent: dit deel is te koop. Zolang er één boek was viel dat
    // samen met "het huidige deel"; met twee verschenen delen niet meer.
    { name: t.arc1Name, text: t.arc1Text, status: t.arc1Status, verschenen: true },
    { name: t.arc2Name, text: t.arc2Text, status: t.arc2Status, verschenen: true },
    { name: t.arc3Name, text: t.arc3Text, status: t.arc3Status, verschenen: false },
  ];

  return (
    <>
      {/* ---- Hero: de reeks ---- */}
      <section className={styles.bookHero}>
        <div className={`container-wide ${styles.bookHeroInner}`}>
          <div className={styles.coverStack}>
            {boeken.map((b) => (
              <Image
                key={b.cover}
                src={b.cover}
                alt={b.alt}
                width={300}
                height={480}
                className={styles.stackCover}
                priority
              />
            ))}
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
              <a href="#boeken" className="cta-button">
                {t.heroCtaBooks}
              </a>
              <Link href={`/${locale}/klopt-het-nog`} className="cta-button-outline">
                {t.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---- De twee delen ---- */}
      <section id="boeken">
        <div className="container">
          <div className="label">{t.booksLabel}</div>
          <h2>{t.booksTitle}</h2>
          <div className={styles.books}>
            {boeken.map((b) => (
              <article key={b.naam} className={styles.book}>
                <Image
                  src={b.cover}
                  alt={b.alt}
                  width={200}
                  height={320}
                  className={styles.bookCover}
                />
                <div className={styles.bookBody}>
                  <div className={styles.bookMeta}>{b.meta}</div>
                  <h3 className={styles.bookTitle}>{b.naam}</h3>
                  <p className={styles.bookText}>{b.tekst}</p>
                  <a
                    href={b.url}
                    className="cta-button-outline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {b.cta}
                  </a>
                </div>
              </article>
            ))}
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
                className={`${styles.arcItem} ${b.verschenen ? styles.arcItemCurrent : ''}`}
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
          <Link href={`/${locale}/klopt-het-beeld`} className="cta-button">
            {t.ctaButton}
          </Link>
        </div>
      </section>
    </>
  );
}
