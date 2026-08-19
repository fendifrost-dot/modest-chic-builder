import { Link } from 'react-router-dom';
import PageShell from '@/components/info/PageShell';
import { PRIVACY_CONTACT_EMAIL, PRIVACY_EFFECTIVE_DATE } from '@/lib/privacy';
import { ENTITY_NAME, SITE_NAME, SITE_URL } from '@/lib/site';

const Privacy = () => (
  <PageShell
    title={`Privacy Policy | ${SITE_NAME}`}
    description={`How Modest (${SITE_NAME}) collects and uses information on ${SITE_URL.replace('https://', '')} — Shopify checkout, Mailchimp email, and optional analytics.`}
    path="/privacy"
    eyebrow="Legal"
    heading="Privacy Policy"
  >
    <p className="text-cream/50 text-sm mb-10">Effective date: {PRIVACY_EFFECTIVE_DATE}</p>

    <section className="space-y-3 mb-10">
      <h2 className="font-display text-2xl text-cream tracking-wider">1. Who We Are</h2>
      <p className="text-cream/60 leading-relaxed">
        This Privacy Policy applies to {SITE_URL.replace('https://', '')} and the online activities of {ENTITY_NAME} (stylized {SITE_NAME}). The legal business entity name is not published in this website’s configuration. Until that is confirmed, contact {PRIVACY_CONTACT_EMAIL}.
      </p>
    </section>

    <section className="space-y-3 mb-10">
      <h2 className="font-display text-2xl text-cream tracking-wider">2. Information We Collect</h2>
      <p className="text-cream/60 leading-relaxed">
        Depending on how you use the site, we may collect:
      </p>
      <ul className="text-cream/60 text-sm space-y-2">
        <li>• Name, email, phone, and shipping/billing address at Shopify checkout or in messages you send us</li>
        <li>• Order and transaction-related information (processed by Shopify and its payment partners)</li>
        <li>• Shopify customer-account information if you create or use an account on the Shopify store domain</li>
        <li>• Customer-service and careers-application content you type into our forms (those forms open an email to us; this app does not store the submission)</li>
        <li>• Portfolio or resume links you choose to include — we do not host file uploads on this site</li>
        <li>• Device/browser information and IP address as seen by our host, Shopify, Mailchimp, Google Fonts, and any analytics/ad scripts that are configured</li>
        <li>• Website activity such as pages viewed and products opened</li>
        <li>• Marketing email address when you join the list</li>
      </ul>
      <p className="text-cream/60 leading-relaxed">
        Payment-card details are entered on Shopify checkout and handled by Shopify and its payment processors. Card numbers are not collected by the Modest React storefront.
      </p>
    </section>

    <section className="space-y-3 mb-10">
      <h2 className="font-display text-2xl text-cream tracking-wider">3. How Information Is Collected</h2>
      <ul className="text-cream/60 text-sm space-y-2">
        <li>• You provide it (checkout, newsletter, contact form, careers form, Shopify account)</li>
        <li>• Shopify records it when you buy or manage an order</li>
        <li>• Cookies, local storage, and similar technologies on this site and on Shopify’s checkout domain</li>
        <li>• Service providers named in this policy (hosting, email, fonts, optional analytics/ads)</li>
      </ul>
    </section>

    <section className="space-y-3 mb-10">
      <h2 className="font-display text-2xl text-cream tracking-wider">4. Why We Use Information</h2>
      <ul className="text-cream/60 text-sm space-y-2">
        <li>• Process orders, ship products, and provide support</li>
        <li>• Maintain carts and, if you use one, a Shopify customer account</li>
        <li>• Prevent fraud and keep checkout secure (via Shopify)</li>
        <li>• Send marketing email you signed up for</li>
        <li>• Review career applications</li>
        <li>• Understand site usage and improve the storefront when analytics IDs are configured</li>
        <li>• Measure advertising if a Meta Pixel ID is configured</li>
        <li>• Meet legal and accounting obligations attached to orders</li>
      </ul>
    </section>

    <section className="space-y-3 mb-10">
      <h2 className="font-display text-2xl text-cream tracking-wider">5. Cookies & Tracking</h2>
      <p className="text-cream/60 leading-relaxed">
        This site does not currently include a cookie-consent banner or category picker. We therefore do not tell you that you can switch analytics or ads off from a Modest preference center.
      </p>
      <ul className="text-cream/60 text-sm space-y-3 mt-4">
        <li>
          <span className="text-cream">Necessary.</span> Cart state in local storage (`shopify-cart`). Shopify checkout cookies on Shopify’s domain. A timestamp that remembers if you dismissed the welcome offer (`modest_welcome_dismissed`).
        </li>
        <li>
          <span className="text-cream">Analytics.</span> Google Analytics 4 loads only if a measurement ID is set in the site environment. When set, it loads with the page — not after a consent click.
        </li>
        <li>
          <span className="text-cream">Advertising / marketing.</span> Meta Pixel loads only if a pixel ID is set. When set, it loads with the page. Mailchimp receives your email when you submit a signup form. There is no TikTok pixel in this codebase.
        </li>
        <li>
          <span className="text-cream">Preference / functionality.</span> The welcome-offer timestamp above. Fonts are loaded from Google Fonts.
        </li>
      </ul>
      <p className="text-cream/60 leading-relaxed mt-4">
        You can block or delete cookies in your browser. That may break cart or checkout. See{' '}
        <Link to="/privacy-choices" className="text-gold hover:underline">Privacy Choices</Link>.
      </p>
    </section>

    <section className="space-y-3 mb-10">
      <h2 className="font-display text-2xl text-cream tracking-wider">6. Service Providers / Disclosure</h2>
      <p className="text-cream/60 leading-relaxed">
        We share information with service providers who help us operate, only as needed for their role:
      </p>
      <ul className="text-cream/60 text-sm space-y-2">
        <li>• Ecommerce and checkout: Shopify</li>
        <li>• Payment processors connected to Shopify checkout (Shopify Payments and any methods you see at checkout, which may include Affirm or PayPal)</li>
        <li>• Shipping carriers selected at Shopify checkout</li>
        <li>• Email marketing: Mailchimp</li>
        <li>• Hosting: Lovable</li>
        <li>• Fonts: Google Fonts</li>
        <li>• Optional analytics: Google; optional ads measurement: Meta — only if those IDs are configured</li>
      </ul>
      <p className="text-cream/60 leading-relaxed">
        We may also disclose information if required by law or to protect the store, customers, or others.
      </p>
    </section>

    <section className="space-y-3 mb-10">
      <h2 className="font-display text-2xl text-cream tracking-wider">7. Marketing Communications</h2>
      <p className="text-cream/60 leading-relaxed">
        If you join the Modest list, we send marketing email (drops, restocks, brand updates, and occasional offers). Unsubscribe with the link in those emails or on{' '}
        <Link to="/email-preferences" className="text-gold hover:underline">Email Preferences</Link>.
        We still send transactional messages about orders, accounts, or customer-service when needed. This site does not collect SMS consent. Email consent is not SMS consent.
      </p>
    </section>

    <section className="space-y-3 mb-10">
      <h2 className="font-display text-2xl text-cream tracking-wider">8. Privacy Rights</h2>
      <p className="text-cream/60 leading-relaxed">
        Depending on where you live and applicable law, you may have additional rights regarding your personal information — for example to ask for access, correction, deletion, or to opt out of marketing.
      </p>
      <p className="text-cream/60 leading-relaxed">
        Submit a request on{' '}
        <Link to="/privacy-choices" className="text-gold hover:underline">Privacy Choices</Link>
        {' '}or email {PRIVACY_CONTACT_EMAIL}. We may need to verify the request. We do not promise every listed right to every visitor regardless of jurisdiction.
      </p>
    </section>

    <section className="space-y-3 mb-10">
      <h2 className="font-display text-2xl text-cream tracking-wider">9. Sale / Sharing / Targeted Advertising</h2>
      <p className="text-cream/60 leading-relaxed">
        This codebase can load Meta Pixel and Google Analytics when environment IDs are present. Those tools can involve advertising or analytics disclosures under some privacy laws. Modest has not recorded a legal determination in this project of whether it “sells” or “shares” personal information under California law, and this site does not currently honor a cookie-level “Do Not Sell or Share” toggle.
      </p>
      <p className="text-cream/60 leading-relaxed">
        We therefore do not state “we do not sell personal information,” and we do not display a decorative opt-out that would not actually stop a configured pixel. If you want us to treat a request as an advertising/sharing opt-out to the extent applicable law requires, send it through Privacy Choices. You can also use browser controls and industry tools such as the Digital Advertising Alliance.
      </p>
    </section>

    <section className="space-y-3 mb-10">
      <h2 className="font-display text-2xl text-cream tracking-wider">10. Data Retention</h2>
      <p className="text-cream/60 leading-relaxed">
        We retain personal information for as long as reasonably necessary for the purposes described in this policy, including fulfilling orders, maintaining business records, resolving disputes, enforcing agreements, and meeting legal obligations. Shopify and Mailchimp retain data according to their own retention rules and our accounts with them.
      </p>
    </section>

    <section className="space-y-3 mb-10">
      <h2 className="font-display text-2xl text-cream tracking-wider">11. Security</h2>
      <p className="text-cream/60 leading-relaxed">
        We use reasonable administrative and technical safeguards appropriate to a hosted storefront (HTTPS, Shopify-hosted checkout). No website or transmission is completely secure.
      </p>
    </section>

    <section className="space-y-3 mb-10">
      <h2 className="font-display text-2xl text-cream tracking-wider">12. Children’s Privacy</h2>
      <p className="text-cream/60 leading-relaxed">
        This store is not directed at children. We do not knowingly collect personal information from children. There is no age-gate on the site.
      </p>
    </section>

    <section className="space-y-3 mb-10">
      <h2 className="font-display text-2xl text-cream tracking-wider">13. Changes</h2>
      <p className="text-cream/60 leading-relaxed">
        We may update this policy. The effective date at the top will change when we do.
      </p>
    </section>

    <section className="space-y-3">
      <h2 className="font-display text-2xl text-cream tracking-wider">14. Contact</h2>
      <p className="text-cream/60 leading-relaxed">
        Email {PRIVACY_CONTACT_EMAIL}. A business mailing address for legal notices and CAN-SPAM is not published in this repository; it should appear in marketing emails once confirmed by the owner.
      </p>
    </section>
  </PageShell>
);

export default Privacy;
