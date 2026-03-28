import { NextRequest, NextResponse } from 'next/server';
import { locales, getLocaleFromCountry } from './lib/i18n';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|eot|css|js)).*)',
  ],
};
