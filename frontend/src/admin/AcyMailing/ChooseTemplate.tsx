import React, { useState, useEffect } from 'react';
import { AcyLayout } from './AcyLayout';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Search, Plus, RotateCw, BookOpen, AlertCircle } from 'lucide-react';

export const AcyChooseTemplate = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      console.error('Error fetching templates', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartBlank = async () => {
    navigate('/admin/acymailing/emails/create/edit');
  };

  const handleSelectTemplate = async (templateId: string) => {
    navigate(`/admin/acymailing/emails/create/edit?template=${templateId}`);
  };

  return (
    <AcyLayout title="New newsletter">
      <div className="bg-white min-h-[800px] flex flex-col p-6">
        
        {/* Breadcrumb Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
          <div className="text-xl font-medium text-slate-800 flex items-center gap-2">
            <span className="text-[#0ea5e9]">M</span>
            <span className="text-slate-700">AcyMailing <ChevronRight className="inline" size={16} /> Emails <ChevronRight className="inline" size={16} /></span>
            <span className="text-slate-900">New newsletter</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span className="text-sm font-medium">AcyMailing Starter<span className="text-emerald-500">11.0.4</span></span>
            <RotateCw size={18} className="cursor-pointer hover:text-slate-800" />
            <BookOpen size={18} className="cursor-pointer hover:text-slate-800" />
            <div className="text-red-400 bg-red-50 p-1 rounded-full cursor-pointer hover:bg-red-100">
              <AlertCircle size={18} />
            </div>
          </div>
        </div>

        {/* Wizard Progress Bar */}
        <div className="flex items-center justify-between mb-8 overflow-hidden rounded border border-slate-200">
          <div className="flex-1 bg-[#e0f2fe] text-[#0ea5e9] py-3 text-center text-sm font-medium">
            Select a template
          </div>
          <ChevronRight className="text-slate-300 -ml-3 z-10" size={32} />
          
          <div className="flex-1 bg-white text-slate-300 py-3 text-center text-sm font-medium flex items-center justify-center">
            Edit email
          </div>
          <ChevronRight className="text-slate-300 -ml-3 z-10" size={32} />
          
          <div className="flex-1 bg-white text-slate-300 py-3 text-center text-sm font-medium flex items-center justify-center">
            Recipient
          </div>
          <ChevronRight className="text-slate-300 -ml-3 z-10" size={32} />
          
          <div className="flex-1 bg-white text-slate-300 py-3 text-center text-sm font-medium flex items-center justify-center">
            Broadcast settings
          </div>
          <ChevronRight className="text-slate-300 -ml-3 z-10" size={32} />
          
          <div className="flex-1 bg-white text-slate-300 py-3 text-center text-sm font-medium flex items-center justify-center">
            Tests
          </div>
          <ChevronRight className="text-slate-300 -ml-3 z-10" size={32} />
          
          <div className="flex-1 bg-white text-slate-300 py-3 text-center text-sm font-medium flex items-center justify-center">
            Summary
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4 flex-1">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2 border border-[#093d7c] rounded focus:outline-none"
              />
            </div>
            <select className="border border-slate-300 rounded px-4 py-2 min-w-[200px] text-slate-700 focus:outline-none">
              <option>All tags</option>
            </select>
          </div>
          
          <button 
            onClick={handleStartBlank}
            className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-6 py-2 rounded font-medium transition-colors"
          >
            Start with a blank template
          </button>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading templates...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Hardcoded Dummy Templates from Screenshot for exact match if real are empty */}
            {templates.length === 0 && (
              <>
                <div onClick={handleStartBlank} className="cursor-pointer group">
                  <div className="bg-slate-100 h-64 flex flex-col mb-4 border-b-4 border-[#0ea5e9] overflow-hidden justify-center items-center relative">
                    <div className="text-slate-300 font-bold text-4xl">AcyMailing</div>
                  </div>
                  <div className="text-center font-medium text-slate-800">AcyMailing first email</div>
                  <div className="text-center text-sm text-slate-500">August 10, 2021</div>
                </div>
                
                <div onClick={handleStartBlank} className="cursor-pointer group">
                  <div className="bg-[#4a3b5c] h-64 flex flex-col mb-4 border-b-4 border-[#0ea5e9] overflow-hidden p-4 relative">
                    <div className="bg-white/10 w-full h-8 mb-4"></div>
                    <div className="text-center text-white text-xl font-bold mb-4">Merry Christmas</div>
                    <div className="text-center text-white text-sm mb-4">A Happy New Year</div>
                    <div className="bg-white/20 w-full h-24"></div>
                  </div>
                  <div className="text-center font-medium text-slate-800">Christmas</div>
                  <div className="text-center text-sm text-slate-500">August 10, 2021</div>
                </div>

                <div onClick={handleStartBlank} className="cursor-pointer group">
                  <div className="bg-[#242b31] h-64 flex flex-col mb-4 border-b-4 border-[#0ea5e9] overflow-hidden relative">
                    <div className="bg-white h-24 mb-2"></div>
                    <div className="text-white text-sm px-4">WINTER NEWSLETTER</div>
                    <div className="bg-white/20 h-4 mx-4 mt-2"></div>
                    <div className="bg-white/20 h-4 mx-4 mt-2"></div>
                    <div className="bg-white/20 h-4 mx-4 mt-2"></div>
                  </div>
                  <div className="text-center font-medium text-slate-800">snow</div>
                  <div className="text-center text-sm text-slate-500">August 10, 2021</div>
                </div>

                <div onClick={handleStartBlank} className="cursor-pointer group">
                  <div className="bg-white h-64 flex flex-col mb-4 border-b-4 border-[#0ea5e9] border border-slate-200 overflow-hidden relative p-4">
                    <div className="flex justify-between mb-4">
                      <div className="bg-slate-200 w-16 h-4"></div>
                      <div className="bg-slate-200 w-24 h-16"></div>
                    </div>
                    <div className="bg-slate-200 w-full h-4 mb-2"></div>
                    <div className="bg-slate-200 w-full h-4 mb-2"></div>
                    <div className="bg-slate-200 w-2/3 h-4 mb-4"></div>
                  </div>
                  <div className="text-center font-medium text-slate-800">white</div>
                  <div className="text-center text-sm text-slate-500">August 10, 2021</div>
                </div>
              </>
            )}

            {/* Real Templates */}
            {templates.map(template => (
              <div key={template.id} onClick={() => handleSelectTemplate(template.id)} className="cursor-pointer group">
                <div className="bg-white h-64 flex items-center justify-center mb-4 border-b-4 border-transparent group-hover:border-[#0ea5e9] border border-slate-200 overflow-hidden relative shadow-sm">
                  {template.thumbnailUrl ? (
                    <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-300 text-6xl">
                      <BookOpen />
                    </div>
                  )}
                </div>
                <div className="text-center font-medium text-slate-800 group-hover:text-[#0ea5e9] transition-colors">{template.name}</div>
                <div className="text-center text-sm text-slate-500">
                  {new Date(template.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </AcyLayout>
  );
};
