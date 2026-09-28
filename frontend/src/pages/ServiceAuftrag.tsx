import { useEffect, useState } from 'react';
import { Banner } from '../components/common/Banner';

type FieldType = 'text' | 'email' | 'tel' | 'textarea' | 'checkbox' | 'radio' | 'select';

interface FormFieldDef {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  order: number;
}

const FORM_ID = 'service-auftrag';

// Fully dynamic - renders whatever fields the admin has configured for this
// form (Admin > Formular-Editor), not a fixed set of hardcoded inputs.
// Matches Joomla Visforms' own real capability: adding/removing/retyping a
// field there actually changes what customers see here.
export const ServiceAuftrag = () => {
  const [fields, setFields] = useState<FormFieldDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, any>>({});

  useEffect(() => {
    fetch(`/api/formconfigs/${FORM_ID}/public`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = [...(data.fields || [])].sort((a: FormFieldDef, b: FormFieldDef) => a.order - b.order);
        setFields(sorted);
        const initial: Record<string, any> = {};
        sorted.forEach((f) => { initial[f.id] = f.type === 'checkbox' ? false : ''; });
        setValues(initial);
      })
      .catch(() => setFields([]))
      .finally(() => setLoading(false));
  }, []);

  const setValue = (id: string, value: any) => setValues((prev) => ({ ...prev, [id]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/serviceorders/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: FORM_ID, data: values }),
      });
      const json = await res.json();
      if (res.ok) {
        alert('Service-Auftrag erfolgreich gesendet!');
        const reset: Record<string, any> = {};
        fields.forEach((f) => { reset[f.id] = f.type === 'checkbox' ? false : ''; });
        setValues(reset);
      } else {
        alert(json.message || 'Fehler beim Senden');
      }
    } catch {
      alert('Netzwerkfehler. Bitte später erneut versuchen.');
    }
  };

  const renderField = (field: FormFieldDef) => {
    const commonLabel = (
      <label htmlFor={field.id} className="md:w-1/3 text-sm text-gray-700 font-medium group-focus-within:text-[#53a8c7] transition-colors">
        {field.label} {field.required && <span className="text-[#cc0000]">*</span>}
      </label>
    );

    if (field.type === 'checkbox') {
      return (
        <div key={field.id} className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
          <div className="md:w-1/3"></div>
          <div className="md:w-2/3 flex items-center gap-3">
            <div className="relative flex items-center justify-center w-5 h-5">
              <input
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
            {field.label} {field.required && <span className="text-[#cc0000]">*</span>}
          </label>
          <div className="md:w-2/3 space-y-4">
            {(field.options || []).map((opt) => (
              <label key={opt} className="flex items-start gap-4 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 mt-0.5">
                  <input
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

    if (field.type === 'select') {
      return (
        <div key={field.id} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 group">
          {commonLabel}
          <div className="md:w-2/3">
            <select
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
            {field.label} {field.required && <span className="text-[#cc0000]">*</span>}
          </label>
          <div className="md:w-2/3">
            <textarea
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

    // text / email / tel
    return (
      <div key={field.id} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 group">
        {commonLabel}
        <div className="md:w-2/3">
          <input
            type={field.type}
            id={field.id}
            value={values[field.id] || ''}
            onChange={(e) => setValue(field.id, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            className="w-full bg-white border border-gray-300 px-5 py-3 text-[15px] focus:outline-none focus:border-[#53a8c7] focus:ring-2 focus:ring-[#53a8c7]/20 transition-all rounded-md placeholder:text-gray-400"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-white font-luxurysans pb-20">
      <Banner />

      <section className="pt-16 md:pt-24 pb-16 md:pb-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1200px]">

          <div className="max-w-4xl mb-12">
            <p className="text-luxury-heading uppercase tracking-[0.2em] text-xs font-semibold mb-3">
              SERVICE
            </p>
            <h1 className="font-luxury text-4xl md:text-5xl text-luxury-dark uppercase mb-6">
              Service-Auftrag
            </h1>
            <div className="w-24 h-px bg-luxury-gold mb-8"></div>

            <div className="text-gray-600 font-light space-y-6 leading-relaxed text-[15px]">
              <p>
                Bitte ausgefüllten Auftrag ausdrucken und zusammen mit der Ausrüstung in unserer Flugschule in Weinheim oder alternativ in Landau vorbeibringen.
              </p>
              <p>
                <strong className="block text-luxury-dark font-medium mb-1">69469 Weinheim, Untergasse 27:</strong>
                bitte wegen Öffnungszeiten Newsletter beachten
              </p>
              <p>
                <strong className="block text-luxury-dark font-medium mb-1">76829 Landau, Am Birnbach 6:</strong>
                Termin bitte telefonisch (+49 (0)6201 8452097) oder per E-Mail (info@fs-hirondelle.de) vereinbaren
              </p>
            </div>
          </div>

          <div className="w-full">
            {loading ? (
              <div className="text-center py-20 text-gray-500">Formular wird geladen...</div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-xl border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#53a8c7] to-[#C19B76]"></div>

                <p className="text-[#cc0000] text-xs font-semibold tracking-wider mb-8 uppercase">Pflichtfeld *</p>

                <div className="space-y-6">
                  {fields.map(renderField)}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      const reset: Record<string, any> = {};
                      fields.forEach((f) => { reset[f.id] = f.type === 'checkbox' ? false : ''; });
                      setValues(reset);
                    }}
                    className="w-full sm:w-auto px-10 py-3.5 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold rounded-md transition-all shadow-sm text-sm uppercase tracking-wide"
                  >
                    Zurücksetzen
                  </button>
                  <button type="submit" className="w-full sm:w-auto px-10 py-3.5 bg-[#53a8c7] hover:bg-[#4396b5] text-white font-semibold rounded-md transition-all shadow-md hover:shadow-lg text-sm uppercase tracking-wide">
                    Auftrag absenden
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </section>

    </div>
  );
};
