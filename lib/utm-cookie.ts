// A visitor who lands via a tagged LinkedIn link often downloads later, or in a
// new tab, so the click never carries the campaign codes and no referer survives
// either. This cookie remembers the most recent tagged visit for a short while,
// so a later download can still be attributed to the post that brought them in.
export const UTM_COOKIE = 'sm_utm';
export const UTM_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 dagen

export interface UtmValues {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
}

export function utmCookieValue(utm: UtmValues): string {
  return encodeURIComponent(JSON.stringify(utm));
}

export function parseUtmCookie(raw: string | undefined | null): UtmValues | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return {
      utm_source: typeof parsed.utm_source === 'string' ? parsed.utm_source : null,
      utm_medium: typeof parsed.utm_medium === 'string' ? parsed.utm_medium : null,
      utm_campaign: typeof parsed.utm_campaign === 'string' ? parsed.utm_campaign : null,
      utm_content: typeof parsed.utm_content === 'string' ? parsed.utm_content : null,
    };
  } catch {
    return null;
  }
}
