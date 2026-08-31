import { NextRequest, NextResponse } from 'next/server';
import { logEvent, readUtm } from '../../../lib/events';
import { BOEK_LINKS, type BoekSleutel } from '../../../lib/boeken';

// General logged redirect. Put any link, download or save URL through here with
// a UTM and an event name, and it logs the click and forwards the visitor:
//   /api/go?event=download&to=/scan-template.pdf&utm_source=linkedin&utm_content=...
// This is how a download or outbound link carries a code we log, without baking
// a special case into the page.
const ALLOWED_HOST = /(^|\.)synestheticminds\.com$/;

// Outbound links to a shop use a named destination instead of a URL: the page
// passes a key, the URL lives on the server. That keeps the open-redirect guard
// above meaningful, because no visitor-supplied address is ever followed.
function namedDestination(dest: string | null): string | null {
  if (!dest) return null;
  return BOEK_LINKS[dest as BoekSleutel] ?? null;
}

// The campaign codes sit on the page that was clicked from, not on this link.
// A same-origin navigation sends the full referring URL, query string included,
// so they can be read from there. This keeps the book page statically
// rendered: adding searchParams to it would make every request dynamic just to
// carry four values that the browser already sends.
type Utm = ReturnType<typeof readUtm>;
const NO_UTM: Utm = { utm_source: null, utm_medium: null, utm_campaign: null, utm_content: null };

function utmFromReferer(referer: string | null): Utm {
  if (!referer) return NO_UTM;
  try {
    return readUtm(new URL(referer).searchParams);
  } catch {
    return NO_UTM;
  }
}

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
  const referer = request.headers.get('referer');
  const named = namedDestination(sp.get('dest'));

  // Explicit codes on the link win; the referring page fills in what is missing.
  const fromReferer = utmFromReferer(referer);
  const own = readUtm(sp);
  const utm = {
    utm_source: own.utm_source ?? fromReferer.utm_source ?? null,
    utm_medium: own.utm_medium ?? fromReferer.utm_medium ?? null,
    utm_campaign: own.utm_campaign ?? fromReferer.utm_campaign ?? null,
    utm_content: own.utm_content ?? fromReferer.utm_content ?? null,
  };

  const destination = named ?? to;

  await logEvent({
    event: sp.get('event') || 'click',
    path: request.nextUrl.pathname,
    locale: sp.get('locale'),
    ...utm,
    referer,
    userAgent: request.headers.get('user-agent'),
    meta: destination ? { to: destination } : null,
  });

  // A named destination is trusted because it never left the server.
  if (named) return NextResponse.redirect(named);

  return NextResponse.redirect(new URL(safeDestination(to, request.nextUrl.origin), request.nextUrl.origin));
}
