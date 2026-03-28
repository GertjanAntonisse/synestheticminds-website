'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './nav.module.css';

export default function Nav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          Synesthetic Minds
        </Link>
        <ul className={styles.links}>
          <li>
            <Link
              href="/for-companies"
              className={`${styles.link} ${isActive('/for-companies') ? styles.linkActive : ''}`}
            >
              For Companies
            </Link>
          </li>
          <li>
            <Link
              href="/invariant-design"
              className={`${styles.link} ${isActive('/invariant-design') ? styles.linkActive : ''}`}
            >
              Invariant Design
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className={`${styles.link} ${isActive('/contact') ? styles.linkActive : ''}`}
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
