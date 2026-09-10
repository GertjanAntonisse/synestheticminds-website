import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getDictionary } from '../../../lib/i18n';
import type { Locale } from '../../../lib/i18n';
import styles from './boek.module.css';
import { boekSleutel, BOEK_DOWNLOADS } from '../../../lib/boeken';
import DelenKnoppen from './DelenKnoppen';

// De koopknop wijst naar de eigen gelogde omleiding en niet rechtstreeks naar
// de winkel. Anders houdt de meting op bij deze pagina, terwijl juist de stap
// erna telt. De winkel-URL's staan in lib/boeken.ts; hier gaat alleen een
// sleutel mee, zodat de query nooit een bestemming kan aanwijzen.
const koopLink = (locale: string, deel: 1 | 2) =>
  `/api/go?event=koop&dest=${boekSleutel(locale, deel)}&locale=${locale}`;

// Downloads lopen langs dezelfde omleiding als de koopknop deed, zodat het
// weggeven even hard te meten is als het verkopen was. Zonder dat zou de
// overstap naar gratis de trechter onzichtbaar maken op precies de plek waar
// hij vroeger zichtbaar was.
const downloadLink = (locale: string, deel: 1 | 2, vorm: 'epub' | 'pdf') =>
  `/api/go?event=download&to=${encodeURIComponent(BOEK_DOWNLOADS[deel][vorm])}` +
  `&locale=${locale}&utm_content=boek${deel}-${vorm}`;

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

  // Localized slug for the self-scan: /nl/klopt-het-beeld vs /en/self-scan
  const scanSlug = locale === 'en' ? 'self-scan' : 'klopt-het-beeld';

  // De Nederlandse delen staan buiten KDP Select en mogen dus weggegeven
  // worden. De Engelse zitten er tot eind november 2026 in, en die
  // exclusiviteit verbiedt dezelfde tekst elders, ook gratis. Loopt de
  // inschrijving af, dan kan deze regel weg: de teksten staan er al.
  const gratis = locale !== 'en';

  const boeken = [
    { deel: 1 as const, naam: t.book1Name, meta: t.book1Meta, tekst: t.book1Text,
      cta: t.book1Cta, cover: t.cover1, alt: t.coverAlt1, url: koopLink(locale, 1) },
    { deel: 2 as const, naam: t.book2Name, meta: t.book2Meta, tekst: t.book2Text,
      cta: t.book2Cta, cover: t.cover2, alt: t.coverAlt2, url: koopLink(locale, 2) },
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
                {gratis ? t.heroCtaDownload : t.heroCtaBooks}
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
          <div className="label">{gratis ? t.downloadLabel : t.booksLabel}</div>
          <h2>{gratis ? t.downloadTitle : t.booksTitle}</h2>
          {gratis && <p className={styles.downloadIntro}>{t.downloadIntro}</p>}
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
                  {/* Bewust zonder noreferrer: de eerste stap is de eigen
                      omleiding, die de campagnecodes uit de verwijzende URL
                      leest. Met noreferrer komt die informatie niet mee. */}
                  {gratis ? (
                    <div className={styles.downloads}>
                      <a
                        href={downloadLink(locale, b.deel, 'epub')}
                        className="cta-button"
                        aria-label={t.downloadEpubAria.replace('{boek}', b.naam)}
                      >
                        {t.downloadEpub}
                      </a>
                      {/* De PDF opent de browser zelf, en zonder eigen tabblad
                          verdwijnt deze pagina daarachter. De EPUB komt binnen
                          als bestand, dus daar blijft de pagina vanzelf staan
                          en zou een leeg tabblad achterblijven. */}
                      <a
                        href={downloadLink(locale, b.deel, 'pdf')}
                        className="cta-button-outline"
                        aria-label={t.downloadPdfAria.replace('{boek}', b.naam)}
                        target="_blank"
                        rel="noopener"
                      >
                        {t.downloadPdf}
                      </a>
                    </div>
                  ) : (
                    <a
                      href={b.url}
                      className="cta-button-outline"
                      target="_blank"
                      rel="noopener"
                    >
                      {b.cta}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
          {gratis && (
            <>
              <div className={styles.downloadNote}>
                <p>{t.downloadReaders}</p>
              </div>
              {/* Doorgeven is de hele bedoeling van het weggeven, dus staat het
                  hier als handeling en niet als zin. Instagram ontbreekt met
                  opzet: dat kent geen deel-adres op het web, en op een telefoon
                  zit het in het deelvenster achter de knop hierboven. */}
              <div className={styles.deelBlok} id="doorgeven">
                <h3 className={styles.deelTitel}>{t.delenTitle}</h3>
                <p className={styles.deelIntro}>{t.delenIntro}</p>
                <DelenKnoppen
                  locale={locale}
                  teksten={{
                    whatsapp: t.delenWhatsapp,
                    linkedin: t.delenLinkedin,
                    facebook: t.delenFacebook,
                    email: t.delenEmail,
                    kopieer: t.delenKopieer,
                    gekopieerd: t.delenGekopieerd,
                    natief: t.delenNatief,
                    bericht: t.delenBericht,
                    mailOnderwerp: t.delenMailOnderwerp,
                  }}
                />
              </div>
            </>
          )}
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
          <p>{t.aboutP4}</p>
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
          <Link href={`/${locale}/${scanSlug}`} className="cta-button">
            {t.ctaButton}
          </Link>
        </div>
      </section>
    </>
  );
}
