import React, { useState, useEffect } from 'react';
import { AcyLayout } from './AcyLayout';
import { Plus, Edit, Trash2, X, Users } from 'lucide-react';

// Old AcyMailing's real Segments feature - dynamic subscriber filters,
// re-evaluated every time they're used (not a frozen snapshot). Conditions
// are resolved server-side in newsletterSegments.service.ts, and can be used
// as a campaign's audience instead of a fixed list (see EditEmail.tsx's
// "Einen Segmentierungsschritt hinzufügen" step).
interface SegmentCondition {
  field: string;
  operator: string;
  value: string;
  fieldId?: string;
}

interface Segment {
  id: string;
  name: string;
  matchType: string;
  conditions: string;
}

const FIELD_OPTIONS = [
  { id: 'list', name: 'Liste' },
  { id: 'tag', name: 'Tag' },
  { id: 'customField', name: 'Benutzerdefiniertes Feld' },
  { id: 'isConfirmed', name: 'Bestätigt (Double-Opt-In)' },
  { id: 'subscribedAfter', name: 'Angemeldet nach' },
  { id: 'subscribedBefore', name: 'Angemeldet vor' },
  { id: 'openedCampaign', name: 'Hat Kampagne geöffnet' },
  { id: 'notOpenedCampaign', name: 'Hat Kampagne NICHT geöffnet' },
  { id: 'clickedCampaign', name: 'Hat in Kampagne geklickt' },
  { id: 'notClickedCampaign', name: 'Hat in Kampagne NICHT geklickt' },
];

const CAMPAIGN_FIELDS = ['openedCampaign', 'notOpenedCampaign', 'clickedCampaign', 'notClickedCampaign'];

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

