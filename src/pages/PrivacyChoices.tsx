import { Link } from 'react-router-dom';
import PageShell from '@/components/info/PageShell';
import InquiryForm from '@/components/info/InquiryForm';
import { PRIVACY_CONTACT_EMAIL, TRACKERS } from '@/lib/privacy';
import { SITE_NAME } from '@/lib/site';

const PrivacyChoices = () => (
  <PageShell
    title={`Your Privacy Choices | ${SITE_NAME}`}
    description="Submit access, correction, or deletion requests, manage marketing email, and read how tracking works on Modest (MOD#$T)."
    path="/privacy-choices"
    eyebrow="Privacy"
    heading="Your Privacy Choices"
    wide
  >
    <p className="text-cream/60 leading-relaxed mb-10">
      Use these controls for Modest ({SITE_NAME}). Access, correction, and deletion requests
      email {PRIVACY_CONTACT_EMAIL}. Marketing opt-out runs through Mailchimp on Email Preferences.
      This page is not a cookie-consent banner — the site does not currently ship one.
    </p>

    <section className="space-y-3 mb-8">
      <h2 className="font-display text-2xl text-cream tracking-wider">Access My Information</h2>
      <p className="text-cream/60 text-sm leading-relaxed">Submit a privacy request.</p>
    </section>

    <section className="space-y-3 mb-8">
      <h2 className="font-display text-2xl text-cream tracking-wider">Correct My Information</h2>
      <p className="text-cream/60 text-sm leading-relaxed">Submit corrections.</p>
    </section>

    <section className="space-y-3 mb-10">
      <h2 className="font-display text-2xl text-cream tracking-wider">Delete My Information</h2>
      <p className="text-cream/60 text-sm leading-relaxed mb-6">
        Request deletion where applicable. Depending on where you live and applicable law, we may
        be able to access, correct, or delete personal information we hold. Shopify and Mailchimp
        hold much of the order and list data — we will use your request to work through those
        systems where we can.
      </p>
      <InquiryForm
        subjectPrefix="Privacy request"
        submitLabel="Submit privacy request"
        successTitle="Request drafted"
        successBody="Your email app should open with the request. Send it to complete."
        fields={[
          { name: 'name', label: 'Name', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          {
            name: 'topic',
            label: 'Request type',
            type: 'select',
            required: true,
            options: [
              { value: 'Access my information', label: 'Access my information' },
              { value: 'Correct my information', label: 'Correct my information' },
              { value: 'Delete my information', label: 'Delete my information' },
              { value: 'Advertising / sharing request', label: 'Advertising / sharing request (where applicable law allows)' },
            ],
          },
          { name: 'message', label: 'Details', type: 'textarea', required: true, rows: 5 },
        ]}
      />
    </section>

    <section className="space-y-3 mb-10">
      <h2 className="font-display text-2xl text-cream tracking-wider">Marketing Preferences</h2>
      <p className="text-cream/60 leading-relaxed">
        <Link to="/email-preferences" className="text-gold hover:underline">Email Preferences</Link>
        {' '}— stay on the list or unsubscribe from promotional email. No login required. No reason required.
      </p>
    </section>

    <section className="space-y-3 mb-10">
      <h2 className="font-display text-2xl text-cream tracking-wider">Cookie / Tracking Choices</h2>
      <p className="text-cream/60 leading-relaxed mb-6">
        Modest does not currently ship a consent-management platform. There is no on-site switch to
        disable analytics or advertising categories. Browser settings can block or delete cookies.
        Cart data lives in your browser’s local storage so checkout can work.
      </p>
      <div className="overflow-x-auto border border-border">
        <table className="w-full text-left text-xs text-cream/60">
          <thead className="text-cream tracking-wider uppercase text-[10px]">
            <tr className="border-b border-border">
              <th className="p-3 font-medium">Tracker / service</th>
              <th className="p-3 font-medium">Purpose</th>
              <th className="p-3 font-medium">Data potentially sent</th>
              <th className="p-3 font-medium">Loads before consent?</th>
              <th className="p-3 font-medium">Storage keys</th>
              <th className="p-3 font-medium">Control</th>
            </tr>
          </thead>
          <tbody>
            {TRACKERS.map((row) => (
              <tr key={row.service} className="border-b border-border last:border-0 align-top">
                <td className="p-3 text-cream">{row.service}</td>
                <td className="p-3">{row.purpose}</td>
                <td className="p-3">{row.data}</td>
                <td className="p-3">{row.loadsBeforeConsent ? 'Yes, if the tool is active' : 'Only after you submit'}</td>
                <td className="p-3">{row.storage}</td>
                <td className="p-3">{row.control}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    <section className="space-y-3">
      <h2 className="font-display text-2xl text-cream tracking-wider">Sale / sharing</h2>
      <p className="text-cream/60 leading-relaxed">
        We do not display a “Do Not Sell or Share” toggle that would silently disable pixels,
        because this site has no such wired control and California applicability has not been
        assessed in this project. Displaying that control would imply a legal-right mechanism
        that is not implemented. If a Meta Pixel or Google tag is configured, you can still send
        an advertising/sharing request above, and you can use your browser or industry opt-out tools.
      </p>
    </section>
  </PageShell>
);

export default PrivacyChoices;
