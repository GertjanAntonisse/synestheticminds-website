import { NextRequest, NextResponse } from 'next/server';
import type { NextFetchEvent } from 'next/server';
import { locales, getLocaleFromCountry, isLocale, LOCALE_COOKIE } from './lib/i18n';
import { logEvent, readUtm, BOT_UA_RE } from './lib/events';
import { UTM_COOKIE, UTM_COOKIE_MAX_AGE, utmCookieValue } from './lib/utm-cookie';

// Every locale-prefixed page counts. A visit without UTM is still a visit, and
// only logging tagged traffic meant the log could only ever confirm campaigns
// we already knew about.
const LOCALE_PATH_RE = /^\/(nl|en)(\/|$)/;

// Paths that exist only to redirect elsewhere. The destination logs the visit,
// so logging here would count one navigation twice.
const REDIRECT_ONLY = new Set(['/nl/for-companies', '/en/for-companies', '/en/boek',
  '/nl/book', '/en/klopt-het-beeld', '/nl/self-scan', '/nl/ground-truth',
  '/en/systeembegrip']);

// Logs a page visit. Only genuine navigations: after the page loads it fires
// several RSC/prefetch requests at its own URL, which would otherwise each log
// and inflate the count. Real navigations send `Sec-Fetch-Dest: document`;
// RSC/prefetch send `empty`.
async function logVisit(request: NextRequest): Promise<void> {
  const { pathname } = request.nextUrl;
  const match = pathname.match(LOCALE_PATH_RE);
  if (!match) return; // bare paths redirect to a locale first; that one logs
  if (REDIRECT_ONLY.has(pathname)) return;
  if (request.headers.get('sec-fetch-dest') !== 'document') return;

  const userAgent = request.headers.get('user-agent');
  if (userAgent && BOT_UA_RE.test(userAgent)) return;

  await logEvent({
    event: 'visit',
    path: pathname,
    locale: match[1],
    ...readUtm(request.nextUrl.searchParams),
    referer: request.headers.get('referer'),
    userAgent,
  });
}

// Remembers the most recent tagged visit for 30 days, so a download or buy click
// that happens later, or without a referer, can still be traced to the post that
// brought the visitor in. Only overwrites the cookie when the visit itself carries
// a campaign code, so an untagged later visit never erases the earlier attribution.
function withUtmCookie(response: NextResponse, request: NextRequest, pathname: string): NextResponse {
  const utm = readUtm(request.nextUrl.searchParams);
  if (utm.utm_source && LOCALE_PATH_RE.test(pathname)) {
    response.cookies.set(UTM_COOKIE, utmCookieValue(utm), {
      maxAge: UTM_COOKIE_MAX_AGE,
      sameSite: 'lax',
      path: '/',
    });
  }
  return response;
}

export function middleware(request: NextRequest, event: NextFetchEvent) {
  event.waitUntil(logVisit(request));

  const { pathname } = request.nextUrl;
  const withCookie = (response: NextResponse) => withUtmCookie(response, request, pathname);

  // Localized slug for the book page: /nl/boek (NL) and /en/book (EN) are the
  // canonical URLs. The page physically lives at /[locale]/boek, so the EN
  // path is rewritten internally, and the off-language variants redirect.
  if (pathname === '/en/boek' || pathname === '/nl/book') {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/en/boek' ? '/en/book' : '/nl/boek';
    return withCookie(NextResponse.redirect(url));
  }
  if (pathname === '/en/book') {
    const url = request.nextUrl.clone();
    url.pathname = '/en/boek';
    return withCookie(NextResponse.rewrite(url));
  }

  // System-understanding page: /nl/systeembegrip (NL) and /en/ground-truth (EN)
  // are the canonical URLs. The page physically lives at /[locale]/for-companies,
  // so both canonicals are rewritten internally, and the bare /for-companies paths redirect.
  if (pathname === '/nl/for-companies') {
    const url = request.nextUrl.clone();
    url.pathname = '/nl/systeembegrip';
    return withCookie(NextResponse.redirect(url));
  }
  if (pathname === '/en/for-companies') {
    const url = request.nextUrl.clone();
    url.pathname = '/en/ground-truth';
    return withCookie(NextResponse.redirect(url));
  }
  if (pathname === '/nl/systeembegrip') {
    const url = request.nextUrl.clone();
    url.pathname = '/nl/for-companies';
    return withCookie(NextResponse.rewrite(url));
  }
  if (pathname === '/en/ground-truth') {
    const url = request.nextUrl.clone();
    url.pathname = '/en/for-companies';
    return withCookie(NextResponse.rewrite(url));
  }

  // The language switch in the nav swaps only the locale prefix, so from
  // /en/ground-truth it lands on /nl/ground-truth. For boek/book and
  // klopt-het-beeld/self-scan the other-language slug already redirects, but
  // systeembegrip and ground-truth share no word, so the switch dead-ended in a
  // 404 on exactly that page.
  if (pathname === '/nl/ground-truth') {
    const url = request.nextUrl.clone();
    url.pathname = '/nl/systeembegrip';
    return withCookie(NextResponse.redirect(url));
  }
  if (pathname === '/en/systeembegrip') {
    const url = request.nextUrl.clone();
    url.pathname = '/en/ground-truth';
    return withCookie(NextResponse.redirect(url));
  }

  // Localized slug for the self-scan: /nl/klopt-het-beeld (NL) and /en/self-scan
  // (EN) are the canonical URLs. The page lives at /[locale]/klopt-het-beeld,
  // so the EN path is rewritten internally and the off-language variants
  // redirect. The page calls itself Self-scan in its own English copy, which is
  // where the slug comes from.
  if (pathname === '/en/klopt-het-beeld' || pathname === '/nl/self-scan') {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/en/klopt-het-beeld' ? '/en/self-scan' : '/nl/klopt-het-beeld';
    return withCookie(NextResponse.redirect(url));
  }
  if (pathname === '/en/self-scan') {
    const url = request.nextUrl.clone();
    url.pathname = '/en/klopt-het-beeld';
    return withCookie(NextResponse.rewrite(url));
  }

  // Already locale-prefixed — let through
  if (locales.some((loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`))) {
    return withCookie(NextResponse.next());
  }

  // Een taal die de bezoeker zelf koos gaat voor het land van zijn IP-adres.
  // Dit geldt alleen hier, op paden zonder taalvoorvoegsel: wie een link met
  // /nl of /en opent krijgt die taal, ook als het cookie iets anders zegt. Een
  // gedeelde link hoort te tonen wat de afzender bedoelde.
  const chosen = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(chosen)
    ? chosen
    : getLocaleFromCountry(request.headers.get('x-vercel-ip-country'));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return withCookie(NextResponse.redirect(url));
}

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and API routes. epub en pdf horen
    // in die lijst omdat de boeken uit public/ komen: zonder uitzondering
    // stuurt de taalomleiding hieronder ze naar /nl/... en loopt de download
    // dood op een 404.
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?|ttf|otf|eot|css|js|epub|pdf)).*)',
  ],
};