export const AcySegments = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<{ id?: string; name: string; matchType: string; conditions: SegmentCondition[] }>({
    name: '', matchType: 'all', conditions: []
  });
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});

  const [lists, setLists] = useState<{ code: string; name: string }[]>([]);
  const [fields, setFields] = useState<{ id: string; title: string }[]>([]);
  const [campaigns, setCampaigns] = useState<{ id: string; subject: string }[]>([]);

  const fetchSegments = async () => {
    try {
      const res = await fetch('/api/newslettersegments?_end=500', { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSegments(data);
        data.forEach((s: Segment) => {
          fetch(`/api/newslettersegments/${s.id}/preview-count`, { headers: authHeaders() })
            .then(r => r.ok ? r.json() : null)
            .then(d => d && setMemberCounts(prev => ({ ...prev, [s.id]: d.count })))
            .catch(() => {});
        });
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchSegments();
    fetch('/api/newsletterlists', { headers: authHeaders() }).then(r => r.ok ? r.json() : []).then(setLists).catch(() => {});
    fetch('/api/newsletterFields?_end=500', { headers: authHeaders() }).then(r => r.ok ? r.json() : []).then(setFields).catch(() => {});
    fetch('/api/newslettercampaigns?_end=500', { headers: authHeaders() }).then(r => r.ok ? r.json() : []).then(setCampaigns).catch(() => {});
  }, []);

  const openModal = (segment?: Segment) => {
    if (segment) {
      let conditions: SegmentCondition[] = [];
      try { conditions = JSON.parse(segment.conditions || '[]'); } catch {}
      setEditing({ id: segment.id, name: segment.name, matchType: segment.matchType, conditions });
      setPreviewCount(memberCounts[segment.id] ?? null);
    } else {
      setEditing({ name: '', matchType: 'all', conditions: [{ field: 'list', operator: 'equals', value: '' }] });
      setPreviewCount(null);
    }
    setIsModalOpen(true);
  };

  const addCondition = () => {
    setEditing(prev => ({ ...prev, conditions: [...prev.conditions, { field: 'list', operator: 'equals', value: '' }] }));
  };
  const removeCondition = (index: number) => {
    setEditing(prev => ({ ...prev, conditions: prev.conditions.filter((_, i) => i !== index) }));
  };
  const updateCondition = (index: number, patch: Partial<SegmentCondition>) => {
    setEditing(prev => ({ ...prev, conditions: prev.conditions.map((c, i) => i === index ? { ...c, ...patch } : c) }));
  };

  const handleSave = async () => {
    if (!editing.name) return;
    const url = editing.id ? `/api/newslettersegments/${editing.id}` : '/api/newslettersegments';
    const method = editing.id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editing.name, matchType: editing.matchType, conditions: editing.conditions }),
    });
    if (res.ok) {
      setIsModalOpen(false);
      fetchSegments();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Dieses Segment wirklich löschen?')) return;
    await fetch(`/api/newslettersegments/${id}`, { method: 'DELETE', headers: authHeaders() });
    fetchSegments();
  };

  return (
    <AcyLayout title="Flugschule Mailing > Segmente">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-medium text-slate-800">Segmente</h2>
          <p className="text-sm text-slate-500">Dynamische Abonnenten-Filter - werden bei jedem Versand live neu ausgewertet.</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-[#0ea5e9] text-white rounded-md font-medium hover:bg-[#0284c7] transition-colors shadow-sm">
          <Plus size={18} /> Neues Segment
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-700">Name</th>
              <th className="px-4 py-3 font-medium text-center">Bedingungen</th>
              <th className="px-4 py-3 font-medium text-center">Mitglieder</th>
              <th className="px-4 py-3 font-medium text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Lädt...</td></tr>
            ) : segments.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Noch keine Segmente angelegt.</td></tr>
            ) : (
              segments.map((s) => {
                let count = 0;
                try { count = JSON.parse(s.conditions || '[]').length; } catch {}
                return (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                    <td className="px-4 py-3 text-center">{count} ({s.matchType === 'any' ? 'ODER' : 'UND'})</td>
                    <td className="px-4 py-3 text-center flex items-center justify-center gap-1.5">
                      <Users size={14} className="text-slate-400" /> {memberCounts[s.id] ?? '...'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3 text-slate-400">
                        <button onClick={() => openModal(s)} className="hover:text-[#0ea5e9] transition-colors" title="Bearbeiten"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(s.id)} className="hover:text-red-500 transition-colors" title="Löschen"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-slate-800 mb-6">{editing.id ? 'Segment bearbeiten' : 'Neues Segment'}</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                type="text"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9]"
              />
            </div>

            <div className="mb-4 flex items-center gap-4">
              <span className="text-sm font-medium text-slate-700">Abonnenten müssen erfüllen:</span>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input type="radio" checked={editing.matchType === 'all'} onChange={() => setEditing({ ...editing, matchType: 'all' })} /> Alle Bedingungen (UND)
              </label>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input type="radio" checked={editing.matchType === 'any'} onChange={() => setEditing({ ...editing, matchType: 'any' })} /> Mindestens eine (ODER)
              </label>
            </div>

            <div className="space-y-3 mb-4">
              {editing.conditions.map((c, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md p-3">
                  <select
                    value={c.field}
                    onChange={(e) => updateCondition(i, { field: e.target.value, value: '', fieldId: undefined })}
                    className="px-3 py-1.5 border border-slate-200 rounded text-sm"
                  >
                    {FIELD_OPTIONS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>

                  {c.field === 'list' && (
                    <select value={c.value} onChange={(e) => updateCondition(i, { value: e.target.value })} className="px-3 py-1.5 border border-slate-200 rounded text-sm flex-1">
                      <option value="">Liste wählen...</option>
                      {lists.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                    </select>
                  )}

                  {c.field === 'tag' && (
                    <input type="text" placeholder="Tag" value={c.value} onChange={(e) => updateCondition(i, { value: e.target.value })} className="px-3 py-1.5 border border-slate-200 rounded text-sm flex-1" />
                  )}

                  {c.field === 'customField' && (
                    <>
                      <select value={c.fieldId || ''} onChange={(e) => updateCondition(i, { fieldId: e.target.value })} className="px-3 py-1.5 border border-slate-200 rounded text-sm">
                        <option value="">Feld wählen...</option>
                        {fields.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
                      </select>
                      <select value={c.operator} onChange={(e) => updateCondition(i, { operator: e.target.value })} className="px-3 py-1.5 border border-slate-200 rounded text-sm">
                        <option value="equals">ist gleich</option>
                        <option value="not_equals">ist nicht gleich</option>
                        <option value="contains">enthält</option>
                      </select>
                      <input type="text" placeholder="Wert" value={c.value} onChange={(e) => updateCondition(i, { value: e.target.value })} className="px-3 py-1.5 border border-slate-200 rounded text-sm flex-1" />
                    </>
                  )}

                  {c.field === 'isConfirmed' && (
                    <select value={c.value} onChange={(e) => updateCondition(i, { value: e.target.value })} className="px-3 py-1.5 border border-slate-200 rounded text-sm flex-1">
                      <option value="true">Ja</option>
                      <option value="false">Nein</option>
                    </select>
                  )}

                  {(c.field === 'subscribedAfter' || c.field === 'subscribedBefore') && (
                    <input type="date" value={c.value} onChange={(e) => updateCondition(i, { value: e.target.value })} className="px-3 py-1.5 border border-slate-200 rounded text-sm flex-1" />
                  )}

                  {CAMPAIGN_FIELDS.includes(c.field) && (
                    <select value={c.value} onChange={(e) => updateCondition(i, { value: e.target.value })} className="px-3 py-1.5 border border-slate-200 rounded text-sm flex-1">
                      <option value="">Kampagne wählen...</option>
                      {campaigns.map(cm => <option key={cm.id} value={cm.id}>{cm.subject}</option>)}
                    </select>
                  )}

                  <button onClick={() => removeCondition(i)} className="text-slate-400 hover:text-red-500 p-1"><X size={16} /></button>
                </div>
              ))}
              {editing.conditions.length === 0 && (
                <p className="text-sm text-slate-400 italic">Ohne Bedingungen umfasst dieses Segment alle aktiven Abonnenten.</p>
              )}
            </div>

            <button onClick={addCondition} className="text-[#0ea5e9] text-sm hover:underline mb-6">+ Bedingung hinzufügen</button>

            {previewCount !== null && (
              <p className="text-sm text-slate-600 mb-4">Aktuell erfüllen <strong>{previewCount}</strong> Abonnenten dieses Segment.</p>
            )}

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-md transition-colors">Abbrechen</button>
              <button onClick={handleSave} disabled={!editing.name} className="px-4 py-2 bg-[#0ea5e9] text-white rounded-md font-medium hover:bg-[#0284c7] transition-colors disabled:opacity-50">Speichern</button>
            </div>
          </div>
        </div>
      )}
    </AcyLayout>
  );
};
