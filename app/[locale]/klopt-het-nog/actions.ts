'use server';

export type SubscribeResult =
  | { ok: true }
  | { ok: false; error: 'invalid_email' | 'not_configured' | 'brevo_error' | 'unknown' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribe(formData: FormData): Promise<SubscribeResult> {
  const email = String(formData.get('email') ?? '').trim();
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: 'invalid_email' };
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;

  if (!apiKey || !listId) {
    return { ok: false, error: 'not_configured' };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        listIds: [Number(listId)],
        updateEnabled: true,
      }),
    });

    if (!response.ok && response.status !== 204) {
      return { ok: false, error: 'brevo_error' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'unknown' };
  }
}
