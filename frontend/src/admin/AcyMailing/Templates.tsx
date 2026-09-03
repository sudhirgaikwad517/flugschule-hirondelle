import { useState, useRef, useEffect } from 'react';
import { AcyLayout } from './AcyLayout';
import EmailEditor from 'react-email-editor';
import { Save, Copy, Trash2, Plus, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Template {
  id: string;
  name: string;
  body: string; // JSON design or HTML
  createdAt: string;
}

export const AcyTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const emailEditorRef = useRef<any>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch('/api/newslettertemplates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openEditor = (template: Template | null = null) => {
    setEditingTemplate(template);
    setTemplateName(template ? template.name : 'Neue Vorlage');
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingTemplate(null);
    setTemplateName('');
  };

  const onLoad = () => {
    if (editingTemplate && editingTemplate.body) {
      try {
        const design = JSON.parse(editingTemplate.body);
        emailEditorRef.current?.editor?.loadDesign(design);
      } catch (e) {
        console.error('Failed to parse template design JSON', e);
      }
    }
  };

  const onReady = () => {
    // editor is ready
  };

  const saveDesign = () => {
    emailEditorRef.current?.editor?.exportHtml(async (data: { design: any; html: string }) => {
      const { design, html } = data;
      try {
        const token = localStorage.getItem('auth');
        const url = editingTemplate 
          ? `/api/newslettertemplates/${editingTemplate.id}`
          : '/api/newslettertemplates';
          
        const method = editingTemplate ? 'PUT' : 'POST';
        
        const res = await fetch(url, {
          method,
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: templateName,
            body: JSON.stringify(design), // Storing JSON design so it can be reloaded in this editor
          design: JSON.stringify(design) // Kept in sync so EditEmail's campaign editor can also load it
          })
        });

        if (res.ok) {
          fetchTemplates();
          closeEditor();
        }
      } catch (error) {
        console.error('Failed to save template', error);
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Vorlage wirklich löschen?')) return;
    try {
      const token = localStorage.getItem('auth');
      await fetch(`/api/newslettertemplates/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTemplates();
    } catch (error) {
      console.error(error);
    }
  };

  if (isEditorOpen) {
    return (
      <AcyLayout title={`AcyMailing > Vorlagen > ${editingTemplate ? 'Bearbeiten' : 'Neu'}`}>
        <div className="flex flex-col h-[800px] bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="flex justify-between items-center p-4 border-b border-slate-200">
            <input 
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="text-xl font-medium text-slate-800 focus:outline-none border-b border-transparent focus:border-[#0ea5e9] bg-transparent"
              placeholder="Vorlagenname"
            />
            <div className="flex gap-2">
              <button onClick={closeEditor} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded font-medium transition-colors">Abbrechen</button>
              <button onClick={saveDesign} className="px-4 py-2 flex items-center gap-2 bg-[#0ea5e9] text-white hover:bg-[#0284c7] rounded font-medium transition-colors">
                <Save size={18} /> Speichern
              </button>
            </div>
          </div>
          <div className="flex-1">
            <EmailEditor 
              ref={emailEditorRef} 
              onLoad={onLoad} 
              onReady={onReady} 
              style={{ minHeight: '100%' }}
              options={{ locale: 'de-DE' }}
            />
          </div>
        </div>
      </AcyLayout>
    );
  }

  return (
    <AcyLayout title="AcyMailing > Vorlagen">
      <div className="mb-6 flex justify-between items-center">
        <div></div>
        <button onClick={() => openEditor()} className="flex items-center gap-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-4 py-2 rounded-md font-medium transition-colors">
          <Plus size={18} /> Neue Vorlage
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-700">Name</th>
              <th className="px-4 py-3 font-medium text-center">Erstellt am</th>
              <th className="px-4 py-3 text-center font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-400">Lade Vorlagen...</td>
              </tr>
            ) : templates.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-400">Keine Vorlagen gefunden.</td>
              </tr>
            ) : (
              templates.map(template => (
                <tr key={template.id} className="border-b border-slate-100 hover:bg-slate-50 group">
                  <td className="px-4 py-3 font-medium text-slate-800">{template.name}</td>
                  <td className="px-4 py-3 text-center">{new Date(template.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-3 text-slate-400">
                      <button onClick={() => openEditor(template)} className="hover:text-[#0ea5e9] transition-colors" title="Bearbeiten"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(template.id)} className="hover:text-red-500 transition-colors" title="Löschen"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AcyLayout>
  );
};
