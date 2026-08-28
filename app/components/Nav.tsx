'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './nav.module.css';
import { LOCALE_COOKIE, type Locale } from '../../lib/i18n';

interface NavDict {
  forCompanies: string;
  evidentDesign: string;
  invariantDesign: string;
  contact: string;
  boek: string;
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

  // Alleen deze klik legt de taalkeuze vast, een jaar lang. Functioneel cookie:
  // het bevat niets dan 'nl' of 'en', gaat naar geen derde partij en wordt
  // alleen gelezen om te bepalen waar iemand zonder taalvoorvoegsel binnenkomt.
  function rememberLocale() {
    const secure = window.location.protocol === 'https:' ? '; secure' : '';
    document.cookie = `${LOCALE_COOKIE}=${otherLocale}; path=/; max-age=31536000; samesite=lax${secure}`;
  }

  // Localized slug for the book page: /nl/boek vs /en/book
  const boekSlug = locale === 'en' ? 'book' : 'boek';

  // Localized slug for the system-understanding page: /nl/systeembegrip vs /en/for-companies
  const forCompaniesSlug = locale === 'nl' ? 'systeembegrip' : 'ground-truth';

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href={`/${locale}`} className={styles.logo} onClick={() => setIsOpen(false)}>
          <Image
            src="/sm-logo.avif"
            alt="Synesthetic Minds"
            width={265}
            height={40}
            className={styles.logoImg}
            priority
          />
        </Link>

        <div className={styles.navRight}>
          {/* Language switcher — always visible */}
          <Link
            href={switchHref}
            className={`${styles.link} ${styles.langSwitch}`}
            onClick={rememberLocale}
          >
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
              href={`/${locale}/${forCompaniesSlug}`}
              className={`${styles.link} ${isActive(`/${forCompaniesSlug}`) ? styles.linkActive : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {dict.forCompanies}
            </Link>
          </li>
          <li>
            <Link
              href={`/${locale}/evident-design`}
              className={`${styles.link} ${isActive('/evident-design') ? styles.linkActive : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {dict.evidentDesign}
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
              href={`/${locale}/${boekSlug}`}
              className={`${styles.link} ${isActive(`/${boekSlug}`) ? styles.linkActive : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {dict.boek}
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
