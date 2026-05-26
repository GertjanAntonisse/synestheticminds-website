'use client';

import { useState } from 'react';
import styles from '../../klopt-het-nog/klopt-het-nog.module.css';
import { subscribe } from './actions';

interface SubscribeFormTexts {
  emailLabel: string;
  emailPlaceholder: string;
  submitButton: string;
  submittingButton: string;
  formNote: string;
  successTitle: string;
  successBody: string;
  errorInvalid: string;
  errorGeneric: string;
  placeholderBanner: string;
  mailtoSubject: string;
}

interface SubscribeFormProps {
  texts: SubscribeFormTexts;
}

type State = 'idle' | 'submitting' | 'success' | 'error' | 'not_configured';

export default function SubscribeForm({ texts }: SubscribeFormProps) {
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('submitting');
    const formData = new FormData(e.currentTarget);
    const result = await subscribe(formData);

    if (result.ok) {
      setState('success');
      return;
    }

    if (result.error === 'not_configured') {
      // Open the mailto fallback so the user has a working path even before Brevo is wired up.
      const email = encodeURIComponent(String(formData.get('email') ?? ''));
      const subject = encodeURIComponent(texts.mailtoSubject);
      window.location.href = `mailto:info@synestheticminds.nl?subject=${subject}&body=${email}`;
      setState('not_configured');
      return;
    }

    setState('error');
    setErrorMsg(result.error === 'invalid_email' ? texts.errorInvalid : texts.errorGeneric);
  }

  if (state === 'success') {
    return (
      <div className={styles.formCard}>
        <h3 className={styles.successTitle}>{texts.successTitle}</h3>
        <p className={styles.successBody}>{texts.successBody}</p>
      </div>
    );
  }

  return (
    <div className={styles.formCard}>
      <form onSubmit={handleSubmit} noValidate>
        <label className={styles.formLabel} htmlFor="email">
          {texts.emailLabel}
        </label>
        <div className={styles.formRow}>
          <input
            id="email"
            type="email"
            name="email"
            required
            placeholder={texts.emailPlaceholder}
            className={styles.emailInput}
            disabled={state === 'submitting'}
          />
          <button type="submit" className={styles.submitButton} disabled={state === 'submitting'}>
            {state === 'submitting' ? texts.submittingButton : texts.submitButton}
          </button>
        </div>
        <p className={styles.formNote}>{texts.formNote}</p>
        {state === 'error' && <div className={styles.errorBanner}>{errorMsg}</div>}
        {state === 'not_configured' && (
          <div className={styles.placeholderBanner}>{texts.placeholderBanner}</div>
        )}
      </form>
    </div>
  );
}
