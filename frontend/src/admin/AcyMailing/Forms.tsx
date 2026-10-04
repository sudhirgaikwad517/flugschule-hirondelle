import React, { useState, useEffect } from 'react';
import { AcyLayout } from './AcyLayout';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';

// Old AcyMailing's real Forms feature - a designed signup form (which lists
// it feeds, which custom fields it asks for, its styling/messages),
// embeddable into any admin-built Seite (see NewsletterFormBlock.tsx and
// Pages.tsx's "Newsletter-Formular einfügen").
interface NewsletterFormRow {
  id: string;
  name: string;
  listCodes: string;
  fieldIds: string | null;
  showNameField: boolean;
  submitButtonText: string;
  successMessage: string;
  backgroundColor: string | null;
  buttonColor: string | null;
  textColor: string | null;
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

export const AcyForms = () => {
  const [forms, setForms] = useState<NewsletterFormRow[]>([]);
  const [lists, setLists] = useState<{ code: string; name: string }[]>([]);
  const [fields, setFields] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<NewsletterFormRow> & { listCodesArr?: string[]; fieldIdsArr?: string[] }>({});

  const fetchForms = async () => {
    try {
      const res = await fetch('/api/newsletterforms?_end=500', { headers: authHeaders() });
      if (res.ok) setForms(await res.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchForms();
    fetch('/api/newsletterlists', { headers: authHeaders() }).then(r => r.ok ? r.json() : []).then(setLists).catch(() => {});
    fetch('/api/newsletterFields?_end=500', { headers: authHeaders() }).then(r => r.ok ? r.json() : []).then(setFields).catch(() => {});
  }, []);

  const openModal = (form?: NewsletterFormRow) => {
    if (form) {
      setEditing({
        ...form,
        listCodesArr: (form.listCodes || '').split(',').map(s => s.trim()).filter(Boolean),
        fieldIdsArr: (form.fieldIds || '').split(',').map(s => s.trim()).filter(Boolean),
      });
    } else {
      setEditing({
        name: '', listCodesArr: [], fieldIdsArr: [], showNameField: true,
        submitButtonText: 'Anmelden', successMessage: 'Vielen Dank für Ihre Anmeldung!',
        backgroundColor: '#ffffff', buttonColor: '#0ea5e9', textColor: '#334155',
      });
    }
    setIsModalOpen(true);
  };

  const toggleList = (code: string) => {
    setEditing(prev => {
      const arr = prev.listCodesArr || [];
      return { ...prev, listCodesArr: arr.includes(code) ? arr.filter(c => c !== code) : [...arr, code] };
    });
  };
  const toggleField = (id: string) => {
    setEditing(prev => {
      const arr = prev.fieldIdsArr || [];
      return { ...prev, fieldIdsArr: arr.includes(id) ? arr.filter(f => f !== id) : [...arr, id] };
    });
  };

  const handleSave = async () => {
    if (!editing.name || !editing.listCodesArr || editing.listCodesArr.length === 0) return;
    const payload = {
      name: editing.name,
      listCodes: editing.listCodesArr.join(','),
      fieldIds: (editing.fieldIdsArr || []).join(','),
      showNameField: editing.showNameField ?? true,
      submitButtonText: editing.submitButtonText || 'Anmelden',
      successMessage: editing.successMessage || 'Vielen Dank für Ihre Anmeldung!',
      backgroundColor: editing.backgroundColor || '#ffffff',
      buttonColor: editing.buttonColor || '#0ea5e9',
      textColor: editing.textColor || '#334155',
    };
    const url = editing.id ? `/api/newsletterforms/${editing.id}` : '/api/newsletterforms';
    const method = editing.id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) {
      setIsModalOpen(false);
      fetchForms();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Dieses Formular wirklich löschen? Bereits auf Seiten eingefügte Platzhalter zeigen dann nichts mehr an.')) return;
    await fetch(`/api/newsletterforms/${id}`, { method: 'DELETE', headers: authHeaders() });
    fetchForms();
  };

  const copyId = (id: string) => {
    navigator.clipboard?.writeText(id);
  };

  return (
    <AcyLayout title="Flugschule Mailing > Formulare">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-medium text-slate-800">Anmeldeformulare</h2>
          <p className="text-sm text-slate-500">In Admin &gt; Seiten über "Newsletter-Formular einfügen" auf jeder beliebigen Seite platzierbar.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-[#0ea5e9] text-white rounded-md font-medium hover:bg-[#0284c7] transition-colors shadow-sm">
          <Plus size={18} /> Neues Formular
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-700">Name</th>
              <th className="px-4 py-3 font-medium">Zielliste(n)</th>
              <th className="px-4 py-3 font-medium text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">Lädt...</td></tr>
            ) : forms.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">Noch keine Formulare angelegt.</td></tr>
            ) : (
              forms.map((f) => (
                <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{f.name}</td>
                  <td className="px-4 py-3">{f.listCodes}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3 text-slate-400">
                      <button onClick={() => copyId(f.id)} className="hover:text-[#0ea5e9] transition-colors" title="ID kopieren"><Copy size={16} /></button>
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-slate-800 mb-6">{editing.id ? 'Formular bearbeiten' : 'Neues Formular'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input type="text" value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Zielliste(n) *</label>
                <div className="flex flex-wrap gap-3">
                  {lists.map(l => (
                    <label key={l.code} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input type="checkbox" checked={(editing.listCodesArr || []).includes(l.code)} onChange={() => toggleList(l.code)} /> {l.name}
                    </label>
                  ))}
                  {lists.length === 0 && <p className="text-sm text-slate-400">Keine Listen vorhanden.</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Zusätzliche Felder</label>
                <div className="flex flex-wrap gap-3">
                  {fields.map(f => (
                    <label key={f.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input type="checkbox" checked={(editing.fieldIdsArr || []).includes(f.id)} onChange={() => toggleField(f.id)} /> {f.title}
                    </label>
                  ))}
                  {fields.length === 0 && <p className="text-sm text-slate-400">Keine benutzerdefinierten Felder vorhanden.</p>}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.showNameField ?? true} onChange={(e) => setEditing({ ...editing, showNameField: e.target.checked })} />
                <span className="text-sm text-slate-700">Namensfeld anzeigen</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Button-Text</label>
                  <input type="text" value={editing.submitButtonText || ''} onChange={(e) => setEditing({ ...editing, submitButtonText: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Erfolgsmeldung</label>
                  <input type="text" value={editing.successMessage || ''} onChange={(e) => setEditing({ ...editing, successMessage: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-md" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hintergrund</label>
                  <input type="color" value={editing.backgroundColor || '#ffffff'} onChange={(e) => setEditing({ ...editing, backgroundColor: e.target.value })} className="w-full h-9 border border-slate-200 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Button-Farbe</label>
                  <input type="color" value={editing.buttonColor || '#0ea5e9'} onChange={(e) => setEditing({ ...editing, buttonColor: e.target.value })} className="w-full h-9 border border-slate-200 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Textfarbe</label>
                  <input type="color" value={editing.textColor || '#334155'} onChange={(e) => setEditing({ ...editing, textColor: e.target.value })} className="w-full h-9 border border-slate-200 rounded-md" />
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-md transition-colors">Abbrechen</button>
              <button onClick={handleSave} disabled={!editing.name || !editing.listCodesArr?.length} className="px-4 py-2 bg-[#0ea5e9] text-white rounded-md font-medium hover:bg-[#0284c7] transition-colors disabled:opacity-50">Speichern</button>
            </div>
          </div>
        </div>
      )}
    </AcyLayout>
  );
};
