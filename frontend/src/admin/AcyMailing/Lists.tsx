import React, { useState, useEffect } from 'react';
import { AcyLayout } from './AcyLayout';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

interface List {
  id: string;
  name: string;
  description: string | null;
  color: string;
  visible: boolean;
  active: boolean;
  createdAt: string;
  subscriberCount?: number;
}

export const AcyLists = () => {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<Partial<List>>({});

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch('/api/newsletterlists', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLists(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (list?: List) => {
    if (list) {
      setEditingList(list);
    } else {
      setEditingList({
        name: '',
        description: '',
        color: '#0ea5e9',
        visible: true,
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('auth');
      const url = editingList.id 
        ? `/api/newsletterlists/${editingList.id}` 
        : '/api/newsletterlists';
      const method = editingList.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(editingList)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchLists();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Möchten Sie diese Liste wirklich löschen?')) return;
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch(`/api/newsletterlists/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchLists();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AcyLayout title="AcyMailing > Listen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-medium text-slate-800">Mailing Listen</h2>
          <p className="text-sm text-slate-500">Verwalten Sie Ihre E-Mail-Verteilerlisten</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="flex items-center gap-2 px-4 py-2 bg-[#0ea5e9] text-white rounded-md font-medium hover:bg-[#0284c7] transition-colors shadow-sm"
        >
          <Plus size={18} /> Neue Liste
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-700">Listen Name</th>
              <th className="px-4 py-3 font-medium text-center">Abonnenten</th>
              <th className="px-4 py-3 font-medium text-center">Erstellt am</th>
              <th className="px-4 py-3 font-medium text-center">Sichtbar</th>
              <th className="px-4 py-3 font-medium text-center">Aktiv</th>
              <th className="px-4 py-3 font-medium text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Lade Listen...</td>
              </tr>
            ) : lists.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Keine Listen gefunden.</td>
              </tr>
            ) : (
              lists.map((list) => (
                <tr key={list.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: list.color || '#0ea5e9' }}></div>
                      <div>
                        <span className="font-medium text-slate-800">{list.name}</span>
                        {list.description && <p className="text-xs text-slate-500 mt-0.5">{list.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-700 font-medium">
                      <Users size={14} className="text-slate-400" /> {list.subscriberCount || 0}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">{new Date(list.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${list.visible ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {list.visible ? 'Ja' : 'Nein'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${list.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {list.active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3 text-slate-400">
                      <button onClick={() => handleOpenModal(list)} className="hover:text-[#0ea5e9] transition-colors" title="Bearbeiten"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(list.id)} className="hover:text-red-500 transition-colors" title="Löschen"><Trash2 size={16} /></button>
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
            <h3 className="text-xl font-semibold text-slate-800 mb-6">
              {editingList.id ? 'Liste bearbeiten' : 'Neue Liste erstellen'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Listen Name</label>
                <input 
                  type="text" 
                  value={editingList.name || ''} 
                  onChange={(e) => setEditingList({...editingList, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Beschreibung</label>
                <textarea 
                  value={editingList.description || ''} 
                  onChange={(e) => setEditingList({...editingList, description: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9]"
                  rows={3}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Farbe</label>
                <input 
                  type="color" 
                  value={editingList.color || '#0ea5e9'} 
                  onChange={(e) => setEditingList({...editingList, color: e.target.value})}
                  className="w-16 h-8 p-0 border-0 cursor-pointer"
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editingList.visible || false} onChange={(e) => setEditingList({...editingList, visible: e.target.checked})} className="rounded text-[#0ea5e9] focus:ring-[#0ea5e9]" />
                  <span className="text-sm text-slate-700">Sichtbar für Nutzer</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editingList.active || false} onChange={(e) => setEditingList({...editingList, active: e.target.checked})} className="rounded text-[#0ea5e9] focus:ring-[#0ea5e9]" />
                  <span className="text-sm text-slate-700">Aktiv</span>
                </label>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-md transition-colors"
              >
                Abbrechen
              </button>
              <button 
                onClick={handleSave}
                disabled={!editingList.name}
                className="px-4 py-2 bg-[#0ea5e9] text-white rounded-md font-medium hover:bg-[#0284c7] transition-colors disabled:opacity-50"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </AcyLayout>
  );
};
