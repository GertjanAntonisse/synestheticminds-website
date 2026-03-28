import { notFound } from 'next/navigation';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { HtmlLang } from './HtmlLang';
import { locales, getDictionary } from '../../lib/i18n';
import type { Locale } from '../../lib/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);

  return (
    <>
      <HtmlLang lang={locale} />
      <Nav locale={locale as Locale} dict={dict.nav} />
      {children}
      <Footer dict={dict.footer} />
    </>
  );
}
