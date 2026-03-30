'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  const [isOpen, setIsOpen] = useState(false);

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
        <Link href={`/${locale}`} className={styles.logo} onClick={() => setIsOpen(false)}>
          <Image
            src="/logo.jpg"
            alt="Synesthetic Minds"
            width={40}
            height={40}
            className={styles.logoImg}
            priority
          />
        </Link>

        <div className={styles.navRight}>
          {/* Language switcher — always visible */}
          <Link href={switchHref} className={`${styles.link} ${styles.langSwitch}`}>
            {dict.switchTo}
          </Link>

          {/* Hamburger button — mobile only */}
          <button
            className={`${styles.hamburger} ${isOpen ? styles.hamburgerOpen : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
            aria-expanded={isOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Nav links — desktop: horizontal, mobile: dropdown */}
        <ul className={`${styles.links} ${isOpen ? styles.linksOpen : ''}`}>
          <li>
            <Link
              href={`/${locale}/for-companies`}
              className={`${styles.link} ${isActive('/for-companies') ? styles.linkActive : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {dict.forCompanies}
            </Link>
          </li>
          <li>
            <Link
              href={`/${locale}/invariant-design`}
              className={`${styles.link} ${isActive('/invariant-design') ? styles.linkActive : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {dict.invariantDesign}
            </Link>
          </li>
          <li>
            <Link
              href={`/${locale}/contact`}
              className={`${styles.link} ${isActive('/contact') ? styles.linkActive : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {dict.contact}
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
