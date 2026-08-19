const MAILCHIMP_ACTION_URL =
  'https://bemoremodest.us2.list-manage.com/subscribe/post?u=c231f42ccbe4f144fc8853755&id=1adec29a96&f_id=00c392e0f0';
const HONEYPOT_NAME = 'b_c231f42ccbe4f144fc8853755_1adec29a96';
const TAG_VALUE = '1544412';

export const DISCOUNT_CODE = 'WELCOME10';

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Posts to Mailchimp via a hidden iframe so the shopper never leaves the site. */
export function subscribeMailchimp(email: string): Promise<void> {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.name = 'mc_hidden_frame';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const form = document.createElement('form');
    form.action = MAILCHIMP_ACTION_URL;
    form.method = 'POST';
    form.target = 'mc_hidden_frame';
    form.style.display = 'none';

    const emailInput = document.createElement('input');
    emailInput.name = 'EMAIL';
    emailInput.value = email.trim();
    form.appendChild(emailInput);

    const tagsInput = document.createElement('input');
    tagsInput.name = 'tags';
    tagsInput.value = TAG_VALUE;
    form.appendChild(tagsInput);

    const honeypot = document.createElement('input');
    honeypot.name = HONEYPOT_NAME;
    honeypot.value = '';
    form.appendChild(honeypot);

    document.body.appendChild(form);
    form.submit();

    window.setTimeout(() => {
      form.remove();
      iframe.remove();
      resolve();
    }, 1500);
  });
}
