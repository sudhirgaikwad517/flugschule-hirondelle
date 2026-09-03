import React, { useState, useEffect, useRef } from 'react';
import { AcyLayout } from './AcyLayout';
import { ChevronRight, Save, Eye, Send, RotateCw, BookOpen, AlertCircle } from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

declare global {
  interface Window {
    unlayer: any;
  }
}

export const AcyEditEmail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = !id;
  
  const queryParams = new URLSearchParams(location.search);
  const templateId = queryParams.get('template');

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    fromName: 'Flugschule Hirondelle',
    fromEmail: 'info@fs-hirondelle.de',
    replyToName: 'Flugschule Hirondelle',
    replyToEmail: 'info@fs-hirondelle.de',
    previewLine: '',
    body: '<p>Geben Sie hier Ihren E-Mail-Inhalt ein...</p>',
    design: '',
    targetList: '',
    status: 'DRAFT',
    sentAt: '',
    keywords: '',
    visible: true,
    attachments: '[]',
    bcc: '',
    bounceEmail: '',
    trackingEnabled: true
  });

  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const [templates, setTemplates] = useState<any[]>([]);
  const [activeStep, setActiveStep] = useState(isNew && !templateId ? 'select_template' : 'edit_email');
  const [testEmails, setTestEmails] = useState<string[]>([]);
  const [testEmailInput, setTestEmailInput] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.email) setTestEmails([user.email]);
      }
    } catch (e) {}
  }, []);

  const addTestEmail = () => {
    const email = testEmailInput.trim();
    if (email && !testEmails.includes(email)) {
      setTestEmails(prev => [...prev, email]);
    }
    setTestEmailInput('');
  };
  const removeTestEmail = (email: string) => {
    setTestEmails(prev => prev.filter(e => e !== email));
  };
  const [loading, setLoading] = useState(!isNew || !!templateId);

  useEffect(() => {
    if (isNew && !templateId) {
      const fetchTemplatesList = async () => {
        try {
          const token = localStorage.getItem('auth');
          const res = await fetch('/api/newslettertemplates', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setTemplates(data);
          }
        } catch (e) {}
      };
      fetchTemplatesList();
    }
  }, [isNew, templateId]);

  const [saving, setSaving] = useState(false);
  const [sendMode, setSendMode] = useState<'jetzt' | 'geplant'>('jetzt');
  const editorInitialized = useRef(false);
  const [showDynamicTextModal, setShowDynamicTextModal] = useState(false);
  const [dynamicTextTab, setDynamicTextTab] = useState('subscription');
  const [wrapTextInputs, setWrapTextInputs] = useState<Record<string, string>>({});
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const lastFocusedField = useRef<'subject' | 'previewLine'>('subject');
  const subjectRef = useRef<HTMLInputElement>(null);
  const previewLineRef = useRef<HTMLInputElement>(null);

  const pad = (n: number) => String(n).padStart(2, '0');
  const monthNamesDe = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const dayNamesDe = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const previewDate = (code: string) => {
    const now = new Date();
    const map: Record<string, string> = {
      d: pad(now.getDate()), m: pad(now.getMonth() + 1), Y: String(now.getFullYear()),
      H: pad(now.getHours()), i: pad(now.getMinutes()), l: dayNamesDe[now.getDay()],
      F: monthNamesDe[now.getMonth()], W: String(Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7))
    };
    return code.replace(/[dmYHilFW]/g, (t) => map[t] ?? t);
  };

  const dynamicTextTabs: { key: string; label: string; items: { key: string; label: string; sub?: string; tag?: string; wrap?: boolean; tagName?: string; defaultText?: string; preview?: string }[] }[] = [
    {
      key: 'subscription', label: 'Abonnement', items: [
        { key: 'unsub', label: 'Abmelde-/Abo-ändern-Link', wrap: true, tagName: 'unsubscribe', defaultText: 'Abmelden' },
        { key: 'unsuball', label: 'Link zum Abmelden von allen Listen', wrap: true, tagName: 'unsubscribeall', defaultText: 'Von allen Listen abmelden' },
        { key: 'stoptracking', label: '„Tracking stoppen"-Link', wrap: true, tagName: 'stoptracking', defaultText: 'Tracking stoppen' },
      ]
    },
    {
      key: 'subscriber', label: 'Abonnent', items: [
        { key: 'first', label: 'Erster Teil des Namens', sub: 'z.B. „Max" bei „Max Mustermann"', tag: '{subtag:name|part:first|ucfirst}' },
        { key: 'last', label: 'Letzter Teil des Namens', sub: 'z.B. „Mustermann" bei „Max Mustermann"', tag: '{subtag:name|part:last|ucfirst}' },
        { key: 'id', label: 'ID', sub: 'Abonnenten-ID', tag: '{subtag:id}' },
        { key: 'name', label: 'Name', sub: 'Vollständiger Name des Abonnenten', tag: '{subtag:name}' },
        { key: 'email', label: 'E-Mail', sub: 'E-Mail-Adresse des Abonnenten', tag: '{subtag:email}' },
        { key: 'creation_date', label: 'Erstellungsdatum', sub: 'Anmeldedatum des Abonnenten', tag: '{subtag:creation_date}' },
        { key: 'active', label: 'Aktiv-Status', sub: 'Aktiv-Status des Abonnenten', tag: '{subtag:active}' },
        { key: 'confirmed', label: 'Bestätigt-Status', sub: 'Bestätigungsstatus des Abonnenten', tag: '{subtag:confirmed}' },
        { key: 'language', label: 'Sprache', sub: 'Sprache des Abonnenten', tag: '{subtag:language}' },
      ]
    },
    {
      key: 'website', label: 'Webseite', items: [
        { key: 'viewonline', label: '„Online ansehen"-Link', wrap: true, tagName: 'viewonline', defaultText: 'Online ansehen' },
        { key: 'sitename', label: 'Seitenname', sub: 'Flugschule Hirondelle', tag: '{sitename}' },
        { key: 'siteurl', label: 'Website-URL', sub: 'https://www.fs-hirondelle.de', tag: '{siteurl}' },
      ]
    },
    {
      key: 'time', label: 'Zeit', items: [
        { key: 't1', label: 'd.MY', tag: '{date:d.MY}', preview: previewDate('d.MY') },
        { key: 't2', label: 'd.MYH:i', tag: '{date:d.MYH:i}', preview: previewDate('d.MYH:i') },
        { key: 't3', label: 'dmY', tag: '{date:dmY}', preview: previewDate('dmY') },
        { key: 't4', label: 'm/d/Y', tag: '{date:m/d/Y}', preview: previewDate('m/d/Y') },
        { key: 't5', label: 'd/m/Y', tag: '{date:d/m/Y}', preview: previewDate('d/m/Y') },
        { key: 't6', label: 'l', sub: 'Wochentag', tag: '{date:l}', preview: previewDate('l') },
        { key: 't7', label: 'W', sub: 'Kalenderwoche', tag: '{date:W}', preview: previewDate('W') },
        { key: 't8', label: 'F', sub: 'Monat', tag: '{date:F}', preview: previewDate('F') },
        { key: 't9', label: 'Y', sub: 'Jahr', tag: '{date:Y}', preview: previewDate('Y') },
      ]
    }
  ];

  const insertDynamicText = (tag: string) => {
    const field = lastFocusedField.current;
    const inputEl = field === 'subject' ? subjectRef.current : previewLineRef.current;
    const currentValue = formData[field] || '';
    const cursorPos = inputEl?.selectionStart ?? currentValue.length;
    const newValue = currentValue.slice(0, cursorPos) + tag + currentValue.slice(cursorPos);
    handleChange(field, newValue);
    setShowDynamicTextModal(false);
  };

  const insertWrapTag = (item: { key: string; tagName?: string; defaultText?: string }) => {
    if (!item.tagName) return;
    const text = wrapTextInputs[item.key] ?? item.defaultText ?? '';
    insertDynamicText(`{${item.tagName}}${text}{/${item.tagName}}`);
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAttachment(true);
    try {
      const token = localStorage.getItem('auth');
      const uploadData = new FormData();
      uploadData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: uploadData
      });
      const data = await res.json();
      if (res.ok) {
        const current = JSON.parse(formData.attachments || '[]');
        current.push({ name: file.name, url: data.url });
        handleChange('attachments', JSON.stringify(current));
      } else {
        alert(data.message || 'Fehler beim Hochladen des Anhangs');
      }
    } catch (error) {
      console.error('Attachment upload failed', error);
    } finally {
      setUploadingAttachment(false);
      e.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    const current = JSON.parse(formData.attachments || '[]');
    current.splice(index, 1);
    handleChange('attachments', JSON.stringify(current));
  };

  interface MailingList {
    id: string;
    code: string;
    name: string;
    color: string;
    subscriberCount: number;
  }
  const [availableLists, setAvailableLists] = useState<MailingList[]>([]);
  const [availableSearch, setAvailableSearch] = useState('');
  const [selectedSearch, setSelectedSearch] = useState('');
  const [recipientCount, setRecipientCount] = useState(0);
  const [addSegmentStep, setAddSegmentStep] = useState(false);

  const selectedCodes = formData.targetList ? formData.targetList.split(',').filter(Boolean) : [];

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const token = localStorage.getItem('auth');
        const res = await fetch('/api/newsletterlists', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setAvailableLists(await res.json());
      } catch (e) {}
    };
    fetchLists();
  }, []);

  useEffect(() => {
    if (selectedCodes.length === 0) {
      setRecipientCount(0);
      return;
    }
    const fetchCount = async () => {
      try {
        const token = localStorage.getItem('auth');
        const res = await fetch(`/api/newsletterlists/recipient-count?codes=${selectedCodes.join(',')}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setRecipientCount((await res.json()).count);
      } catch (e) {}
    };
    fetchCount();
  }, [formData.targetList]);

  const addToSelectedLists = (code: string) => {
    if (!selectedCodes.includes(code)) handleChange('targetList', [...selectedCodes, code].join(','));
  };
  const removeFromSelectedLists = (code: string) => {
    handleChange('targetList', selectedCodes.filter(c => c !== code).join(','));
  };
  const selectAllLists = () => handleChange('targetList', availableLists.map(l => l.code).join(','));
  const clearSelectedLists = () => handleChange('targetList', '');

  useEffect(() => {
    if (!isNew) {
      fetchCampaign();
    } else if (templateId) {
      fetchTemplate(templateId);
    }
  }, [id, templateId]);

  useEffect(() => {
    if (activeStep === 'edit_email' && !editorInitialized.current && !loading) {
      editorInitialized.current = true;
      const loadScript = () => {
        if (window.unlayer) {
          initEditor();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://editor.unlayer.com/embed.js';
        script.async = true;
        script.onload = initEditor;
        document.body.appendChild(script);
      };
      
      const initEditor = () => {
        const container = document.getElementById('editor-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        window.unlayer.init({
          id: 'editor-container',
          displayMode: 'email',
          features: {
            textEditor: { spellChecker: true }
          }
        });
        
        window.unlayer.addEventListener('editor:ready', () => {
          const design = formDataRef.current.design;
          if (design) {
             try {
                window.unlayer.loadDesign(JSON.parse(design));
             } catch(e) {
                console.error("Could not load design", e);
             }
          }
        });
      };
      
      loadScript();
    }
  }, [activeStep, loading]);

  const fetchCampaign = async () => {
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch(`/api/newslettercampaigns/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || data.subject,
          subject: data.subject,
          fromName: data.fromName || '',
          fromEmail: data.fromEmail || '',
          replyToName: data.replyToName || '',
          replyToEmail: data.replyToEmail || '',
          previewLine: data.previewLine || '',
          body: data.body,
          design: data.design || '',
          targetList: data.targetList,
          status: data.status,
          sentAt: data.sentAt ? new Date(data.sentAt).toISOString().slice(0, 16) : '',
          keywords: data.keywords || '',
          visible: data.visible ?? true,
          attachments: data.attachments || '[]',
          bcc: data.bcc || '',
          bounceEmail: data.bounceEmail || '',
          trackingEnabled: data.trackingEnabled ?? true
        });
        setSendMode(data.sentAt && data.status !== 'SENT' ? 'geplant' : 'jetzt');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplate = async (tId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth');
      const res = await fetch(`/api/newslettertemplates/${tId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          body: data.body,
          design: data.design || '',
          name: data.name
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveExecute = async (dataToSave: any, statusToSave: string, navigateAway: boolean) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('auth');
      const url = isNew 
        ? '/api/newslettercampaigns' 
        : `/api/newslettercampaigns/${id}`;
        
      const payload = {
        ...dataToSave,
        status: statusToSave,
        sentAt: dataToSave.sentAt ? new Date(dataToSave.sentAt).toISOString() : null
      };
        
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const savedData = await res.json();
        if (navigateAway) {
          navigate('/admin/acymailing/emails');
        } else if (isNew) {
          navigate(`/admin/acymailing/emails/edit/${savedData.id}`);
        }
      }
    } catch (error) {
      console.error('Failed to save', error);
      alert('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = (statusToSave = formData.status, navigateAway = false, nextStep?: string) => {
    if (activeStep === 'edit_email' && window.unlayer) {
      window.unlayer.exportHtml((data: any) => {
        const { design, html } = data;
        const updatedData = { ...formData, body: html, design: JSON.stringify(design) };
        setFormData(updatedData);
        if (nextStep) setActiveStep(nextStep);
        handleSaveExecute(updatedData, statusToSave, navigateAway);
      });
    } else {
      if (nextStep) setActiveStep(nextStep);
      handleSaveExecute(formData, statusToSave, navigateAway);
    }
  };

  const handleSendTestEmail = async () => {
    if (isNew) {
      alert("Bitte speichern Sie die Kampagne zuerst als Entwurf, bevor Sie testen.");
      return;
    }
    if (testEmails.length === 0) {
      alert("Bitte geben Sie mindestens eine Test-E-Mail-Adresse ein.");
      return;
    }

    setSendingTestEmail(true);
    try {
      const token = localStorage.getItem('auth');
      const res = await fetch(`/api/newslettercampaigns/${id}/test-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetEmails: testEmails, message: testMessage })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isTestMode && data.previewUrls?.length > 0) {
          alert(
            'Test-E-Mail wurde verarbeitet, aber es ist noch kein echter Mailserver konfiguriert ' +
            '(AcyMailing > Konfiguration). Vorschau ansehen:\n\n' + data.previewUrls.join('\n')
          );
        } else {
          alert('Test-E-Mail erfolgreich gesendet!');
        }
      } else {
        alert('Fehler beim Senden der Test-E-Mail.');
      }
    } catch (error) {
      console.error('Test email failed', error);
    } finally {
      setSendingTestEmail(false);
    }
  };

  const steps = [
    { id: 'select_template', label: 'Vorlage auswählen', passed: true },
    { id: 'edit_email', label: 'E-Mail bearbeiten', passed: ['recipient', 'broadcast_settings', 'tests', 'summary'].includes(activeStep) },
    { id: 'recipient', label: 'Empfänger', passed: ['broadcast_settings', 'tests', 'summary'].includes(activeStep) },
    { id: 'broadcast_settings', label: 'Sendeeinstellungen', passed: ['tests', 'summary'].includes(activeStep) },
    { id: 'tests', label: 'Tests', passed: activeStep === 'summary' },
    { id: 'summary', label: 'Zusammenfassung', passed: false }
  ];

  if (loading) return <AcyLayout title="Laden..."><div className="p-8 text-slate-500 flex justify-center items-center h-64">Loading...</div></AcyLayout>;

  return (
    <AcyLayout title={isNew ? 'Neuer Newsletter' : (formData.subject || 'Newsletter bearbeiten')}>

      <div className="bg-white min-h-[800px] flex flex-col p-6">

        {/* Breadcrumb Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
          <div className="text-xl font-medium text-slate-800 flex items-center gap-2">
            <span className="text-[#0ea5e9]">M</span>
            <span className="text-slate-700 cursor-pointer" onClick={() => navigate('/admin/acymailing/dashboard')}>AcyMailing</span>
            <ChevronRight className="inline" size={16} />
            <span className="text-slate-700 cursor-pointer" onClick={() => navigate('/admin/acymailing/emails')}>E-Mails</span>
            <ChevronRight className="inline" size={16} />
            <span className="text-slate-900">{isNew ? 'Neuer Newsletter' : (formData.subject || 'Newsletter bearbeiten')}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span className="text-sm font-medium">AcyMailing Starter<span className="text-emerald-500 ml-1">11.0.4</span></span>
            <RotateCw size={18} className="cursor-pointer hover:text-slate-800" />
            <BookOpen size={18} className="cursor-pointer hover:text-slate-800" />
            <div className="text-red-400 bg-red-50 p-1 rounded-full cursor-pointer hover:bg-red-100">
              <AlertCircle size={18} />
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-3 ml-auto">
            <button onClick={() => handleSave(formData.status, false)} disabled={saving} className="px-4 py-2 border border-slate-300 text-slate-700 bg-white rounded font-medium hover:bg-slate-50 flex items-center gap-2">
              <Save size={18} /> Speichern
            </button>
            <button onClick={() => handleSave(formData.status, true)} disabled={saving} className="px-4 py-2 bg-[#0ea5e9] text-white rounded font-medium hover:bg-[#0284c7] shadow-sm flex items-center gap-2">
              Speichern & Schließen
            </button>
          </div>
        </div>

        {/* Wizard Progress Bar EXACTLY like screenshot */}
        <div className="flex items-center justify-between mb-8 overflow-hidden rounded border border-slate-200">
          {steps.map((step, index) => {
            const isActive = activeStep === step.id;
            const isPassed = step.passed || isActive;
            
            let bgClass = "bg-white text-slate-300";
            if (isActive) bgClass = "bg-[#e0f2fe] text-[#0ea5e9]";
            else if (isPassed) bgClass = "bg-[#e0f2fe] text-slate-700 cursor-pointer hover:text-[#0ea5e9]";
            
            return (
              <React.Fragment key={step.id}>
                <div 
                  className={`flex-1 py-3 text-center text-sm font-medium flex items-center justify-center transition-colors ${bgClass}`}
                  onClick={() => { if(isPassed) handleSave(formData.status, false, step.id); }}
                >
                  {step.label}
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className={`${isActive || isPassed ? 'text-white' : 'text-slate-300'} -ml-3 z-10`} size={32} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Form Body */}
        <div className="flex-1 bg-slate-50 p-8">
          
          {/* STEP: Select Template */}
          {activeStep === 'select_template' && (
            <div className="max-w-4xl mx-auto space-y-6 bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <h3 className="text-xl font-medium text-slate-800 border-b pb-2 mb-6">Wählen Sie eine Vorlage (Template)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Empty/Blank template option */}
                <div 
                  onClick={() => setActiveStep('edit_email')}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 hover:border-[#0ea5e9] hover:text-[#0ea5e9] hover:bg-sky-50 transition-colors cursor-pointer h-64"
                >
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-white">
                    <span className="text-2xl">+</span>
                  </div>
                  <span className="font-medium">Leere E-Mail</span>
                  <span className="text-xs text-center mt-2">Ganz von vorne anfangen</span>
                </div>

                {/* Database templates */}
                {templates.map(tpl => (
                  <div 
                    key={tpl.id}
                    onClick={async () => {
                      await fetchTemplate(tpl.id);
                      setActiveStep('edit_email');
                    }}
                    className="border border-slate-200 rounded-xl overflow-hidden hover:border-[#0ea5e9] hover:shadow-md transition-all cursor-pointer h-64 flex flex-col group relative"
                  >
                    <div className="flex-1 bg-slate-100 p-4 flex items-center justify-center overflow-hidden relative">
                       <div className="w-full h-full bg-white shadow-sm border border-slate-200 rounded p-2 flex flex-col gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                         <div className="w-full h-4 bg-sky-100 rounded"></div>
                         <div className="w-3/4 h-3 bg-slate-100 rounded"></div>
                         <div className="w-full flex-1 bg-slate-50 rounded mt-2 flex items-center justify-center text-slate-300"><BookOpen size={32} /></div>
                       </div>
                    </div>
                    <div className="p-4 bg-white border-t border-slate-100">
                      <h4 className="font-medium text-slate-800 truncate">{tpl.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">Vorlagen-Design</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP: Edit email */}
          <div className={activeStep === 'edit_email' ? 'block' : 'hidden'}>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 mb-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Newsletter-Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Interner Name (nur für Sie sichtbar)"
                      className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Schlagwörter</label>
                    <input
                      type="text"
                      value={formData.keywords}
                      onChange={(e) => handleChange('keywords', e.target.value)}
                      placeholder="Schlagwörter hinzufügen (kommagetrennt)"
                      className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail Betreff <span className="text-red-500">*</span></label>
                    <input
                      ref={subjectRef}
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      onFocus={() => { lastFocusedField.current = 'subject'; }}
                      className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9] font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vorschautext (Preheader)</label>
                    <input
                      ref={previewLineRef}
                      type="text"
                      value={formData.previewLine}
                      onChange={(e) => handleChange('previewLine', e.target.value)}
                      onFocus={() => { lastFocusedField.current = 'previewLine'; }}
                      className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowDynamicTextModal(true)}
                    className="px-4 py-2 border border-[#0ea5e9] text-[#0ea5e9] rounded font-medium hover:bg-sky-50 transition-colors text-sm"
                  >
                    Dynamischen Text einfügen
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">Sichtbar</label>
                  <span className="text-slate-400 text-xs border border-slate-300 rounded-full w-4 h-4 flex items-center justify-center" title="Wenn deaktiviert, erscheint dieser Newsletter nicht in der öffentlichen Liste.">i</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.visible}
                    onClick={() => handleChange('visible', !formData.visible)}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 9999,
                      position: 'relative',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: formData.visible ? '#1e293b' : '#cbd5e1',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 2,
                        left: formData.visible ? 22 : 2,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        transition: 'left 0.2s ease'
                      }}
                    />
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Anhänge</label>
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50 cursor-pointer text-sm">
                      {uploadingAttachment ? 'Wird hochgeladen...' : 'Datei auswählen'}
                      <input type="file" className="hidden" onChange={handleAttachmentUpload} disabled={uploadingAttachment} />
                    </label>
                    <span className="text-xs text-slate-500">Datei anhängen (maximale Gesamtgröße: 50MB)</span>
                  </div>
                  {JSON.parse(formData.attachments || '[]').length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {JSON.parse(formData.attachments || '[]').map((att: { name: string; url: string }, idx: number) => (
                        <li key={idx} className="flex items-center justify-between text-sm bg-slate-50 px-3 py-2 rounded border border-slate-200">
                          <a href={att.url} target="_blank" rel="noreferrer" className="text-[#0ea5e9] hover:underline truncate">{att.name}</a>
                          <button type="button" onClick={() => removeAttachment(idx)} className="text-red-400 hover:text-red-600 ml-3">Entfernen</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

              </div>

              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div id="editor-container" style={{ height: '600px', width: '100%' }}></div>
              </div>

              <div className="flex justify-end pt-4">
                <button onClick={() => handleSave(formData.status, false, 'recipient')} className="px-6 py-2 bg-[#0ea5e9] text-white rounded font-medium hover:bg-[#0284c7] flex items-center gap-2">
                  Weiter <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {showDynamicTextModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowDynamicTextModal(false)}>
              <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b border-slate-100">
                  <h3 className="text-lg font-medium text-slate-800">Dynamischen Text einfügen</h3>
                  <button onClick={() => setShowDynamicTextModal(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
                </div>

                <div className="flex border-b border-slate-200 bg-slate-50">
                  {dynamicTextTabs.map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setDynamicTextTab(tab.key)}
                      className={`px-4 py-2.5 text-sm font-medium transition-colors ${dynamicTextTab === tab.key ? 'text-[#0ea5e9] border-b-2 border-[#0ea5e9] bg-white' : 'text-slate-600 hover:text-slate-800'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="overflow-y-auto p-2 flex-1">
                  {dynamicTextTabs.find(t => t.key === dynamicTextTab)?.items.map(item => (
                    <div key={item.key} className="px-3 py-2.5 border-b border-slate-100 last:border-0">
                      {item.wrap ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="font-medium text-slate-800 text-sm">{item.label}</div>
                            <input
                              type="text"
                              value={wrapTextInputs[item.key] ?? item.defaultText ?? ''}
                              onChange={(e) => setWrapTextInputs(prev => ({ ...prev, [item.key]: e.target.value }))}
                              className="mt-1 w-full px-2 py-1 text-sm border border-slate-300 rounded"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => insertWrapTag(item)}
                            className="px-3 py-1.5 bg-[#0ea5e9] text-white rounded text-sm font-medium hover:bg-[#0284c7] whitespace-nowrap"
                          >
                            Einfügen
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => item.tag && insertDynamicText(item.tag)}
                          className="w-full text-left flex items-center justify-between hover:text-[#0ea5e9] group"
                        >
                          <div>
                            <div className="font-medium text-slate-800 text-sm group-hover:text-[#0ea5e9]">{item.label}</div>
                            {item.sub && <div className="text-xs text-slate-500 mt-0.5">{item.sub}</div>}
                          </div>
                          {item.preview && <span className="text-xs text-slate-400 font-mono">{item.preview}</span>}
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end p-4 border-t border-slate-100">
                  <button onClick={() => setShowDynamicTextModal(false)} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded font-medium transition-colors">
                    Schließen
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP: Recipient */}
          {activeStep === 'recipient' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                <div className="grid grid-cols-2 gap-6">
                  {/* Available lists */}
                  <div>
                    <h4 className="text-center font-medium text-slate-800 mb-3">Verfügbare Listen</h4>
                    <input
                      type="text"
                      value={availableSearch}
                      onChange={(e) => setAvailableSearch(e.target.value)}
                      placeholder="Suchen..."
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm mb-2"
                    />
                    <button onClick={selectAllLists} className="text-[#0ea5e9] text-sm hover:underline mb-2 float-right">Alle auswählen +</button>
                    <div className="clear-both"></div>
                    <div className="border border-slate-200 rounded overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="text-left px-3 py-2 font-medium text-slate-600"></th>
                            <th className="text-left px-3 py-2 font-medium text-slate-600">Name</th>
                            <th className="text-right px-3 py-2 font-medium text-slate-600">Abonnenten</th>
                            <th className="w-8"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {availableLists
                            .filter(l => !selectedCodes.includes(l.code))
                            .filter(l => l.name.toLowerCase().includes(availableSearch.toLowerCase()))
                            .map(l => (
                              <tr key={l.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => addToSelectedLists(l.code)}>
                                <td className="px-3 py-2"><span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: l.color }}></span></td>
                                <td className="px-3 py-2 text-slate-700">{l.name}</td>
                                <td className="px-3 py-2 text-right text-slate-500">{l.subscriberCount}</td>
                                <td className="px-3 py-2 text-[#0ea5e9] font-bold text-center">+</td>
                              </tr>
                            ))}
                          {availableLists.length === 0 && (
                            <tr><td colSpan={4} className="px-3 py-6 text-center text-slate-400">Keine Listen verfügbar.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Selected lists */}
                  <div>
                    <h4 className="text-center font-medium text-slate-800 mb-3">Ausgewählte Listen</h4>
                    <input
                      type="text"
                      value={selectedSearch}
                      onChange={(e) => setSelectedSearch(e.target.value)}
                      placeholder="Suchen..."
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm mb-2"
                    />
                    <button onClick={clearSelectedLists} className="text-[#0ea5e9] text-sm hover:underline mb-2 float-right">Auswahl aufheben -</button>
                    <div className="clear-both"></div>
                    <div className="border border-slate-200 rounded overflow-hidden min-h-[200px]">
                      {selectedCodes.length === 0 ? (
                        <div className="flex items-center justify-center h-[200px] text-sm text-slate-400 text-center px-6">
                          Bitte klicken Sie links auf einen Eintrag, um ihn auszuwählen.
                        </div>
                      ) : (
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="text-left px-3 py-2 font-medium text-slate-600"></th>
                              <th className="text-left px-3 py-2 font-medium text-slate-600">Name</th>
                              <th className="text-right px-3 py-2 font-medium text-slate-600">Abonnenten</th>
                              <th className="w-8"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {availableLists
                              .filter(l => selectedCodes.includes(l.code))
                              .filter(l => l.name.toLowerCase().includes(selectedSearch.toLowerCase()))
                              .map(l => (
                                <tr key={l.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => removeFromSelectedLists(l.code)}>
                                  <td className="px-3 py-2"><span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: l.color }}></span></td>
                                  <td className="px-3 py-2 text-slate-700">{l.name}</td>
                                  <td className="px-3 py-2 text-right text-slate-500">{l.subscriberCount}</td>
                                  <td className="px-3 py-2 text-red-400 font-bold text-center">&times;</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 flex items-center justify-between flex-wrap gap-4">
                <p className="text-slate-700">
                  Der Newsletter wird an <strong>{recipientCount}</strong> Empfänger gesendet.
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600">Einen Segmentierungsschritt zum Sendevorgang hinzufügen</span>
                  <label className="flex items-center gap-1 text-sm cursor-pointer">
                    <input type="radio" checked={addSegmentStep} onChange={() => setAddSegmentStep(true)} /> Ja
                  </label>
                  <label className="flex items-center gap-1 text-sm cursor-pointer">
                    <input type="radio" checked={!addSegmentStep} onChange={() => setAddSegmentStep(false)} /> Nein
                  </label>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setActiveStep('edit_email')} className="px-6 py-2 border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50 flex items-center gap-2">
                  Zurück zur Liste
                </button>
                <div className="flex gap-3">
                  <button onClick={() => handleSave(formData.status, true)} className="px-6 py-2 border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50">
                    Speichern & Beenden
                  </button>
                  <button onClick={() => handleSave(formData.status, false, 'broadcast_settings')} className="px-6 py-2 bg-[#0ea5e9] text-white rounded font-medium hover:bg-[#0284c7] flex items-center gap-2">
                    Speichern & Weiter <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP: Broadcast settings */}
          {activeStep === 'broadcast_settings' && (
            <div className="max-w-3xl mx-auto space-y-6 bg-white p-6 rounded-lg shadow-sm border border-slate-100">
              <h3 className="text-xl font-medium text-slate-800 border-b pb-2">Absenderinformationen</h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Von Name</label>
                  <input type="text" value={formData.fromName} onChange={(e) => handleChange('fromName', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Von E-Mail</label>
                  <input type="email" value={formData.fromEmail} onChange={(e) => handleChange('fromEmail', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Antwort-an Name</label>
                  <input type="text" value={formData.replyToName} onChange={(e) => handleChange('replyToName', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Antwort-an E-Mail</label>
                  <input type="email" value={formData.replyToEmail} onChange={(e) => handleChange('replyToEmail', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                    BCC
                    <span className="text-slate-400 text-xs border border-slate-300 rounded-full w-4 h-4 flex items-center justify-center" title="Erhält eine einzelne Kopie dieser Kampagne zur Archivierung.">i</span>
                  </label>
                  <input type="email" placeholder="test@beispiel.de" value={formData.bcc} onChange={(e) => handleChange('bcc', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                    Bounce-E-Mail-Adresse
                    <span className="text-slate-400 text-xs border border-slate-300 rounded-full w-4 h-4 flex items-center justify-center" title="Standardmäßig wird die Von-E-Mail-Adresse verwendet.">i</span>
                  </label>
                  <input type="email" placeholder="Standardwert" value={formData.bounceEmail} onChange={(e) => handleChange('bounceEmail', e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                  Wann soll Ihre E-Mail gesendet werden?
                  <span className="text-slate-400 text-xs border border-slate-300 rounded-full w-4 h-4 flex items-center justify-center" title="Legen Sie fest, ob die Kampagne sofort oder zu einem geplanten Zeitpunkt gesendet wird.">i</span>
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => { setSendMode('jetzt'); handleChange('sentAt', ''); }}
                    className={`py-2.5 rounded font-medium border-2 transition-colors ${sendMode === 'jetzt' ? 'border-[#0ea5e9] text-[#0ea5e9] bg-sky-50' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  >
                    Jetzt
                  </button>
                  <button
                    type="button"
                    onClick={() => setSendMode('geplant')}
                    className={`py-2.5 rounded font-medium border-2 transition-colors ${sendMode === 'geplant' ? 'border-[#0ea5e9] text-[#0ea5e9] bg-sky-50' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  >
                    Geplant
                  </button>
                  <button
                    type="button"
                    disabled
                    title="Nur in der Pro-Version verfügbar"
                    className="py-2.5 rounded font-medium border-2 border-slate-100 text-slate-300 cursor-not-allowed"
                  >
                    Automatisch
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-medium text-slate-800 border-b pb-2">Zusätzliche Einstellungen</h3>

              {sendMode === 'geplant' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Geplanter Sendezeitpunkt</label>
                  <input
                    type="datetime-local"
                    value={formData.sentAt}
                    onChange={(e) => handleChange('sentAt', e.target.value)}
                    className="w-full max-w-md px-4 py-2 border border-slate-300 rounded focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
                  />
                  <p className="text-xs text-slate-500 mt-2">Ihr Newsletter wird zum geplanten Zeitpunkt automatisch versendet.</p>
                </div>
              ) : (
                <p className="text-sm text-slate-600">Ihr Newsletter wird versendet, sobald Sie diesen bestätigen.</p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Diesen Newsletter tracken</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.trackingEnabled}
                  onClick={() => handleChange('trackingEnabled', !formData.trackingEnabled)}
                  style={{
                    width: 44, height: 24, borderRadius: 9999, position: 'relative', border: 'none', cursor: 'pointer',
                    backgroundColor: formData.trackingEnabled ? '#1e293b' : '#cbd5e1', transition: 'background-color 0.2s ease'
                  }}
                >
                  <span style={{ position: 'absolute', top: 2, left: formData.trackingEnabled ? 22 : 2, width: 20, height: 20, borderRadius: '50%', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', transition: 'left 0.2s ease' }} />
                </button>
              </div>
              <p className="text-xs text-slate-500 -mt-4">Öffnungen und Klicks in diesem Newsletter erfassen.</p>

              <div className="flex justify-between pt-6 mt-6 border-t border-slate-100">
                <button onClick={() => setActiveStep('recipient')} className="px-6 py-2 border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50">
                  Zurück zur Liste
                </button>
                <div className="flex gap-3">
                  <button onClick={() => handleSave(formData.status, true)} className="px-6 py-2 border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50">
                    Speichern & Beenden
                  </button>
                  <button onClick={() => handleSave(formData.status, false, 'tests')} className="px-6 py-2 bg-[#0ea5e9] text-white rounded font-medium hover:bg-[#0284c7] flex items-center gap-2">
                    Speichern & Fortfahren <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP: Tests */}
          {activeStep === 'tests' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 grid grid-cols-2 gap-8">

                {/* Left: cleaning hint + spam-check upsell (Pro-only in the original, kept as visual parity) */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">E-Mail Bereinigungshinweis 🦉</h4>
                    <div className="bg-amber-50 border border-amber-200 rounded p-4 text-sm text-amber-900">
                      <p>Sie werden viele E-Mails versenden. Um sicherzustellen, dass Sie nicht als SPAM eingestuft werden, indem Sie E-Mails an nicht existierende E-Mail-Adressen senden, sollten Sie Ihre Listen vorher bereinigen.</p>
                      <button type="button" className="mt-3 px-4 py-1.5 bg-white border border-amber-300 text-amber-800 rounded text-sm font-medium hover:bg-amber-100">
                        Mehr Informationen
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-800 mb-1 flex items-center gap-1.5">
                      Sichere Prüfung
                      <span className="text-slate-400 text-xs border border-slate-300 rounded-full w-4 h-4 flex items-center justify-center" title="Automatische Qualitätsprüfungen vor dem Versand.">i</span>
                    </h4>
                    <p className="text-sm text-slate-600 mb-3">Sichere Prüftests müssen durchgeführt werden, bevor Sie Ihren Newsletter versenden können.</p>
                    <div className="space-y-2 text-sm text-slate-700">
                      {['Sicherer Inhalt', 'Alle Links geprüft', 'SPAM-Wert > 80%'].map(item => (
                        <div key={item} className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span>{item}</span>
                          <span className="text-slate-400 text-xs border border-slate-300 rounded-full w-4 h-4 flex items-center justify-center">?</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button type="button" className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-sm font-medium hover:bg-slate-50">
                        Mehr sehen
                      </button>
                      <button type="button" className="px-4 py-2 bg-amber-500 text-white rounded text-sm font-medium hover:bg-amber-600">
                        Jetzt upgraden
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: functional test-send */}
                <div>
                  <h4 className="font-medium text-slate-800 mb-3">Test-E-Mail senden an</h4>
                  <div className="border border-slate-300 rounded px-2 py-2 flex flex-wrap gap-1.5 mb-4 min-h-[44px]">
                    {testEmails.map(email => (
                      <span key={email} className="inline-flex items-center gap-1 bg-slate-700 text-white text-xs px-2 py-1 rounded">
                        {email}
                        <button type="button" onClick={() => removeTestEmail(email)} className="hover:text-slate-300">&times;</button>
                      </span>
                    ))}
                    <input
                      type="email"
                      value={testEmailInput}
                      onChange={(e) => setTestEmailInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTestEmail(); } }}
                      onBlur={addTestEmail}
                      placeholder={testEmails.length === 0 ? 'test@beispiel.de' : ''}
                      className="flex-1 min-w-[120px] outline-none text-sm px-1"
                    />
                  </div>

                  <label className="block font-medium text-slate-800 mb-2">Testnachricht</label>
                  <textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Schreiben Sie eine Nachricht, um Ihre Empfänger darüber zu informieren, dass es sich um einen Test handelt..."
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-[#0ea5e9] focus:border-[#0ea5e9] resize-y mb-4"
                  />

                  <button
                    onClick={handleSendTestEmail}
                    disabled={sendingTestEmail}
                    className="px-4 py-2 border border-[#0ea5e9] text-[#0ea5e9] rounded font-medium hover:bg-sky-50 transition-colors disabled:opacity-50"
                  >
                    {sendingTestEmail ? 'Wird gesendet...' : 'Test E-Mail senden'}
                  </button>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setActiveStep('broadcast_settings')} className="px-6 py-2 border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50">
                  Zurück zur Liste
                </button>
                <div className="flex gap-3">
                  <button onClick={() => handleSave(formData.status, true)} className="px-6 py-2 border border-slate-300 text-slate-700 rounded font-medium hover:bg-slate-50">
                    Speichern & Beenden
                  </button>
                  <button onClick={() => handleSave(formData.status, false, 'summary')} className="px-6 py-2 bg-[#0ea5e9] text-white rounded font-medium hover:bg-[#0284c7] flex items-center gap-2">
                    Speichern & Fortfahren <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP: Summary */}
          {activeStep === 'summary' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-medium text-slate-800 mb-4 border-b pb-2 flex items-center gap-2"><Eye size={20} /> Zusammenfassung</h3>
                  
                  <div className="space-y-3">
                    <div className="flex">
                      <span className="w-32 text-slate-500 font-medium">Betreff:</span>
                      <span className="flex-1 font-semibold text-slate-800">{formData.subject || <span className="text-red-400 italic">Fehlt</span>}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-slate-500 font-medium">Empfänger:</span>
                      <span className="flex-1 text-slate-800 font-medium">
                        {selectedCodes.length > 0
                          ? availableLists.filter(l => selectedCodes.includes(l.code)).map(l => l.name).join(', ')
                          : 'Keine Liste ausgewählt'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-slate-500 font-medium">Absender:</span>
                      <span className="flex-1 text-slate-800">{formData.fromName || 'Standard'} &lt;{formData.fromEmail || 'Standard'}&gt;</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 text-slate-500 font-medium">Geplant:</span>
                      <span className="flex-1 text-slate-800 font-medium">{formData.sentAt ? new Date(formData.sentAt).toLocaleString() : 'Sofort'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  {formData.status !== 'SENT' && (
                    <button 
                      onClick={() => handleSave('SCHEDULED', true)}
                      className="flex-1 px-4 py-3 bg-[#10b981] text-white rounded-lg font-medium hover:bg-[#059669] flex items-center justify-center gap-2 shadow-sm transition-colors text-lg"
                    >
                      <Send size={20} /> {formData.sentAt ? 'In Warteschlange stellen' : 'Jetzt senden'}
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg shadow-inner overflow-hidden border border-slate-700 flex flex-col h-[500px]">
                <div className="bg-slate-900 px-4 py-2 text-slate-300 text-sm font-medium flex items-center justify-between">
                  <span>Live Vorschau</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-700">Desktop</span>
                </div>
                <div className="bg-white flex-1 overflow-auto p-4" dangerouslySetInnerHTML={{ __html: formData.body }} />
              </div>
            </div>
          )}

        </div>
      </div>
    </AcyLayout>
  );
};
