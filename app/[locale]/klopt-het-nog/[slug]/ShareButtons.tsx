import styles from './notitie.module.css';

interface ShareButtonsProps {
  pageUrl: string;
  title: string;
  teaser: string;
  labels: { intro: string; linkedin: string; whatsapp: string; email: string };
}

// Deelknoppen die naar de publieke pagina wijzen. Eenvoudige deel-URL's, geen
// externe scripts: zo blijft de pagina licht en is er niets te onderhouden.
export default function ShareButtons({ pageUrl, title, teaser, labels }: ShareButtonsProps) {
  const u = encodeURIComponent(pageUrl);
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${teaser} ${pageUrl}`)}`;
  const email = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${teaser}\n\n${pageUrl}`)}`;

  return (
    <div className={styles.share}>
      <span className={styles.shareIntro}>{labels.intro}</span>
      <div className={styles.shareLinks}>
        <a href={linkedin} target="_blank" rel="noopener noreferrer">{labels.linkedin}</a>
        <a href={whatsapp} target="_blank" rel="noopener noreferrer">{labels.whatsapp}</a>
        <a href={email}>{labels.email}</a>
      </div>
    </div>
  );
}
