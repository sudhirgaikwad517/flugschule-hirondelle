import { Fragment, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SafeHtml } from './SafeHtml';

// The reusable core of a Visforms-style dynamic form - originally built
// (and still deep-verified against old's real site-side render logic) for
// the fixed /service/service-auftrag page (ServiceAuftrag.tsx, which now
// just wraps this with its own page-hero heading), extracted so an admin-
// built "Seite" (Pages.tsx/DynamicPage.tsx) can embed ANY form by id too,
// via the "Formular einfügen" block - see PageFormBlock.tsx. Keeping this
// as the single implementation (not a copy) means every field type/spam/
// email/redirect/layout behavior verified against old stays in sync
// wherever a form gets rendered, instead of two versions silently drifting
// apart over time.

type FieldType =
  | 'text' | 'password' | 'email' | 'date' | 'number' | 'url' | 'tel' | 'hidden'
  | 'textarea' | 'checkbox' | 'multicheckbox' | 'radio' | 'select'
  | 'file' | 'image' | 'submit' | 'reset' | 'fieldsep';

interface FormFieldDef {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  order: number;
  published?: boolean;
  defaultValue?: string;
  min?: number;
  max?: number;
  // Old Visforms' real per-field "Zusatzinfo" (custominfo) - genuine
  // customer-facing help text shown next to the field.
  helpText?: string;
}

interface PublicSettings {
  honeypotEnabled: boolean;
  cssClass: string;
  setFocus: boolean;
  requiredPosition: 'top' | 'captcha' | 'bottom' | 'none';
  requiredAsterisk: boolean;
  requiredTextColor: string;
  requiredAsteriskColor: string;
  showProcessingMessage: boolean;
  processingMessage: string;
  poweredBy: boolean;
  allowFrontendDataView: boolean;
}

const DEFAULT_PUBLIC_SETTINGS: PublicSettings = {
  honeypotEnabled: true,
  cssClass: '',
  setFocus: true,
  requiredPosition: 'top',
  requiredAsterisk: true,
  requiredTextColor: '#cc0000',
  requiredAsteriskColor: '#cc0000',
  showProcessingMessage: false,
  processingMessage: '',
  poweredBy: false,
  allowFrontendDataView: false,
};

// No submitted value of their own - never seeded into `values`, never part
// of the visible field loop (submit/reset/image are pulled into the footer;
// fieldsep still renders inline at its own position, handled separately).
const NO_VALUE_TYPES = new Set<FieldType>(['submit', 'reset', 'fieldsep', 'image']);

