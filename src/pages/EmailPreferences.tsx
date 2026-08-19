import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '@/components/info/PageShell';
import {
  isValidEmail,
  subscribeMailchimp,
  unsubscribeMailchimp,
  MAILCHIMP_UNSUBSCRIBE_PAGE,
} from '@/lib/mailchimp';
import { SITE_NAME } from '@/lib/site';

const EmailPreferences = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'working' | 'kept' | 'unsubscribed' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const requireEmail = () => {
    if (!isValidEmail(email)) {
      setErrorMsg('Enter the email address on the Modest list.');
      setStatus('error');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const keep = async () => {
    if (!requireEmail()) return;
    setStatus('working');
    try {
      await subscribeMailchimp(email);
      setStatus('kept');
    } catch {
      setStatus('error');
      setErrorMsg('Could not update the list. Try again or use the link in a Modest email.');
    }
  };

  const unsubscribe = async () => {
    if (!requireEmail()) return;
    setStatus('working');
    try {
      await unsubscribeMailchimp(email);
      setStatus('unsubscribed');
    } catch {
      setStatus('error');
      setErrorMsg('Could not reach the list. Use the unsubscribe link in a Modest email.');
    }
  };

  return (
    <PageShell
      title={`Email Preferences | ${SITE_NAME}`}
      description="Stay on the Modest list or unsubscribe from promotional email. Transactional order messages may still be sent."
      path="/email-preferences"
      eyebrow="Marketing"
      heading="Email Preferences"
    >
      <p className="text-cream/60 leading-relaxed mb-10">
        Choose how you hear from {SITE_NAME}. You can unsubscribe from promotional email or update your marketing preferences at any time. You do not need an account. You do not need to give a reason.
      </p>

      {status === 'unsubscribed' ? (
        <div className="border border-gold/40 px-6 py-10 text-center space-y-3 mb-10">
          <p className="font-display text-2xl text-cream tracking-wider">You’re unsubscribed.</p>
          <p className="text-cream/70 text-sm leading-relaxed max-w-md mx-auto">
            You will no longer receive promotional email from {SITE_NAME} at this address. You may still receive transactional messages related to orders, accounts, or customer-service requests.
          </p>
        </div>
      ) : status === 'kept' ? (
        <div className="border border-gold/40 px-6 py-10 text-center space-y-3 mb-10">
          <p className="font-display text-2xl text-cream tracking-wider">You’re on the list.</p>
          <p className="text-cream/70 text-sm">New releases, private drops, restocks, and brand updates.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <label className="block">
            <span className="text-cream text-xs tracking-[0.2em] uppercase mb-2 block">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
              className="w-full bg-transparent border border-border px-4 py-3.5 text-cream placeholder:text-muted-foreground focus:outline-none focus:border-gold text-sm min-h-11"
              placeholder="you@email.com"
              autoComplete="email"
            />
          </label>

          {errorMsg && <p className="text-destructive text-xs">{errorMsg}</p>}

          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={keep} disabled={status === 'working'} className="btn-hero-primary disabled:opacity-50">
              Keep Me Updated
            </button>
            <button type="button" onClick={unsubscribe} disabled={status === 'working'} className="btn-hero disabled:opacity-50">
              Unsubscribe From Marketing Emails
            </button>
          </div>
          <p className="text-cream/40 text-xs">
            Frequency options such as “send me less” are not shown because this Mailchimp audience is not configured for that in our codebase.{' '}
            <a href={MAILCHIMP_UNSUBSCRIBE_PAGE} className="text-gold hover:underline" target="_blank" rel="noopener noreferrer">
              Mailchimp unsubscribe page
            </a>
            {' '}is a backup.
          </p>
        </div>
      )}

      <p className="text-cream/50 text-sm mt-10">
        See the{' '}
        <Link to="/privacy" className="text-gold hover:underline">Privacy Policy</Link>
        {' '}for how email is used.
      </p>
    </PageShell>
  );
};

export default EmailPreferences;
