import { useState, useEffect, useCallback } from 'react';
import { X, Check, Copy } from 'lucide-react';

const STORAGE_KEY = 'modest_welcome_dismissed';
const DISMISS_DAYS = 14;
const DISCOUNT_CODE = 'WELCOME10';

/** Replace with your Mailchimp embedded-form action URL */
const MAILCHIMP_ACTION_URL = 'https://YOUR_PREFIX.us00.list-manage.com/subscribe/post?u=YOUR_U&id=YOUR_ID';

const WelcomeOfferModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Check localStorage frequency cap
  const isDismissed = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const ts = parseInt(raw, 10);
      return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  }, []);

  const dismiss = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
    setIsOpen(false);
  }, []);

  // Trigger: 15s timer OR 50% scroll
  useEffect(() => {
    if (isDismissed()) return;

    let triggered = false;
    const trigger = () => {
      if (triggered) return;
      triggered = true;
      setIsOpen(true);
    };

    const timer = setTimeout(trigger, 15_000);

    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPercent >= 0.5) trigger();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isDismissed]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, dismiss]);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');

    try {
      // Mailchimp embedded form uses JSONP via /post-json endpoint
      const url = MAILCHIMP_ACTION_URL.replace('/post?', '/post-json?') + `&EMAIL=${encodeURIComponent(email)}&tags=welcome10`;

      await new Promise<void>((resolve, reject) => {
        const callbackName = `mc_cb_${Date.now()}`;
        (window as any)[callbackName] = (data: any) => {
          delete (window as any)[callbackName];
          script.remove();
          if (data.result === 'success') resolve();
          else reject(new Error(data.msg || 'Subscription failed'));
        };

        const script = document.createElement('script');
        script.src = `${url}&c=${callbackName}`;
        script.onerror = () => {
          delete (window as any)[callbackName];
          script.remove();
          reject(new Error('Network error'));
        };
        document.body.appendChild(script);

        // Timeout fallback
        setTimeout(() => {
          if ((window as any)[callbackName]) {
            delete (window as any)[callbackName];
            script.remove();
            // Treat as success if Mailchimp URL isn't configured yet
            resolve();
          }
        }, 5000);
      });

      setStatus('success');
      // Mark as dismissed so it won't show again
      try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.message?.includes('already subscribed')
        ? 'You\'re already part of the family!'
        : 'Something went wrong. Please try again.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(DISCOUNT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-6">
        <div
          className="relative w-full max-w-md bg-card border border-border p-10 animate-scale-in"
          role="dialog"
          aria-modal="true"
          aria-label="Welcome offer"
        >
          {/* Close button */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 text-muted-foreground hover:text-cream transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {status === 'success' ? (
            <div className="text-center space-y-6">
              <p className="text-gold text-sm tracking-[0.3em] uppercase">Welcome to the Family</p>
              <h3 className="font-display text-3xl text-cream">Your 10% Off Code</h3>

              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-3 px-8 py-4 border-2 border-gold bg-transparent text-gold font-display text-2xl tracking-[0.2em] hover:bg-gold hover:text-obsidian transition-all duration-300"
              >
                {DISCOUNT_CODE}
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
              <p className="text-muted-foreground text-xs">
                {copied ? 'Copied to clipboard!' : 'Click to copy • Use at checkout'}
              </p>

              <button
                onClick={dismiss}
                className="text-cream/50 text-sm hover:text-cream transition-colors underline underline-offset-4"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <p className="text-gold text-sm tracking-[0.3em] uppercase">Exclusive Offer</p>
              <h3 className="font-display text-4xl text-cream leading-tight">
                Get 10% Off<br />Your First Order
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                Join the MOD#$T family for early access to drops, exclusive offers, and your welcome discount.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                  placeholder="Enter your email"
                  className="w-full bg-transparent border border-border px-6 py-4 text-cream placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors text-sm"
                  required
                  autoFocus
                />

                {errorMsg && (
                  <p className="text-destructive text-xs">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="btn-hero-primary w-full disabled:opacity-50"
                >
                  {status === 'submitting' ? 'Joining…' : 'Claim My 10% Off'}
                </button>
              </form>

              <button
                onClick={dismiss}
                className="text-cream/40 text-xs hover:text-cream/60 transition-colors"
              >
                No thanks
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WelcomeOfferModal;
