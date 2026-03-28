'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './nav.module.css';
import type { Locale } from '../../lib/i18n';

interface NavDict {
  forCompanies: string;
  invariantDesign: string;
  contact: string;
  switchTo: string;
}

interface NavProps {
  locale: Locale;
  dict: NavDict;
}

export default function Nav({ locale, dict }: NavProps) {
  const pathname = usePathname();

  // pathname is e.g. /nl/for-companies — strip the locale prefix for active matching
  const pathWithoutLocale = pathname.replace(/^\/(nl|en)/, '') || '/';

  function isActive(href: string) {
    if (href === '/') return pathWithoutLocale === '/';
    return pathWithoutLocale.startsWith(href);
  }

  // Build the switch-locale href: swap /nl → /en or vice versa
  const otherLocale: Locale = locale === 'nl' ? 'en' : 'nl';
  const switchHref = pathname.replace(`/${locale}`, `/${otherLocale}`);

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href={`/${locale}`} className={styles.logo}>
          Synesthetic Minds
        </Link>
        <ul className={styles.links}>
          <li>
            <Link
              href={`/${locale}/for-companies`}
              className={`${styles.link} ${isActive('/for-companies') ? styles.linkActive : ''}`}
            >
              {dict.forCompanies}
            </Link>
          </li>
          <li>
            <Link
              href={`/${locale}/invariant-design`}
              className={`${styles.link} ${isActive('/invariant-design') ? styles.linkActive : ''}`}
            >
              {dict.invariantDesign}
            </Link>
          </li>
          <li>
            <Link
              href={`/${locale}/contact`}
              className={`${styles.link} ${isActive('/contact') ? styles.linkActive : ''}`}
            >
              {dict.contact}
            </Link>
          </li>
          <li>
            <Link href={switchHref} className={`${styles.link} ${styles.langSwitch}`}>
              {dict.switchTo}
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
