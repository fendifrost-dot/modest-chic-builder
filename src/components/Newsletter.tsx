import { useState } from 'react';
import { Instagram, Twitter } from 'lucide-react';
import { DISCOUNT_CODE, isValidEmail, subscribeMailchimp } from '@/lib/mailchimp';
import { SOCIAL_URLS } from '@/lib/site';
import NewsletterConsent from '@/components/info/NewsletterConsent';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!isValidEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      setStatus('error');
      return;
    }
    setStatus('submitting');
    try {
      await subscribeMailchimp(email);
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  };

  return (
    <section className="py-24 bg-charcoal">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl text-cream mb-6">
            Join the MOD#$T list
          </h2>

          <p className="text-cream/60 mb-8">
            New releases, private drops, restocks and brand updates.
          </p>

          {status === 'success' ? (
            <div className="space-y-4">
              <p className="text-gold text-lg">You’re on the list.</p>
              <div className="inline-flex items-center gap-3 px-6 py-3 border border-gold/40 text-gold font-display text-xl tracking-[0.2em]">
                {DISCOUNT_CODE}
              </div>
              <p className="text-cream/40 text-xs">Use this code at checkout for 10% off your first order</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                  placeholder="Enter your email"
                  className="flex-1 bg-transparent border border-border px-6 py-4 text-cream placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                  required
                />
                <button type="submit" disabled={status === 'submitting'} className="btn-hero-primary whitespace-nowrap disabled:opacity-50">
                  {status === 'submitting' ? 'Signing up…' : 'Sign Up'}
                </button>
              </div>
              <NewsletterConsent />
            </form>
          )}

          {errorMsg && (
            <p className="text-destructive text-xs mt-3">{errorMsg}</p>
          )}

          <div className="flex items-center justify-center gap-6 mt-12">
            <a
              href={SOCIAL_URLS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/50 hover:text-gold transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={24} />
            </a>
            <a
              href={SOCIAL_URLS.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/50 hover:text-gold transition-colors"
              aria-label="X (Twitter)"
            >
              <Twitter size={24} />
            </a>
            <a
              href={SOCIAL_URLS.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream/50 hover:text-gold transition-colors"
              aria-label="TikTok"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
