import { Link } from 'react-router-dom';

const NewsletterConsent = () => (
  <p className="text-cream/40 text-xs leading-relaxed mt-4">
    By signing up, you agree to receive marketing emails from Modest. You can unsubscribe at any time.{' '}
    See our{' '}
    <Link to="/privacy" className="text-gold hover:underline">
      Privacy Policy
    </Link>
    .
  </p>
);

export default NewsletterConsent;