export const FormRenderer = ({ formId }: { formId: string }) => {
  const [fields, setFields] = useState<FormFieldDef[]>([]);
  const [introText, setIntroText] = useState('');
  const [publicSettings, setPublicSettings] = useState<PublicSettings>(DEFAULT_PUBLIC_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [values, setValues] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<{ textResult: string } | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>(null);

  const initialValueFor = (f: FormFieldDef) => {
    if (f.type === 'checkbox') return false;
    if (f.type === 'multicheckbox') return [] as string[];
    if (f.type === 'hidden') return f.defaultValue || '';
    return '';
  };

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetch(`/api/formconfigs/${formId}/public`)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((data) => {
        const sorted = [...(data.fields || [])].sort((a: FormFieldDef, b: FormFieldDef) => a.order - b.order);
        setFields(sorted);
        setIntroText(data.introText || '');
        setPublicSettings({ ...DEFAULT_PUBLIC_SETTINGS, ...(data.publicSettings || {}) });
        const initial: Record<string, any> = {};
        sorted.forEach((f) => {
          if (NO_VALUE_TYPES.has(f.type)) return;
          initial[f.id] = initialValueFor(f);
        });
        setValues(initial);
      })
      .catch(() => { setFields([]); setNotFound(true); })
      .finally(() => setLoading(false));
  }, [formId]);

  useEffect(() => {
    if (!loading && publicSettings.setFocus) firstFieldRef.current?.focus();
  }, [loading, publicSettings.setFocus]);

  const setValue = (id: string, value: any) => setValues((prev) => ({ ...prev, [id]: value }));

  const resetForm = () => {
    const reset: Record<string, any> = {};
    fields.forEach((f) => {
      if (NO_VALUE_TYPES.has(f.type)) return;
      reset[f.id] = initialValueFor(f);
    });
    setValues(reset);
  };

  const handleFileUpload = async (fieldId: string, file: File) => {
    setUploadingFields((prev) => ({ ...prev, [fieldId]: true }));
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/serviceorders/upload', { method: 'POST', body });
      const json = await res.json();
      if (res.ok) setValue(fieldId, json.url);
      else alert(json.message || 'Upload fehlgeschlagen');
    } catch {
      alert('Netzwerkfehler beim Hochladen');
    } finally {
      setUploadingFields((prev) => ({ ...prev, [fieldId]: false }));
    }
  };

  // Old's real site-side rendering (deep-verified): submit/reset/image
  // always render together in a fixed footer, never inline at their stored
  // `ordering` position - only their order relative to EACH OTHER matters.
  const inlineFields = fields.filter((f) => f.type !== 'submit' && f.type !== 'reset' && f.type !== 'image');
  const submitField = fields.find((f) => f.type === 'submit' || f.type === 'image');
  const resetField = fields.find((f) => f.type === 'reset');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/serviceorders/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, data: values, hp: (values as any)._hp }),
      });
      const json = await res.json();
      if (res.ok) {
        if (json.redirectUrl) {
          window.location.href = json.redirectUrl;
          return;
        }
        resetForm();
        setResult({ textResult: json.textResult || 'Vielen Dank, Ihre Anfrage wurde erfolgreich übermittelt.' });
      } else {
        alert(json.message || 'Fehler beim Senden');
      }
    } catch {
      alert('Netzwerkfehler. Bitte später erneut versuchen.');
    } finally {
      setSubmitting(false);
    }
  };

  const asteriskStyle = { color: publicSettings.requiredAsteriskColor };
  const requiredLegendStyle = { color: publicSettings.requiredTextColor };
  const requiredAsterisk = (required: boolean) =>
    required && publicSettings.requiredAsterisk ? <span style={asteriskStyle}>*</span> : null;

  const requiredLegend = (
    <p className="text-xs font-semibold tracking-wider mb-8 uppercase" style={requiredLegendStyle}>Pflichtfeld *</p>
  );

  const renderField = (field: FormFieldDef, index: number) => {
    const inner = renderFieldInner(field, index);
    if (!field.helpText) return inner;
    return (
      <Fragment key={field.id}>
        {inner}
        <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8 -mt-4">
          <div className="hidden md:block md:w-1/3"></div>
          <p className="md:w-2/3 text-xs text-gray-500 leading-relaxed">{field.helpText}</p>
        </div>
      </Fragment>
    );
  };

  const renderFieldInner = (field: FormFieldDef, index: number) => {
    const isFirst = index === 0;
    const commonLabel = (
      <label htmlFor={field.id} className="md:w-1/3 text-sm text-gray-700 font-medium group-focus-within:text-[#53a8c7] transition-colors">
        {field.label} {requiredAsterisk(field.required)}
      </label>
    );

    if (field.type === 'checkbox') {
      return (
        <div key={field.id} className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
          <div className="md:w-1/3"></div>
          <div className="md:w-2/3 flex items-center gap-3">
            <div className="relative flex items-center justify-center w-5 h-5">
              <input
                ref={isFirst ? (firstFieldRef as any) : undefined}
                type="checkbox"
                id={field.id}
                checked={!!values[field.id]}
                onChange={(e) => setValue(field.id, e.target.checked)}
                className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded cursor-pointer checked:bg-[#53a8c7] checked:border-[#53a8c7] transition-all"
              />
              <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <label htmlFor={field.id} className="text-[15px] text-gray-800 font-medium cursor-pointer">{field.label}</label>
          </div>
        </div>
      );
    }

    if (field.type === 'radio') {
      return (
        <div key={field.id} className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8 pt-4">
          <label className="md:w-1/3 text-sm text-gray-700 font-medium pt-1">
            {field.label} {requiredAsterisk(field.required)}
          </label>
          <div className="md:w-2/3 space-y-4">
            {(field.options || []).map((opt, optIndex) => (
              <label key={opt} className="flex items-start gap-4 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 mt-0.5">
                  <input
                    ref={isFirst && optIndex === 0 ? (firstFieldRef as any) : undefined}
                    type="radio"
                    name={field.id}
                    checked={values[field.id] === opt}
                    onChange={() => setValue(field.id, opt)}
                    required={field.required}
                    className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full cursor-pointer checked:border-[#53a8c7] transition-all"
                  />
                  <div className="absolute w-2.5 h-2.5 bg-[#53a8c7] rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                </div>
                <span className="text-[15px] text-gray-700 group-hover:text-gray-900 transition-colors">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (field.type === 'multicheckbox') {
      const selected: string[] = Array.isArray(values[field.id]) ? values[field.id] : [];
      const toggle = (opt: string) => {
        setValue(field.id, selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt]);
      };
      return (
        <div key={field.id} className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8 pt-4">
          <label className="md:w-1/3 text-sm text-gray-700 font-medium pt-1">
            {field.label} {requiredAsterisk(field.required)}
          </label>
          <div className="md:w-2/3 space-y-4">
            {(field.options || []).map((opt) => (
              <label key={opt} className="flex items-start gap-4 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 mt-0.5">
                  <input
                    type="checkbox"
                    checked={selected.includes(opt)}
                    onChange={() => toggle(opt)}
                    className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded cursor-pointer checked:bg-[#53a8c7] checked:border-[#53a8c7] transition-all"
                  />
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span className="text-[15px] text-gray-700 group-hover:text-gray-900 transition-colors">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (field.type === 'file') {
      const currentUrl = values[field.id];
      const isUploading = !!uploadingFields[field.id];
      return (
        <div key={field.id} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 group">
          {commonLabel}
          <div className="md:w-2/3">
            <input
              type="file"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(field.id, f); }}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-md file:border-0 file:bg-[#53a8c7] file:text-white file:text-sm file:font-semibold file:cursor-pointer hover:file:bg-[#4396b5]"
            />
            {isUploading && <p className="text-xs text-gray-500 mt-2">Wird hochgeladen...</p>}
            {!isUploading && currentUrl && (
              <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#53a8c7] underline mt-2 inline-block">Hochgeladene Datei ansehen</a>
            )}
          </div>
        </div>
      );
    }

    if (field.type === 'fieldsep') {
      return (
        <div key={field.id} className="pt-2">
          {field.label && <h3 className="text-sm font-semibold text-luxury-dark uppercase tracking-wide mb-3">{field.label}</h3>}
          <hr className="border-gray-200" />
        </div>
      );
    }

    if (field.type === 'hidden') {
      return <input key={field.id} type="hidden" value={values[field.id] || ''} readOnly />;
    }

    if (field.type === 'select') {
      return (
        <div key={field.id} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 group">
          {commonLabel}
          <div className="md:w-2/3">
            <select
              ref={isFirst ? (firstFieldRef as any) : undefined}
              id={field.id}
              value={values[field.id] || ''}
              onChange={(e) => setValue(field.id, e.target.value)}
              required={field.required}
              className="w-full bg-white border border-gray-300 px-5 py-3 text-[15px] focus:outline-none focus:border-[#53a8c7] focus:ring-2 focus:ring-[#53a8c7]/20 transition-all rounded-md"
            >
              <option value="">Bitte wählen</option>
              {(field.options || []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.id} className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8 group">
          <label htmlFor={field.id} className="md:w-1/3 text-sm text-gray-700 font-medium pt-3 group-focus-within:text-[#53a8c7] transition-colors">
            {field.label} {requiredAsterisk(field.required)}
          </label>
          <div className="md:w-2/3">
            <textarea
              ref={isFirst ? (firstFieldRef as any) : undefined}
              id={field.id}
              rows={3}
              value={values[field.id] || ''}
              onChange={(e) => setValue(field.id, e.target.value)}
              required={field.required}
              placeholder={field.placeholder}
              className="w-full bg-white border border-gray-300 px-5 py-3 text-[15px] focus:outline-none focus:border-[#53a8c7] focus:ring-2 focus:ring-[#53a8c7]/20 transition-all rounded-md resize-y placeholder:text-gray-400"
            ></textarea>
          </div>
        </div>
      );
    }

    // text / password / email / date / number / url / tel - all a plain
    // <input type={field.type}>, HTML already knows what to do with each.
    return (
      <div key={field.id} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 group">
        {commonLabel}
        <div className="md:w-2/3">
          <input
            ref={isFirst ? (firstFieldRef as any) : undefined}
            type={field.type}
            id={field.id}
            value={values[field.id] || ''}
            onChange={(e) => setValue(field.id, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            min={field.type === 'number' || field.type === 'date' ? field.min : undefined}
            max={field.type === 'number' || field.type === 'date' ? field.max : undefined}
            className="w-full bg-white border border-gray-300 px-5 py-3 text-[15px] focus:outline-none focus:border-[#53a8c7] focus:ring-2 focus:ring-[#53a8c7]/20 transition-all rounded-md placeholder:text-gray-400"
          />
        </div>
      </div>
    );
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Formular wird geladen...</div>;
  if (notFound) return null; // matches PageGalleryBlock.tsx: an unconfigured/removed form renders nothing, not an error block

  return (
    <div>
      {(introText || publicSettings.allowFrontendDataView) && (
        <div className="max-w-4xl mb-12">
          <SafeHtml
            html={introText}
            className="text-gray-600 font-light space-y-4 leading-relaxed text-[15px] [&_strong]:text-luxury-dark [&_strong]:font-medium [&_h1]:font-luxury [&_h1]:text-2xl [&_h2]:font-luxury [&_h2]:text-xl"
          />
          {publicSettings.allowFrontendDataView && (
            <Link to={`/service/${formId}/meine-eintraege`} className="inline-block mt-4 text-sm text-[#53a8c7] hover:text-[#4396b5] underline underline-offset-2">
              Meine bisherigen Einträge ansehen
            </Link>
          )}
        </div>
      )}

      <div className="w-full">
        {result ? (
          <div className="bg-white p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-xl border border-gray-100 relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#53a8c7] to-[#C19B76]"></div>
            <SafeHtml html={result.textResult} className="text-gray-700 leading-relaxed [&_p]:mb-3" />
            <button
              type="button"
              onClick={() => setResult(null)}
              className="mt-8 px-10 py-3.5 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold rounded-md transition-all shadow-sm text-sm uppercase tracking-wide"
            >
              Neuer Auftrag
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className={`bg-white p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-xl border border-gray-100 relative overflow-hidden ${publicSettings.cssClass}`}
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#53a8c7] to-[#C19B76]"></div>

            {publicSettings.honeypotEnabled && (
              <div style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }} aria-hidden="true">
                <label htmlFor="_hp">Bitte freilassen</label>
                <input
                  type="text"
                  id="_hp"
                  name="_hp"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values._hp || ''}
                  onChange={(e) => setValue('_hp', e.target.value)}
                />
              </div>
            )}

            {publicSettings.requiredPosition === 'top' && requiredLegend}

            <div className="space-y-6">
              {inlineFields.map((f, i) => renderField(f, i))}
            </div>

            {publicSettings.requiredPosition === 'bottom' && (
              <div className="mt-8">{requiredLegend}</div>
            )}

            {submitting && publicSettings.showProcessingMessage && publicSettings.processingMessage && (
              <div className="mt-8">
                <SafeHtml html={publicSettings.processingMessage} className="text-sm text-gray-600 text-center" />
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12 mt-8">
              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                className="w-full sm:w-auto px-10 py-3.5 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold rounded-md transition-all shadow-sm text-sm uppercase tracking-wide disabled:opacity-50"
              >
                {resetField?.label || 'Zurücksetzen'}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-10 py-3.5 bg-[#53a8c7] hover:bg-[#4396b5] text-white font-semibold rounded-md transition-all shadow-md hover:shadow-lg text-sm uppercase tracking-wide disabled:opacity-60"
              >
                {submitting ? 'Wird gesendet...' : (submitField?.label || 'Auftrag absenden')}
              </button>
            </div>

            {publicSettings.poweredBy && (
              <p className="text-center text-[11px] text-gray-400 mt-6">Bereitgestellt von Flugschule Hirondelle</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
