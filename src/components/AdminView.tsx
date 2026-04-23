import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { 
  Plus, 
  AlertCircle, 
  Edit2, 
  Trash2, 
  ExternalLink,
  X,
  Facebook,
  Instagram,
  Linkedin,
  FolderOpen,
  Info,
  Music2,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmailCampaign, CAMPAIGN_CATEGORIES } from '../types';

export const AdminView = ({ 
  socialLinks,
  onUpdateSocialLinks,
  campaigns,
  handleSaveCampaign,
  handleDeleteCampaign,
  campaignFormData,
  setCampaignFormData,
  editingCampaign,
  setEditingCampaign,
  isCampaignModalOpen,
  setIsCampaignModalOpen
}: { 
  socialLinks: { facebook: string, instagram: string, linkedin: string, tiktok: string },
  onUpdateSocialLinks: (links: any) => void,
  campaigns: EmailCampaign[],
  handleSaveCampaign: () => Promise<void>,
  handleDeleteCampaign: (id: string) => Promise<void>,
  campaignFormData: Partial<EmailCampaign>,
  setCampaignFormData: Dispatch<SetStateAction<Partial<EmailCampaign>>>,
  editingCampaign: EmailCampaign | null,
  setEditingCampaign: Dispatch<SetStateAction<EmailCampaign | null>>,
  isCampaignModalOpen: boolean,
  setIsCampaignModalOpen: Dispatch<SetStateAction<boolean>>
}) => {
  const [localLinks, setLocalLinks] = useState(socialLinks);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setLocalLinks(socialLinks);
  }, [socialLinks]);

  const handleSaveLinks = () => {
    setShowConfirm(true);
  };

  const confirmSave = () => {
    onUpdateSocialLinks(localLinks);
    setShowConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Campaign Management */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl">
              <Mail className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Campaign Management</h3>
              <p className="text-xs text-slate-500">Manage all existing email campaigns in the system.</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setEditingCampaign(null);
              setCampaignFormData({ subject: '', category: CAMPAIGN_CATEGORIES[0], content: '', status: 'draft', recipientCount: 0 });
              setIsCampaignModalOpen(true);
            }}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>

        <div className="space-y-8">
          {CAMPAIGN_CATEGORIES.map(category => {
            const categoryCampaigns = campaigns.filter(c => c.category === category);
            if (categoryCampaigns.length === 0) return null;
            
            return (
              <div key={category} className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">{category}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryCampaigns.map(campaign => (
                    <div key={campaign.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/30 flex flex-col gap-2 group relative">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 pr-12">
                          <p className="text-sm font-bold text-slate-900 truncate">{campaign.subject}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{campaign.content}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            campaign.status === 'sent' ? 'bg-emerald-100 text-emerald-700' :
                            campaign.status === 'scheduled' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-200 text-slate-600'
                          }`}>
                            {campaign.status}
                          </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                           👥 {campaign.recipientCount} Recipients
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setEditingCampaign(campaign);
                              setCampaignFormData(campaign);
                              setIsCampaignModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-amber-600 hover:bg-white rounded transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {campaigns.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">No campaigns found.</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <ExternalLink className="w-6 h-6 text-indigo-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Social Media Redirection Links</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Facebook className="w-3 h-3 text-[#1877F2]" />
              Facebook URL
            </label>
            <input 
              type="url" 
              placeholder="https://facebook.com/yourpage"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
              value={localLinks.facebook}
              onChange={(e) => setLocalLinks(prev => ({ ...prev, facebook: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Instagram className="w-3 h-3 text-[#E4405F]" />
              Instagram URL
            </label>
            <input 
              type="url" 
              placeholder="https://instagram.com/yourprofile"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
              value={localLinks.instagram}
              onChange={(e) => setLocalLinks(prev => ({ ...prev, instagram: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Linkedin className="w-3 h-3 text-[#0A66C2]" />
              LinkedIn URL
            </label>
            <input 
              type="url" 
              placeholder="https://linkedin.com/company/yourcompany"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
              value={localLinks.linkedin}
              onChange={(e) => setLocalLinks(prev => ({ ...prev, linkedin: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Music2 className="w-3 h-3 text-[#000000]" />
              TikTok URL
            </label>
            <input 
              type="url" 
              placeholder="https://tiktok.com/@yourprofile"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all text-sm"
              value={localLinks.tiktok}
              onChange={(e) => setLocalLinks(prev => ({ ...prev, tiktok: e.target.value }))}
            />
          </div>
        </div>

        <button 
          onClick={handleSaveLinks}
          className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-primary-dark rounded-xl text-sm font-bold transition-all shadow-sm"
        >
          Save Social Links
        </button>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-slate-50 rounded-xl">
            <Info className="w-6 h-6 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">App Info</h3>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Application Name</p>
            <p className="text-sm font-bold text-slate-900">MailersHub</p>
          </div>
          <div className="pt-6 border-t border-slate-100">
            <p className="text-xs italic text-slate-400">Admin Center is only accessible to Marketing Supervisors.</p>
          </div>
        </div>
      </div>

      {/* Save Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary-dark/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Confirm Changes</h3>
                    <p className="text-sm text-slate-500">Are you sure you want to update the social media redirection links?</p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">Cancel</button>
                <button onClick={confirmSave} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-primary-dark text-sm font-bold rounded-lg transition-colors shadow-sm">Confirm & Save</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
