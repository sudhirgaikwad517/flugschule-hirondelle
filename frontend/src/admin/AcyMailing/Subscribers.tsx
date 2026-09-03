import { useState, useEffect, useRef } from 'react';
import { AcyLayout } from './AcyLayout';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, UserPlus, Download, Upload, CheckCircle, Edit, Trash2, X, XCircle } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  isConfirmed: boolean;
  subscribedAt: string;
  listType: string;
  language: string;
}

export const AcySubscribers = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterList, setFilterList] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [newSub, setNewSub] = useState({ email: '', name: '', listType: 'GENERAL' });
  const [mailingLists, setMailingLists] = useState<{ id: string; code: string; name: string; color: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscribers();
    fetchMailingLists();
  }, []);

  const fetchMailingLists = async () => {
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch('/api/newsletterlists', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setMailingLists(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch('/api/newsletters', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Möchten Sie diesen Abonnenten wirklich löschen?')) return;
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch(`/api/newsletters/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchSubscribers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch('/api/newsletters', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSub)
      });
      if (res.ok) {
        setIsCreateOpen(false);
        setNewSub({ email: '', name: '', listType: 'GENERAL' });
        fetchSubscribers();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditOpen = (sub: Subscriber) => {
    navigate(`/admin/acymailing/subscribers/edit/${encodeURIComponent(sub.email)}`);
  };

  const handleExportOne = (sub: any) => {
    const headers = ['Email', 'Name', 'Listen', 'Sprache', 'Aktiv', 'Bestätigt', 'Erstellungsdatum'];
    const row = [
      `"${sub.email}"`,
      `"${sub.name || ''}"`,
      `"${sub.lists ? sub.lists.join(';') : ''}"`,
      `"${sub.language || 'German'}"`,
      sub.isActive ? 'Ja' : 'Nein',
      sub.isConfirmed ? 'Ja' : 'Nein',
      `"${new Date(sub.subscribedAt).toISOString()}"`
    ];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + '\n' + row.join(',');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `abonnent_${sub.email}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { id: 'All', label: 'Alle', count: subscribers.length },
    { id: 'Active', label: 'Aktiv', count: subscribers.filter(s => s.isActive).length },
    { id: 'Inactive', label: 'Inaktiv', count: subscribers.filter(s => !s.isActive).length },
    { id: 'Confirmed', label: 'Bestätigt', count: subscribers.filter(s => s.isConfirmed).length },
    { id: 'NotConfirmed', label: 'Nicht bestätigt', count: subscribers.filter(s => !s.isConfirmed).length },
  ];

  // Group by email to avoid duplicates
  const groupedSubscribers = Object.values(subscribers.reduce((acc, sub) => {
    if (acc[sub.email]) {
      if (!acc[sub.email].lists) acc[sub.email].lists = [acc[sub.email].listType];
      if (!acc[sub.email].lists.includes(sub.listType)) acc[sub.email].lists.push(sub.listType);
    } else {
      acc[sub.email] = { ...sub, lists: [sub.listType] };
    }
    return acc;
  }, {} as Record<string, any>));

  const filteredSubscribers = groupedSubscribers.filter(s => {
    // Filter by tab
    let tabMatch = true;
    if (activeTab === 'Active') tabMatch = s.isActive;
    if (activeTab === 'Inactive') tabMatch = !s.isActive;
    if (activeTab === 'Confirmed') tabMatch = s.isConfirmed;
    if (activeTab === 'NotConfirmed') tabMatch = !s.isConfirmed;
    
    // Filter by search
    let searchMatch = true;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      searchMatch = s.email.toLowerCase().includes(q) || 
                    (s.name && s.name.toLowerCase().includes(q));
    }
    
    // Filter by list dropdown
    let listMatch = true;
    if (filterList) {
      listMatch = s.lists?.includes(filterList);
    }
    
    // Filter by date
    let dateMatch = true;
    if (filterDate) {
      const subDate = new Date(s.subscribedAt).toISOString().split('T')[0];
      dateMatch = subDate === filterDate;
    }

    return tabMatch && searchMatch && listMatch && dateMatch;
  }).sort((a, b) => {
    if (sortBy === 'email') return a.email.localeCompare(b.email);
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    if (sortBy === 'date') return new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime();
    if (sortBy === 'id') return a.id.localeCompare(b.id);
    return 0;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredSubscribers.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`${selectedIds.length} Abonnenten löschen?`)) return;
    
    try {
      const token = localStorage.getItem('auth');
      await Promise.all(selectedIds.map(id => 
        fetch(`/api/newsletters/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ));
      setSelectedIds([]);
      fetchSubscribers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Email', 'Name', 'Listen', 'Sprache', 'Aktiv', 'Bestätigt', 'Erstellungsdatum'];
    const csvRows = [headers.join(',')];

    filteredSubscribers.forEach(sub => {
      const row = [
        `"${sub.email}"`,
        `"${sub.name || ''}"`,
        `"${sub.lists ? sub.lists.join(';') : ''}"`,
        `"${sub.language || 'German'}"`,
        sub.isActive ? 'Ja' : 'Nein',
        sub.isConfirmed ? 'Ja' : 'Nein',
        `"${new Date(sub.subscribedAt).toISOString()}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "abonnenten_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n');
      
      const token = localStorage.getItem('auth');
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;
        
        // Basic CSV split
        const cols = row.split(',').map(c => c.replace(/^"|"$/g, '').trim());
        if (cols.length >= 1 && cols[0]) {
          const email = cols[0];
          const name = cols.length > 1 ? cols[1] : '';
          const listsStr = cols.length > 2 && cols[2] ? cols[2] : 'GENERAL';
          
          const lists = listsStr.split(';');
          
          for (const listType of lists) {
            try {
              await fetch('/api/newsletters', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ email, name, listType: listType || 'GENERAL' })
              });
            } catch (error) {
              console.error('Import error', error);
            }
          }
        }
      }
      
      fetchSubscribers();
      alert('Import abgeschlossen!');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleToggleStatus = async (email: string, field: 'isActive' | 'isConfirmed') => {
    try {
      const token = localStorage.getItem('auth');
      await fetch('/api/newsletters/toggle-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, field })
      });
      fetchSubscribers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleList = async (email: string, name: string, listType: string) => {
    try {
      const token = localStorage.getItem('auth');
      await fetch('/api/newsletters/toggle-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, name, listType })
      });
      fetchSubscribers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteOne = async (id: string) => {
    if (!window.confirm('Abonnenten wirklich löschen?')) return;
    try {
      const token = localStorage.getItem('auth');
      await fetch(`/api/newsletters/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchSubscribers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AcyLayout title="AcyMailing > Abonnenten">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-4 flex-1 min-w-[300px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suchen..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/20 focus:border-[#0ea5e9]"
            />
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-md transition-colors font-medium ${isFilterOpen ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]' : 'text-[#0ea5e9] border-[#0ea5e9] hover:bg-[#0ea5e9]/5'}`}
          >
            <Filter size={18} /> Filter {isFilterOpen ? 'ausblenden' : 'anzeigen'}
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button 
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 text-red-500 border border-red-200 bg-red-50 rounded-md hover:bg-red-100 transition-colors font-medium"
            >
              <Trash2 size={18} /> Gewählte löschen ({selectedIds.length})
            </button>
          )}
          <button 
            onClick={() => alert("Fake-Konten bereinigung wird gestartet... (Feature in Entwicklung)")}
            className="flex items-center gap-2 px-4 py-2 text-[#0ea5e9] border border-[#0ea5e9] rounded-md hover:bg-[#0ea5e9]/5 transition-colors font-medium"
          >
            <UserPlus size={18} /> Fake-Konten bereinigen
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 border border-slate-200 bg-white rounded-md hover:bg-slate-50 transition-colors font-medium"
          >
            <Download size={18} /> Exportieren
          </button>
          <input 
            type="file" 
            accept=".csv"
            ref={fileInputRef}
            onChange={handleImportCSV}
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-[#0ea5e9] border border-[#0ea5e9] rounded-md hover:bg-[#0ea5e9]/5 transition-colors font-medium"
          >
            <Upload size={18} /> Importieren
          </button>
          <button 
            onClick={() => {
              setNewSub({ email: '', name: '', listType: 'GENERAL' });
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-2 bg-[#0ea5e9] text-white rounded-md hover:bg-[#0284c7] transition-colors font-medium shadow-sm"
          >
            <UserPlus size={18} /> Erstellen
          </button>
        </div>
      </div>

      {/* Filter Options Area */}
      {isFilterOpen && (
        <div className="bg-slate-50 p-4 mb-6 rounded-lg border border-slate-200 flex gap-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Listen</label>
            <select 
              value={filterList}
              onChange={(e) => setFilterList(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-[#0ea5e9] bg-white text-sm"
            >
              <option value="">Alle Listen</option>
              {mailingLists.map(list => (
                <option key={list.id} value={list.code}>{list.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 max-w-xs">
            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Erstellungsdatum</label>
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-[#0ea5e9] bg-white text-sm" 
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => { setFilterList(''); setFilterDate(''); }}
              className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-md text-sm font-medium transition-colors"
            >
              Zurücksetzen
            </button>
          </div>
        </div>
      )}

      {/* Tabs and Sort */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-white text-[#334155] shadow-sm font-medium border border-slate-200' 
                  : 'text-slate-500 hover:bg-slate-200/50 bg-slate-50'
              }`}
            >
              {tab.label}
              <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full text-slate-500 font-normal">
                ({tab.count})
              </span>
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="font-medium">Sortieren nach:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border-none bg-transparent font-medium text-[#0ea5e9] focus:outline-none cursor-pointer"
          >
            <option value="date">Erstellungsdatum</option>
            <option value="email">E-Mail</option>
            <option value="name">Name</option>
            <option value="id">ID</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-[#263238] text-white">
              <tr>
                <th className="px-4 py-3 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={filteredSubscribers.length > 0 && selectedIds.length === filteredSubscribers.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-400 bg-transparent" 
                  />
                </th>
                <th className="px-4 py-3 font-medium">E-Mail</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Erstellungsdatum</th>
                <th className="px-4 py-3 font-medium">Sprache</th>
                <th className="px-4 py-3 font-medium">Listen</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium text-center">Aktion</th>
                <th className="px-4 py-3 font-medium text-right">ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">Abonnenten werden geladen...</td>
                </tr>
              ) : filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">Keine Abonnenten in dieser Kategorie gefunden.</td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(sub.id)}
                        onChange={() => handleSelectOne(sub.id)}
                        className="rounded border-slate-300 text-[#0ea5e9] focus:ring-[#0ea5e9]" 
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{sub.email}</td>
                    <td className="px-4 py-3">{sub.name || '-'}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(sub.subscribedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">{sub.language}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {mailingLists.map(list => {
                          const isSubscribed = sub.lists?.includes(list.code);
                          return (
                            <button
                              key={list.id}
                              onClick={() => handleToggleList(sub.email, sub.name || '', list.code)}
                              className="focus:outline-none"
                              title={list.name}
                            >
                              <div
                                className="w-4 h-4 rounded-full"
                                style={isSubscribed
                                  ? { backgroundColor: list.color }
                                  : { border: '2px solid #cbd5e1', backgroundColor: 'transparent' }}
                              ></div>
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleToggleStatus(sub.email, 'isActive')} className="focus:outline-none" title={sub.isActive ? "Aktiviert" : "Deaktiviert"}>
                          {sub.isActive ? <CheckCircle size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-red-500" />}
                        </button>
                        <button onClick={() => handleToggleStatus(sub.email, 'isConfirmed')} className="focus:outline-none" title={sub.isConfirmed ? "Bestätigt" : "Nicht bestätigt"}>
                          {sub.isConfirmed ? <CheckCircle size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-red-500" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-3 text-slate-400">
                        <button onClick={() => handleEditOpen(sub)} className="hover:text-[#0ea5e9] transition-colors" title="Bearbeiten"><Edit size={16} /></button>
                        <button onClick={() => handleExportOne(sub)} className="hover:text-emerald-500 transition-colors" title="Exportieren"><Download size={16} /></button>
                        <button onClick={() => handleDeleteOne(sub.id)} className="hover:text-red-500 transition-colors" title="Löschen"><Trash2 size={16} /></button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-400 font-mono">
                      {sub.id.substring(0, 8)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="font-semibold text-lg text-slate-800">Neuen Abonnenten hinzufügen</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail *</label>
                <input 
                  type="email" 
                  value={newSub.email}
                  onChange={(e) => setNewSub({...newSub, email: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input 
                  type="text" 
                  value={newSub.name}
                  onChange={(e) => setNewSub({...newSub, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Liste</label>
                <select 
                  value={newSub.listType}
                  onChange={(e) => setNewSub({...newSub, listType: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
                >
                  {mailingLists.map(list => (
                    <option key={list.id} value={list.code}>{list.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded font-medium transition-colors"
              >
                Abbrechen
              </button>
              <button 
                onClick={handleCreateOrUpdate}
                disabled={!newSub.email}
                className="px-4 py-2 bg-[#0ea5e9] text-white rounded hover:bg-[#0284c7] font-medium transition-colors disabled:opacity-50"
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
