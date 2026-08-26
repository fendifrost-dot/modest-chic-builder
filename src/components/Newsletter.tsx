import { useState } from 'react';
import { Instagram, Twitter } from 'lucide-react';
import { DISCOUNT_CODE, isValidEmail, subscribeMailchimp } from '@/lib/mailchimp';
import { SOCIAL_URLS } from '@/lib/site';

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
          <p className="text-gold text-sm tracking-[0.3em] uppercase mb-4">
            Join The Family
          </p>
          
          <h2 className="font-display text-4xl md:text-5xl text-cream mb-6">
            Stay Modest
          </h2>
          
          <p className="text-cream/60 mb-8">
            Join for early access to drops, limited editions, and receive
            <span className="text-gold font-medium"> 10% off </span>
            your first order.
          </p>

          {status === 'success' ? (
            <div className="space-y-4">
              <p className="text-gold text-lg">✓ Welcome to the MOD#$T family</p>
              <div className="inline-flex items-center gap-3 px-6 py-3 border border-gold/40 text-gold font-display text-xl tracking-[0.2em]">
                {DISCOUNT_CODE}
              </div>
              <p className="text-cream/40 text-xs">Use this code at checkout for 10% off</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                placeholder="Enter your email"
                className="flex-1 bg-transparent border border-border px-6 py-4 text-cream placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                required
              />
              <button type="submit" disabled={status === 'submitting'} className="btn-hero-primary whitespace-nowrap disabled:opacity-50">
                {status === 'submitting' ? 'Joining…' : 'Subscribe'}
              </button>
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
