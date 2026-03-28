import styles from './footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.copy}>
          &copy; 2026 Synesthetic Minds &middot; Gertjan Antonisse &middot; René Luijk
        </p>
        <div className={styles.links}>
          <a
            href="https://www.linkedin.com/in/gertjan-antonisse/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            LinkedIn Gertjan
          </a>
          <span className={styles.sep}>&middot;</span>
          <a
            href="https://www.linkedin.com/in/reneluijk/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            LinkedIn René
          </a>
        </div>
      </div>
    </footer>
  );
}
