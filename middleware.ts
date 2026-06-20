import { NextRequest, NextResponse } from 'next/server';
import { locales, getLocaleFromCountry } from './lib/i18n';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Localized slug for the book page: /nl/boek (NL) and /en/book (EN) are the
  // canonical URLs. The page physically lives at /[locale]/boek, so the EN
  // path is rewritten internally, and the off-language variants redirect.
  if (pathname === '/en/boek' || pathname === '/nl/book') {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/en/boek' ? '/en/book' : '/nl/boek';
    return NextResponse.redirect(url);
  }
  if (pathname === '/en/book') {
    const url = request.nextUrl.clone();
    url.pathname = '/en/boek';
    return NextResponse.rewrite(url);
  }

  // System-understanding page: /nl/systeembegrip (NL) and /en/for-companies (EN)
  // are the canonical URLs. The page physically lives at /[locale]/for-companies,
  // so the NL canonical is rewritten internally, and the off-language variants redirect.
  if (pathname === '/nl/for-companies') {
    const url = request.nextUrl.clone();
    url.pathname = '/nl/systeembegrip';
    return NextResponse.redirect(url);
  }
  if (pathname === '/en/systeembegrip') {
    const url = request.nextUrl.clone();
    url.pathname = '/en/for-companies';
    return NextResponse.redirect(url);
  }
  if (pathname === '/nl/systeembegrip') {
    const url = request.nextUrl.clone();
    url.pathname = '/nl/for-companies';
    return NextResponse.rewrite(url);
  }

  // Already locale-prefixed — let through
  if (locales.some((loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`))) {
    return NextResponse.next();
  }

  // Detect locale from Vercel's country header (set automatically on Vercel Edge)
  const country = request.headers.get('x-vercel-ip-country');
  const locale = getLocaleFromCountry(country);

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and API routes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?|ttf|otf|eot|css|js)).*)',
  ],
};
