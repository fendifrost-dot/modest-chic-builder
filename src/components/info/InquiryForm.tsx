import { useState } from 'react';
import { submitSiteForm } from '@/lib/forms';
import { SITE_EMAIL } from '@/lib/site';
import { isValidEmail } from '@/lib/mailchimp';

export interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'select';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  showWhen?: { field: string; value: string | string[] };
}

interface InquiryFormProps {
  fields: FormField[];
  subjectPrefix: string;
  submitLabel: string;
  successTitle: string;
  successBody: string;
}

const inputClass =
  'w-full bg-transparent border border-border px-4 py-3.5 text-cream placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors text-sm min-h-11';

const InquiryForm = ({
  fields,
  subjectPrefix,
  submitLabel,
  successTitle,
  successBody,
}: InquiryFormProps) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const visibleFields = fields.filter((field) => {
    if (!field.showWhen) return true;
    const current = values[field.showWhen.field];
    const expected = field.showWhen.value;
    return Array.isArray(expected) ? expected.includes(current) : current === expected;
  });

  const handleChange = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    for (const field of visibleFields) {
      const value = (values[field.name] || '').trim();
      if (field.required && !value) {
        setErrorMsg(`Please fill in ${field.label}.`);
        setStatus('error');
        return;
      }
      if (field.type === 'email' && value && !isValidEmail(value)) {
        setErrorMsg('Please enter a valid email address.');
        setStatus('error');
        return;
      }
    }

    const name = (values.fullName || values.name || 'Inquiry').trim();
    const topic = (values.position || values.topic || '').trim();
    const subject = [subjectPrefix, topic, name].filter(Boolean).join(' — ');

    const payloadFields: Record<string, string> = {};
    visibleFields.forEach((field) => {
      payloadFields[field.label] = values[field.name] || '';
    });

    setStatus('submitting');
    try {
      await submitSiteForm({ subject, fields: payloadFields });
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg(`Could not open email. Please write directly to ${SITE_EMAIL}.`);
    }
  };

  if (status === 'success') {
    return (
      <div className="border border-gold/40 px-6 py-10 text-center space-y-4">
        <p className="text-gold text-sm tracking-[0.3em] uppercase">{successTitle}</p>
        <p className="text-cream/70 text-sm leading-relaxed max-w-md mx-auto">{successBody}</p>
        <p className="text-muted-foreground text-xs">
          If nothing opened, send the same details to{' '}
          <a href={`mailto:${SITE_EMAIL}`} className="text-gold hover:underline">{SITE_EMAIL}</a>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {visibleFields.map((field) => (
        <label key={field.name} className="block">
          <span className="text-cream text-xs tracking-[0.2em] uppercase mb-2 block">
            {field.label}
            {!field.required ? (
              <span className="text-muted-foreground tracking-normal normal-case ml-2">optional</span>
            ) : null}
          </span>
          {field.type === 'textarea' ? (
            <textarea
              name={field.name}
              value={values[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
              rows={field.rows || 5}
              placeholder={field.placeholder}
              className={`${inputClass} resize-y`}
            />
          ) : field.type === 'select' ? (
            <select
              name={field.name}
              value={values[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
              className={`${inputClass} appearance-none`}
            >
              <option value="" className="bg-obsidian text-cream">
                Select…
              </option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value} className="bg-obsidian text-cream">
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type || 'text'}
              name={field.name}
              value={values[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              required={field.required}
              placeholder={field.placeholder}
              className={inputClass}
            />
          )}
        </label>
      ))}

      {errorMsg && <p className="text-destructive text-xs">{errorMsg}</p>}

      <button type="submit" disabled={status === 'submitting'} className="btn-hero-primary w-full sm:w-auto disabled:opacity-50">
        {status === 'submitting' ? 'Opening…' : submitLabel}
      </button>
    </form>
  );
};

export default InquiryForm;
