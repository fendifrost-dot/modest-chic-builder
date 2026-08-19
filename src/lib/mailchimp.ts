const MAILCHIMP_ACTION_URL =
  'https://bemoremodest.us2.list-manage.com/subscribe/post?u=c231f42ccbe4f144fc8853755&id=1adec29a96&f_id=00c392e0f0';
const HONEYPOT_NAME = 'b_c231f42ccbe4f144fc8853755_1adec29a96';
const TAG_VALUE = '1544412';

export const DISCOUNT_CODE = 'WELCOME10';

export const MAILCHIMP_UNSUBSCRIBE_URL =
  'https://bemoremodest.us2.list-manage.com/unsubscribe/post?u=c231f42ccbe4f144fc8853755&id=1adec29a96';

export const MAILCHIMP_UNSUBSCRIBE_PAGE =
  'https://bemoremodest.us2.list-manage.com/unsubscribe?u=c231f42ccbe4f144fc8853755&id=1adec29a96';

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Posts to Mailchimp via a hidden iframe so the shopper never leaves the site. */
export function subscribeMailchimp(email: string): Promise<void> {
  return postMailchimpForm(MAILCHIMP_ACTION_URL, email, [
    { name: 'tags', value: TAG_VALUE },
    { name: HONEYPOT_NAME, value: '' },
  ]);
}

function postMailchimpForm(action: string, email: string, extra: Array<{ name: string; value: string }> = []): Promise<void> {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.name = 'mc_hidden_frame';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const form = document.createElement('form');
    form.action = action;
    form.method = 'POST';
    form.target = 'mc_hidden_frame';
    form.style.display = 'none';

    const emailInput = document.createElement('input');
    emailInput.name = 'EMAIL';
    emailInput.value = email.trim();
    form.appendChild(emailInput);

    extra.forEach((field) => {
      const input = document.createElement('input');
      input.name = field.name;
      input.value = field.value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();

    window.setTimeout(() => {
      form.remove();
      iframe.remove();
      resolve();
    }, 1500);
  });
}

/** Asks Mailchimp to suppress the address for this audience. */
export function unsubscribeMailchimp(email: string): Promise<void> {
  return postMailchimpForm(MAILCHIMP_UNSUBSCRIBE_URL, email);
}
