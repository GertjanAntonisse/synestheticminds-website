import { NextRequest, NextResponse } from 'next/server';
import type { NextFetchEvent } from 'next/server';
import { locales, getLocaleFromCountry } from './lib/i18n';
import { logEvent, readUtm } from './lib/events';

// Pages whose visits we log when they carry UTM. Keyed by path so adding a new
// tracked page is a one-line change, not a new code path.
const TRACKED_PATH_RE = /^\/(nl|en)\/(klopt-het-beeld)\/?$/;

// Logs a page visit when it carries UTM parameters. Only genuine navigations:
// after the page loads it fires several RSC/prefetch requests at its own URL
// (same UTM), which would otherwise each log and inflate the count. Real
// navigations send `Sec-Fetch-Dest: document`; RSC/prefetch send `empty`.
async function logVisit(request: NextRequest): Promise<void> {
  const match = request.nextUrl.pathname.match(TRACKED_PATH_RE);
  if (!match) return;
  if (request.headers.get('sec-fetch-dest') !== 'document') return;

  const utm = readUtm(request.nextUrl.searchParams);
  if (!utm.utm_source && !utm.utm_medium && !utm.utm_campaign && !utm.utm_content) return;

  await logEvent({
    event: 'visit',
    path: request.nextUrl.pathname,
    locale: match[1],
    ...utm,
    referer: request.headers.get('referer'),
    userAgent: request.headers.get('user-agent'),
  });
}

export function middleware(request: NextRequest, event: NextFetchEvent) {
  event.waitUntil(logVisit(request));

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

  // System-understanding page: /nl/systeembegrip (NL) and /en/ground-truth (EN)
  // are the canonical URLs. The page physically lives at /[locale]/for-companies,
  // so both canonicals are rewritten internally, and the bare /for-companies paths redirect.
  if (pathname === '/nl/for-companies') {
    const url = request.nextUrl.clone();
    url.pathname = '/nl/systeembegrip';
    return NextResponse.redirect(url);
  }
  if (pathname === '/en/for-companies') {
    const url = request.nextUrl.clone();
    url.pathname = '/en/ground-truth';
    return NextResponse.redirect(url);
  }
  if (pathname === '/nl/systeembegrip') {
    const url = request.nextUrl.clone();
    url.pathname = '/nl/for-companies';
    return NextResponse.rewrite(url);
  }
  if (pathname === '/en/ground-truth') {
    const url = request.nextUrl.clone();
    url.pathname = '/en/for-companies';
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
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?|ttf|otf|eot|css|js)).*)',
  ],
};
