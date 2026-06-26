import { NextRequest, NextResponse } from 'next/server';
import { logEvent } from '../../../lib/events';

// General client beacon for on-page actions that have no URL of their own
// (e.g. 'save' when the visitor prints the scan to PDF). Called via
// navigator.sendBeacon, so it must answer fast and never block the user.
export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    // sendBeacon with a Blob still lands here; an unparseable body is ignored.
  }

  const s = (v: unknown) => (typeof v === 'string' ? v : null);
  await logEvent({
    event: s(body.event) || 'event',
    path: s(body.path),
    locale: s(body.locale),
    utm_source: s(body.utm_source),
    utm_medium: s(body.utm_medium),
    utm_campaign: s(body.utm_campaign),
    utm_content: s(body.utm_content),
    referer: request.headers.get('referer'),
    userAgent: request.headers.get('user-agent'),
    meta: body.meta && typeof body.meta === 'object' ? (body.meta as Record<string, unknown>) : null,
  });

  return NextResponse.json({ ok: true });
}
