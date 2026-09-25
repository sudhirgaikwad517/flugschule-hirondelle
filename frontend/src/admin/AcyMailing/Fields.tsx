import React, { useState, useEffect } from 'react';
import { AcyLayout } from './AcyLayout';
import { Plus, Edit, Trash2 } from 'lucide-react';

// Old AcyMailing's acymailing_fields - admin-definable extra subscriber
// data (phone, interests, birthday, ...). Answers are stored per-subscriber
// on Newsletter.customFields as {[fieldId]: value} - see Subscribers.tsx/
// EditSubscriber.tsx for where those answers are actually entered, and
// Newsletter.tsx (the public subscribe form) for where a visitor fills them
// in themselves when showOnForm is true.
interface FieldDef {
  id: string;
  title: string;
  slug: string;
  fieldType: string;
  options: string | null;
  required: boolean;
  showOnForm: boolean;
  order: number;
}

const FIELD_TYPES = [
  { id: 'text', name: 'Text' },
  { id: 'textarea', name: 'Mehrzeiliger Text' },
  { id: 'select', name: 'Auswahlliste' },
  { id: 'checkbox', name: 'Checkbox (Ja/Nein)' },
  { id: 'date', name: 'Datum' },
];

const slugify = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

export const AcyFields = () => {
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<FieldDef>>({});

  const fetchFields = async () => {
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch('/api/newsletterFields?_sort=order&_order=ASC&_end=1000', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setFields(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFields(); }, []);

  const openModal = (field?: FieldDef) => {
    setEditing(field || { title: '', fieldType: 'text', required: false, showOnForm: true, order: fields.length });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing.title) return;
    const token = localStorage.getItem('auth');
    const slug = editing.slug || slugify(editing.title);
    const url = editing.id ? `/api/newsletterFields/${editing.id}` : '/api/newsletterFields';
    const method = editing.id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editing, slug }),
    });
    if (res.ok) {
      setIsModalOpen(false);
      fetchFields();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Dieses Feld wirklich löschen? Bereits erfasste Antworten gehen dabei nicht verloren, sind aber nicht mehr zuordenbar.')) return;
    const token = localStorage.getItem('auth');
    await fetch(`/api/newsletterFields/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchFields();
  };

  return (
    <AcyLayout title="AcyMailing > Benutzerdefinierte Felder">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-medium text-slate-800">Benutzerdefinierte Felder</h2>
          <p className="text-sm text-slate-500">Zusätzliche Angaben, die pro Abonnent erfasst werden können (Telefon, Interessen, ...)</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-[#0ea5e9] text-white rounded-md font-medium hover:bg-[#0284c7] transition-colors shadow-sm">
          <Plus size={18} /> Neues Feld
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-700">Titel</th>
              <th className="px-4 py-3 font-medium text-center">Typ</th>
              <th className="px-4 py-3 font-medium text-center">Pflichtfeld</th>
              <th className="px-4 py-3 font-medium text-center">Im Anmeldeformular</th>
              <th className="px-4 py-3 font-medium text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Lädt...</td></tr>
            ) : fields.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Noch keine Felder angelegt.</td></tr>
            ) : (
              fields.map((f) => (
                <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{f.title}</td>
                  <td className="px-4 py-3 text-center">{FIELD_TYPES.find((t) => t.id === f.fieldType)?.name || f.fieldType}</td>
                  <td className="px-4 py-3 text-center">{f.required ? 'Ja' : 'Nein'}</td>
                  <td className="px-4 py-3 text-center">{f.showOnForm ? 'Ja' : 'Nein'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3 text-slate-400">
                      <button onClick={() => openModal(f)} className="hover:text-[#0ea5e9] transition-colors" title="Bearbeiten"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(f.id)} className="hover:text-red-500 transition-colors" title="Löschen"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-6">{editing.id ? 'Feld bearbeiten' : 'Neues Feld'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titel</label>
                <input
                  type="text"
                  value={editing.title || ''}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Feldtyp</label>
                <select
                  value={editing.fieldType || 'text'}
                  onChange={(e) => setEditing({ ...editing, fieldType: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9]"
                >
                  {FIELD_TYPES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              {editing.fieldType === 'select' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Optionen (eine pro Zeile)</label>
                  <textarea
                    value={editing.options || ''}
                    onChange={(e) => setEditing({ ...editing, options: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9]"
                    rows={3}
                  />
                </div>
              )}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editing.required || false} onChange={(e) => setEditing({ ...editing, required: e.target.checked })} className="rounded text-[#0ea5e9] focus:ring-[#0ea5e9]" />
                  <span className="text-sm text-slate-700">Pflichtfeld</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editing.showOnForm ?? true} onChange={(e) => setEditing({ ...editing, showOnForm: e.target.checked })} className="rounded text-[#0ea5e9] focus:ring-[#0ea5e9]" />
                  <span className="text-sm text-slate-700">Im öffentlichen Anmeldeformular zeigen</span>
                </label>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-md transition-colors">Abbrechen</button>
              <button onClick={handleSave} disabled={!editing.title} className="px-4 py-2 bg-[#0ea5e9] text-white rounded-md font-medium hover:bg-[#0284c7] transition-colors disabled:opacity-50">Speichern</button>
            </div>
          </div>
        </div>
      )}
    </AcyLayout>
  );
};
