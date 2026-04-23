import React, { useState } from 'react';
import { Search, Filter, Upload, Plus, Trash2, X, User, Download, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Recipient } from '../types';
import { format } from 'date-fns';

export const RecipientsView = ({
  recipients,
  onSaveRecipient,
  onDeleteRecipient,
  onDeleteRecipients
}: {
  recipients: Recipient[];
  onSaveRecipient: (recipient: Recipient) => void;
  onDeleteRecipient: (id: string) => void;
  onDeleteRecipients?: (ids: string[]) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<Recipient>>({
    id: undefined,
    name: '',
    email: '',
    segment: 'General'
  });

  const filteredRecipients = recipients.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.segment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredRecipients.length && filteredRecipients.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecipients.map(r => r.id));
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) return;
    onSaveRecipient({
      id: formData.id || `recipient_${Date.now()}`,
      name: formData.name,
      email: formData.email,
      segment: formData.segment || 'General',
      addedAt: formData.addedAt || new Date().toISOString()
    });
    setFormData({ id: undefined, name: '', email: '', segment: 'General' });
    setIsModalOpen(false);
  };

  const handleEdit = (recipient: Recipient) => {
    setFormData(recipient);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setFormData({ id: undefined, name: '', email: '', segment: 'General' });
    setIsModalOpen(true);
  };

  const handleMassDelete = () => {
    if (onDeleteRecipients && selectedIds.length > 0) {
      onDeleteRecipients(selectedIds);
      setSelectedIds([]); // Clear selection after delete
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Segment', 'Added At'];
    
    const recipientsToExport = selectedIds.length > 0 
      ? filteredRecipients.filter(r => selectedIds.includes(r.id))
      : filteredRecipients;

    const csvRows = recipientsToExport.map(r => {
      const addedAtFormatted = r.addedAt ? format(new Date(r.addedAt), 'yyyy-MM-dd HH:mm:ss') : '';
      return [
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.email.replace(/"/g, '""')}"`,
        `"${r.segment.replace(/"/g, '""')}"`,
        `"${addedAtFormatted}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `recipients_export_${new Date().toISOString().split('T')[0]}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header operations */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 items-center gap-3 w-full max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search recipients..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-amber-400 text-slate-400 hover:text-amber-600 transition-colors shadow-sm shrink-0">
            <Filter className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                {selectedIds.length} selected
              </span>
              <button 
                onClick={handleMassDelete}
                className="flex items-center gap-2 bg-rose-50 border border-rose-200 hover:border-rose-300 hover:bg-rose-100 text-rose-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm whitespace-nowrap"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          )}
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            {selectedIds.length > 0 ? 'Export Selected' : 'Export CSV'}
          </button>
          <button className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm whitespace-nowrap">
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button 
            onClick={openNewModal}
            className="flex items-center gap-2 bg-[#dcb059] hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add Recipient
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-4 pl-6 pr-2 w-12 text-[10px]">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                    checked={filteredRecipients.length > 0 && selectedIds.length === filteredRecipients.length}
                    onChange={toggleAll}
                  />
                </th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-1/4">Contact</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-1/4">Email</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-1/6">Segment</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-1/6">Added</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-1/6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               <AnimatePresence mode="popLayout">
                 {filteredRecipients.map(recipient => (
                   <motion.tr 
                     key={recipient.id}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     onClick={() => toggleSelection(recipient.id)}
                     className={`hover:bg-slate-50/50 transition-colors group cursor-pointer ${selectedIds.includes(recipient.id) ? 'bg-amber-50/30' : ''}`}
                   >
                     <td className="py-4 pl-6 pr-2 w-12" onClick={(e) => e.stopPropagation()}>
                       <input 
                         type="checkbox"
                         className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                         checked={selectedIds.includes(recipient.id)}
                         onChange={() => toggleSelection(recipient.id)}
                       />
                     </td>
                     <td className="py-4 px-6">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                           {recipient.name.charAt(0).toUpperCase()}
                         </div>
                         <span className="font-bold text-slate-900">{recipient.name}</span>
                       </div>
                     </td>
                     <td className="py-4 px-6 text-sm text-slate-600">
                       {recipient.email}
                     </td>
                     <td className="py-4 px-6">
                       <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                         {recipient.segment}
                       </span>
                     </td>
                     <td className="py-4 px-6 text-sm text-slate-500">
                       {recipient.addedAt ? format(new Date(recipient.addedAt), 'MMM d, yyyy') : 'Unknown'}
                     </td>
                     <td className="py-4 px-6 text-right">
                       <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={(e) => { e.stopPropagation(); handleEdit(recipient); }}
                           className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all inline-flex items-center justify-center"
                         >
                           <Edit2 className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={(e) => { e.stopPropagation(); onDeleteRecipient(recipient.id); }}
                           className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all inline-flex items-center justify-center"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                     </td>
                   </motion.tr>
                 ))}
               </AnimatePresence>
            </tbody>
          </table>
          
          {filteredRecipients.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[300px]">
               <User className="w-12 h-12 text-slate-200 mb-4" />
               <p className="text-sm font-medium text-slate-400 italic">No recipients found. Import a CSV or add them manually to start your list.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Recipient Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary-dark/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">{formData.id ? 'Edit Recipient' : 'Add Recipient'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    placeholder="e.g. Jane Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    placeholder="e.g. jane@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Segment / Tag</label>
                  <input 
                    type="text" 
                    value={formData.segment}
                    onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    placeholder="e.g. VIP Clients"
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancel</button>
                <button 
                  onClick={handleSave}
                  disabled={!formData.name || !formData.email}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:hover:bg-amber-500 text-primary-dark text-sm font-bold rounded-lg transition-colors shadow-sm"
                >
                  {formData.id ? 'Save Changes' : 'Add Contact'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
