import PageShell from '@/components/info/PageShell';
import InquiryForm from '@/components/info/InquiryForm';
import { SITE_EMAIL, SITE_LOCATION, SITE_NAME } from '@/lib/site';

const Contact = () => (
  <PageShell
    title={`Contact Modest (${SITE_NAME})`}
    description={`Contact Modest (${SITE_NAME}) at ${SITE_EMAIL} for orders, shipping, returns, press, careers, and wholesale.`}
    path="/contact"
    eyebrow="Get in Touch"
    heading="Contact Us"
  >
    <p className="text-cream/60 leading-relaxed mb-8">
      {SITE_LOCATION}. Write {SITE_EMAIL} or use the form — it opens a message to the same inbox.
    </p>

    <InquiryForm
      subjectPrefix="Contact"
      submitLabel="Send Message"
      successTitle="Message drafted"
      successBody="Your email app should open with the message. Send it and we will follow up."
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        {
          name: 'topic',
          label: 'Topic',
          type: 'select',
          required: true,
          options: [
            { value: 'Order', label: 'Order' },
            { value: 'Shipping', label: 'Shipping' },
            { value: 'Return / Exchange', label: 'Return / Exchange' },
            { value: 'Product Question', label: 'Product Question' },
            { value: 'Careers', label: 'Careers' },
            { value: 'Press', label: 'Press' },
            { value: 'Wholesale / Business', label: 'Wholesale / Business' },
            { value: 'Other', label: 'Other' },
          ],
        },
        {
          name: 'orderNumber',
          label: 'Order number',
          showWhen: { field: 'topic', value: ['Order', 'Shipping', 'Return / Exchange'] },
        },
        { name: 'message', label: 'Message', type: 'textarea', required: true, rows: 6 },
      ]}
    />
  </PageShell>
);

export default Contact;
