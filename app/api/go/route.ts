import { NextRequest, NextResponse } from 'next/server';
import { logEvent, readUtm } from '../../../lib/events';

// General logged redirect. Put any link, download or save URL through here with
// a UTM and an event name, and it logs the click and forwards the visitor:
//   /api/go?event=download&to=/scan-template.pdf&utm_source=linkedin&utm_content=...
// This is how a download or outbound link carries a code we log, without baking
// a special case into the page.
const ALLOWED_HOST = /(^|\.)synestheticminds\.com$/;

function safeDestination(to: string | null, origin: string): string {
  if (!to) return '/';
  // Relative path on our own site.
  if (to.startsWith('/') && !to.startsWith('//')) return to;
  // Absolute URL: only allow our own domain, to prevent open redirects.
  try {
    const url = new URL(to, origin);
    if (ALLOWED_HOST.test(url.hostname)) return url.toString();
  } catch {
    // fall through
  }
  return '/';
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const to = sp.get('to');

  await logEvent({
    event: sp.get('event') || 'click',
    path: request.nextUrl.pathname,
    locale: sp.get('locale'),
    ...readUtm(sp),
    referer: request.headers.get('referer'),
    userAgent: request.headers.get('user-agent'),
    meta: to ? { to } : null,
  });

  return NextResponse.redirect(new URL(safeDestination(to, request.nextUrl.origin), request.nextUrl.origin));
}
