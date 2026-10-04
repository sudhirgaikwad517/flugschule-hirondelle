import React, { useState, useEffect } from 'react';
import { AcyLayout } from './AcyLayout';
import { Plus, Edit, Trash2, X, Play } from 'lucide-react';

// Old AcyMailing's real Automations/Scenarios feature - a subscribe event to
// a given list (or any list) starts a sequence of one or more delayed
// emails. Triggering happens server-side in
// newsletterAutomation.service.ts's triggerAutomationsForSubscribe(); this
// page only defines the sequences themselves.
interface AutomationStep {
  delayDays: number;
  subject: string;
  body: string;
}

interface Automation {
  id: string;
  name: string;
  active: boolean;
  triggerListCode: string | null;
  steps: string;
  activeRuns?: number;
  completedRuns?: number;
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('auth')}` });

export const AcyAutomations = () => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [lists, setLists] = useState<{ code: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<{ id?: string; name: string; active: boolean; triggerListCode: string; steps: AutomationStep[] }>({
    name: '', active: true, triggerListCode: '', steps: []
  });

  const fetchAutomations = async () => {
    try {
      const res = await fetch('/api/newsletterautomations?_end=500', { headers: authHeaders() });
      if (res.ok) setAutomations(await res.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAutomations();
    fetch('/api/newsletterlists', { headers: authHeaders() }).then(r => r.ok ? r.json() : []).then(setLists).catch(() => {});
  }, []);

  const openModal = (automation?: Automation) => {
    if (automation) {
      let steps: AutomationStep[] = [];
      try { steps = JSON.parse(automation.steps || '[]'); } catch {}
      setEditing({ id: automation.id, name: automation.name, active: automation.active, triggerListCode: automation.triggerListCode || '', steps });
    } else {
      setEditing({ name: '', active: true, triggerListCode: '', steps: [{ delayDays: 0, subject: '', body: '' }] });
    }
    setIsModalOpen(true);
  };

  const addStep = () => setEditing(prev => ({ ...prev, steps: [...prev.steps, { delayDays: 1, subject: '', body: '' }] }));
  const removeStep = (i: number) => setEditing(prev => ({ ...prev, steps: prev.steps.filter((_, idx) => idx !== i) }));
  const updateStep = (i: number, patch: Partial<AutomationStep>) =>
    setEditing(prev => ({ ...prev, steps: prev.steps.map((s, idx) => idx === i ? { ...s, ...patch } : s) }));

  const handleSave = async () => {
    if (!editing.name || editing.steps.length === 0) return;
    const payload = {
      name: editing.name,
      active: editing.active,
      triggerListCode: editing.triggerListCode || null,
      steps: editing.steps,
    };
    const url = editing.id ? `/api/newsletterautomations/${editing.id}` : '/api/newsletterautomations';
    const method = editing.id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) {
      setIsModalOpen(false);
      fetchAutomations();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Diese Automatisierung wirklich löschen? Laufende Sequenzen werden dabei beendet.')) return;
    await fetch(`/api/newsletterautomations/${id}`, { method: 'DELETE', headers: authHeaders() });
    fetchAutomations();
  };

  const runNow = async () => {
    setProcessing(true);
    try {
      await fetch('/api/newsletterautomations/process-now', { method: 'POST', headers: authHeaders() });
      fetchAutomations();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AcyLayout title="Flugschule Mailing > Automatisierungen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-medium text-slate-800">Automatisierungen</h2>
          <p className="text-sm text-slate-500">Löst eine Sequenz von E-Mails aus, sobald sich jemand für eine Liste anmeldet (läuft alle 15 Minuten im Hintergrund).</p>
        </div>
        <div className="flex gap-3">
          <button onClick={runNow} disabled={processing} className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-md font-medium hover:bg-slate-50 transition-colors disabled:opacity-50">
            <Play size={16} /> {processing ? 'Läuft...' : 'Jetzt verarbeiten'}
          </button>
          <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-[#0ea5e9] text-white rounded-md font-medium hover:bg-[#0284c7] transition-colors shadow-sm">
            <Plus size={18} /> Neue Automatisierung
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-700">Name</th>
              <th className="px-4 py-3 font-medium text-center">Auslöser</th>
              <th className="px-4 py-3 font-medium text-center">Schritte</th>
              <th className="px-4 py-3 font-medium text-center">Aktiv / Abgeschlossen</th>
              <th className="px-4 py-3 font-medium text-center">Status</th>
              <th className="px-4 py-3 font-medium text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Lädt...</td></tr>
            ) : automations.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Noch keine Automatisierungen angelegt.</td></tr>
            ) : (
              automations.map((a) => {
                let stepCount = 0;
                try { stepCount = JSON.parse(a.steps || '[]').length; } catch {}
                return (
                  <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{a.name}</td>
                    <td className="px-4 py-3 text-center">{a.triggerListCode ? `Anmeldung: ${a.triggerListCode}` : 'Jede Anmeldung'}</td>
                    <td className="px-4 py-3 text-center">{stepCount}</td>
                    <td className="px-4 py-3 text-center">{a.activeRuns ?? 0} / {a.completedRuns ?? 0}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {a.active ? 'Aktiv' : 'Pausiert'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3 text-slate-400">
                        <button onClick={() => openModal(a)} className="hover:text-[#0ea5e9] transition-colors" title="Bearbeiten"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(a.id)} className="hover:text-red-500 transition-colors" title="Löschen"><Trash2 size={16} /></button>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-slate-800 mb-6">{editing.id ? 'Automatisierung bearbeiten' : 'Neue Automatisierung'}</h3>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Auslöser</label>
                <select value={editing.triggerListCode} onChange={(e) => setEditing({ ...editing, triggerListCode: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-md">
                  <option value="">Bei Anmeldung zu einer beliebigen Liste</option>
                  {lists.map(l => <option key={l.code} value={l.code}>Bei Anmeldung zu: {l.name}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} />
                <span className="text-sm text-slate-700">Aktiv</span>
              </label>
            </div>

            <h4 className="font-medium text-slate-800 mb-3">Schritte</h4>
            <div className="space-y-4 mb-4">
              {editing.steps.map((s, i) => (
                <div key={i} className="border border-slate-200 rounded-md p-4 bg-slate-50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-slate-700">Schritt {i + 1}</span>
                    <button onClick={() => removeStep(i)} className="text-slate-400 hover:text-red-500"><X size={16} /></button>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-3 mb-3 items-center">
                    <label className="text-sm text-slate-600">Verzögerung (Tage)</label>
                    <input type="number" min={0} value={s.delayDays} onChange={(e) => updateStep(i, { delayDays: Number(e.target.value) })} className="px-3 py-1.5 border border-slate-200 rounded-md w-24" />
                  </div>
                  <input type="text" placeholder="Betreff" value={s.subject} onChange={(e) => updateStep(i, { subject: e.target.value })} className="w-full px-3 py-1.5 border border-slate-200 rounded-md mb-2" />
                  <textarea placeholder="Inhalt (HTML)" rows={4} value={s.body} onChange={(e) => updateStep(i, { body: e.target.value })} className="w-full px-3 py-1.5 border border-slate-200 rounded-md font-mono text-xs" />
                </div>
              ))}
            </div>
            <button onClick={addStep} className="text-[#0ea5e9] text-sm hover:underline mb-6">+ Schritt hinzufügen</button>

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-md transition-colors">Abbrechen</button>
              <button onClick={handleSave} disabled={!editing.name || editing.steps.length === 0} className="px-4 py-2 bg-[#0ea5e9] text-white rounded-md font-medium hover:bg-[#0284c7] transition-colors disabled:opacity-50">Speichern</button>
            </div>
          </div>
        </div>
      )}
    </AcyLayout>
  );
};
