import { useEffect, useState } from 'react';

interface FieldDef {
  id: string;
  title: string;
  fieldType: string;
  options: string | null;
  required: boolean;
}

interface FormConfig {
  id: string;
  name: string;
  showNameField: boolean;
  submitButtonText: string;
  successMessage: string;
  backgroundColor: string | null;
  buttonColor: string | null;
  textColor: string | null;
  fields: FieldDef[];
}

// Old AcyMailing's real Forms feature - an admin-designed signup form
// embeddable into any admin-built Seite via the same page-block placeholder
// bridge already used for Galerie/Formular einfügen (see DynamicPage.tsx's
// PLACEHOLDER_RE and Pages.tsx's "Newsletter-Formular einfügen").
export const NewsletterFormBlock = ({ formId }: { formId: string }) => {
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch(`/api/newsletterforms/public/${formId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setConfig(data))
      .catch(() => setConfig(null))
      .finally(() => setLoading(false));
  }, [formId]);

  if (loading) return null;
  if (!config) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setResult(null);
    try {
      const res = await fetch(`/api/newsletterforms/public/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, customFields }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ type: 'success', text: data.message || config.successMessage });
        setName('');
        setEmail('');
        setCustomFields({});
      } else {
        setResult({ type: 'error', text: data.message || 'Fehler beim Absenden.' });
      }
    } catch {
      setResult({ type: 'error', text: 'Fehler beim Absenden.' });
    } finally {
      setSending(false);
    }
  };

  const inputStyle = { color: config.textColor || '#334155' };

  return (
    <div
      className="my-6 rounded-sm border border-gray-200 shadow-sm p-6 max-w-lg mx-auto"
      style={{ backgroundColor: config.backgroundColor || '#ffffff' }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {config.showNameField && (
          <input
            type="text"
            placeholder="Ihr Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold"
          />
        )}
        <input
          type="email"
          placeholder="Ihre E-Mail"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold"
        />

        {config.fields.map((f) => (
          <div key={f.id} style={inputStyle}>
            <label className="block text-sm mb-1">{f.title}{f.required && ' *'}</label>
            {f.fieldType === 'textarea' ? (
              <textarea
                required={f.required}
                rows={3}
                value={customFields[f.id] || ''}
                onChange={(e) => setCustomFields((prev) => ({ ...prev, [f.id]: e.target.value }))}
                className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold resize-none"
              />
            ) : f.fieldType === 'select' ? (
              <select
                required={f.required}
                value={customFields[f.id] || ''}
                onChange={(e) => setCustomFields((prev) => ({ ...prev, [f.id]: e.target.value }))}
                className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold"
              >
                <option value="">Bitte wählen...</option>
                {(f.options || '').split('\n').map((opt) => opt.trim()).filter(Boolean).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : f.fieldType === 'checkbox' ? (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={customFields[f.id] === 'true'}
                  onChange={(e) => setCustomFields((prev) => ({ ...prev, [f.id]: e.target.checked ? 'true' : 'false' }))}
                />
                <span className="text-sm">Ja</span>
              </label>
            ) : f.fieldType === 'date' ? (
              <input
                type="date"
                required={f.required}
                value={customFields[f.id] || ''}
                onChange={(e) => setCustomFields((prev) => ({ ...prev, [f.id]: e.target.value }))}
                className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold"
              />
            ) : (
              <input
                type="text"
                required={f.required}
                value={customFields[f.id] || ''}
                onChange={(e) => setCustomFields((prev) => ({ ...prev, [f.id]: e.target.value }))}
                className="w-full p-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-luxury-gold"
              />
            )}
          </div>
        ))}

        {result && (
          <p className={`text-sm font-semibold ${result.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{result.text}</p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="px-8 py-2.5 text-white transition-colors rounded-sm shadow-sm disabled:opacity-50"
          style={{ backgroundColor: config.buttonColor || '#0ea5e9' }}
        >
          {sending ? 'Sende...' : config.submitButtonText}
        </button>
      </form>
    </div>
  );
};
