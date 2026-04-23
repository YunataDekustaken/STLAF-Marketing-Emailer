import React, { useState } from 'react';
import { Plus, X, LayoutTemplate, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Template } from '../types';
import { format } from 'date-fns';

export const TemplatesView = ({
  templates,
  onSaveTemplate,
  onDeleteTemplate
}: {
  templates: Template[];
  onSaveTemplate: (template: Template) => void;
  onDeleteTemplate: (id: string) => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<Partial<Template>>({
    name: '',
    subject: '',
    content: ''
  });

  const handleOpenModal = (template?: Template) => {
    if (template) {
      setEditingTemplate(template);
      setFormData(template);
    } else {
      setEditingTemplate(null);
      setFormData({ name: '', subject: '', content: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.subject || !formData.content) return;
    onSaveTemplate({
      id: editingTemplate?.id || `template_${Date.now()}`,
      name: formData.name,
      subject: formData.subject,
      content: formData.content,
      createdAt: editingTemplate?.createdAt || new Date().toISOString()
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Create New Template button */}
        <button 
          onClick={() => handleOpenModal()}
          className="h-64 rounded-3xl border-2 border-dashed border-slate-200 hover:border-amber-400 hover:bg-slate-50 transition-all flex flex-col items-center justify-center gap-4 group bg-white shadow-sm"
        >
          <div className="w-14 h-14 rounded-full bg-slate-50 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
            <Plus className="w-6 h-6 text-slate-400 group-hover:text-amber-600" />
          </div>
          <span className="text-sm font-bold text-slate-400 group-hover:text-amber-700 transition-colors">Create New Template</span>
        </button>

        {/* Existing Templates */}
        <AnimatePresence>
          {templates.map(template => (
            <motion.div 
              key={template.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white h-64 border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex flex-col relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                  <LayoutTemplate className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">{template.name}</h3>
              <p className="text-xs text-slate-500 font-medium mb-3 line-clamp-1">Subj: {template.subject}</p>
              <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1 font-mono bg-slate-50 p-2 rounded border border-slate-50">{template.content}</p>
              
              <div className="flex items-center justify-between mt-auto">
                 <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    {template.createdAt ? format(new Date(template.createdAt), 'MMM d, yyyy') : 'No date'}
                 </span>
                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(template)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteTemplate(template.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary-dark/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Template Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    placeholder="e.g. Monthly Newsletter"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Default Subject Line</label>
                  <input 
                    type="text" 
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    placeholder="e.g. Your Monthly Update"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Template Content</label>
                  <textarea 
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none min-h-[250px] font-mono text-sm"
                    placeholder="Type your template content here. Use [Brackets] for placeholders..."
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancel</button>
                <button 
                  onClick={handleSave}
                  disabled={!formData.name || !formData.subject || !formData.content}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:hover:bg-amber-500 text-primary-dark text-sm font-bold rounded-lg transition-colors shadow-sm"
                >
                  Save Template
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
