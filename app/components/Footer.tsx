import styles from './footer.module.css';

interface FooterDict {
  copyright: string;
  linkedinGertjan: string;
  linkedinRene: string;
}

export default function Footer({ dict }: { dict: FooterDict }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.copy}>{dict.copyright}</p>
        <div className={styles.links}>
          <a
            href="https://www.linkedin.com/in/gertjan-antonisse/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            {dict.linkedinGertjan}
          </a>
          <span className={styles.sep}>&middot;</span>
          <a
            href="https://www.linkedin.com/in/reneluijk/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            {dict.linkedinRene}
          </a>
        </div>
      </div>
    </footer>
  );
}
