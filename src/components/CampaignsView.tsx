import React from 'react';
import { 
  Search, 
  Plus,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmailCampaign } from '../types';
import { format } from 'date-fns';

export const CampaignsView = ({ 
  campaigns, 
  searchQuery, 
  setSearchQuery,
  onNewCampaign,
  onEditCampaign,
  onDeleteCampaign
}: { 
  campaigns: EmailCampaign[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNewCampaign: () => void;
  onEditCampaign: (campaign: EmailCampaign) => void;
  onDeleteCampaign: (id: string) => void;
}) => {

  const filteredCampaigns = campaigns.filter(campaign => {
    return campaign.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
           campaign.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header operations */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search campaigns..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          onClick={onNewCampaign}
          className="flex items-center gap-2 bg-[#dcb059] hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          New Campaign
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-1/3">Campaign</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-1/6">Status</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-1/6">Engagements</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-1/6">Created</th>
                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-1/6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {filteredCampaigns.map(campaign => {
                  
                  // Mock engagement numbers for the UI
                  const opens = campaign.status === 'sent' ? Math.floor(campaign.recipientCount * 0.68) : 0;
                  
                  return (
                    <motion.tr 
                      key={campaign.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="py-5 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{campaign.subject}</span>
                          <span className="text-xs text-slate-500 mt-1 line-clamp-1">{campaign.content}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            campaign.status === 'sent' ? 'bg-emerald-50 text-emerald-600' :
                            campaign.status === 'scheduled' ? 'bg-amber-50 text-amber-600' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex gap-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{campaign.recipientCount}</span>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Sent</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-emerald-600">{opens}</span>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Opens</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-sm text-slate-600 font-medium">
                        {campaign.createdAt ? format(new Date(campaign.createdAt), 'MMM d, yyyy') : 'N/A'}
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end">
                          <button 
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            onClick={() => onEditCampaign(campaign)}
                          >
                           Edit
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredCampaigns.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-sm font-medium">No campaigns found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
