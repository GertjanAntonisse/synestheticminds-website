'use server';

import { headers } from 'next/headers';
import { logEvent } from '../../lib/events';

export type ScanResult =
  | { ok: true }
  | { ok: false; error: 'invalid_email' | 'not_configured' | 'brevo_error' | 'unknown' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SM_INBOX = 'info@synestheticminds.nl';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

export async function submitScan(formData: FormData): Promise<ScanResult> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const consent = String(formData.get('consent') ?? '') === 'on';
  const proces = String(formData.get('proces') ?? '').trim();
  const locale = String(formData.get('locale') ?? '').trim();
  const utm_source = String(formData.get('utm_source') ?? '').trim();
  const utm_medium = String(formData.get('utm_medium') ?? '').trim();
  const utm_campaign = String(formData.get('utm_campaign') ?? '').trim();
  const utm_content = String(formData.get('utm_content') ?? '').trim();
  const rowsRaw = String(formData.get('rows') ?? '[]');

  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: 'invalid_email' };
  }

  // Log the submission to the events stream (independent of Brevo, so a valid
  // lead is captured even if email delivery is not configured or fails).
  await logEvent({
    event: 'submit',
    path: locale ? `/${locale}/${locale === 'en' ? 'self-scan' : 'klopt-het-beeld'}` : null,
    locale,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    email,
    consent,
    meta: { proces: proces || null },
    userAgent: (await headers()).get('user-agent'),
  });

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return { ok: false, error: 'not_configured' };
  }

  let rows: Array<{ thema: string; beeld: string; werk: string }> = [];
  try {
    rows = JSON.parse(rowsRaw);
  } catch {
    rows = [];
  }

  const rowsHtml = rows
    .map(
      (r) =>
        `<tr>
          <td style="padding:8px 12px;border:1px solid #ddd5c7;font-weight:600;vertical-align:top">${esc(r.thema || '')}</td>
          <td style="padding:8px 12px;border:1px solid #ddd5c7;vertical-align:top">${esc(r.beeld || '')}</td>
          <td style="padding:8px 12px;border:1px solid #ddd5c7;vertical-align:top">${esc(r.werk || '')}</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;color:#1f2937;line-height:1.6">
      <h2 style="color:#0f766e">Zelf-scan "Klopt het beeld nog?"</h2>
      <p><strong>Van:</strong> ${esc(name) || '(geen naam)'} &lt;${esc(email)}&gt;</p>
      <p><strong>Proces:</strong> ${esc(proces) || '(niet ingevuld)'}</p>
      <p><strong>Toestemming gebruik voor verbetering:</strong> ${consent ? 'Ja' : 'Niet gegeven'}</p>
      <table style="border-collapse:collapse;margin-top:12px;font-size:14px">
        <thead>
          <tr>
            <th style="padding:8px 12px;border:1px solid #ddd5c7;text-align:left;background:#eef2f1">Thema</th>
            <th style="padding:8px 12px;border:1px solid #ddd5c7;text-align:left;background:#eef2f1">Jouw beeld</th>
            <th style="padding:8px 12px;border:1px solid #ddd5c7;text-align:left;background:#eef2f1">Het werk zelf</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'SM zelf-scan', email: SM_INBOX },
        to: [{ email: SM_INBOX, name: 'Synesthetic Minds' }],
        replyTo: { email, name: name || email },
        subject: `Zelf-scan ingevuld${proces ? ` — ${proces}` : ''} (${name || email})`,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      return { ok: false, error: 'brevo_error' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'unknown' };
  }
}
