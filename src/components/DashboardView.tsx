import React from 'react';
import { Mail, Users, MousePointer2, ExternalLink, Plus, LayoutTemplate } from 'lucide-react';
import { EmailCampaign } from '../types';
import { format } from 'date-fns';

export const DashboardView = ({ 
  campaigns,
  recipients,
  onNewCampaign,
  onAddRecipient,
  onNewTemplate,
  onViewAllCampaigns
}: { 
  campaigns: EmailCampaign[];
  recipients: any[];
  onNewCampaign: () => void;
  onAddRecipient: () => void;
  onNewTemplate: () => void;
  onViewAllCampaigns: () => void;
}) => {
  const totalCampaigns = campaigns.length;
  // Total actual unique recipients in the database
  const totalRecipients = recipients?.length || 0;
  
  // Sorting campaigns by created date to get recent ones
  const recentCampaigns = [...campaigns].sort((a, b) => {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  }).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-40">
          <div className="w-12 h-12 bg-amber-500/80 hover:bg-amber-500 rounded-xl transition-colors mb-4" />
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Total Campaigns</p>
            <h3 className="text-3xl font-bold text-slate-900">{totalCampaigns}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-emerald-500 flex items-center justify-center rounded-xl text-white">
              <Users className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">+12%</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Total Recipients</p>
            <h3 className="text-3xl font-bold text-slate-900">{totalRecipients}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-40">
           <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-amber-500/80 hover:bg-amber-500 transition-colors rounded-xl text-white" />
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">+5%</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Avg. Open Rate</p>
            <h3 className="text-3xl font-bold text-slate-900">64.2%</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-40">
          <div className="w-12 h-12 bg-rose-500 rounded-xl text-white" />
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Avg. Click Rate</p>
            <h3 className="text-3xl font-bold text-slate-900">18.5%</h3>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recent Campaigns</h3>
            <button 
              onClick={onViewAllCampaigns}
              className="text-amber-600 hover:text-amber-700 font-bold text-sm transition-colors"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentCampaigns.map(campaign => (
              <div key={campaign.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                   </div>
                   <div>
                     <h4 className="text-base font-bold text-slate-900">{campaign.subject}</h4>
                     <p className="text-sm text-slate-500 truncate max-w-sm">{campaign.content}</p>
                   </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                    campaign.status === 'sent' ? 'bg-emerald-100 text-emerald-700' :
                    campaign.status === 'scheduled' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {campaign.status}
                  </span>
                  {campaign.createdAt && (
                     <span className="text-[11px] text-slate-400">
                       {format(new Date(campaign.createdAt), 'MMM d, h:mm a')}
                     </span>
                  )}
                </div>
              </div>
            ))}
            {recentCampaigns.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">
                No recent campaigns yet. Create one to get started.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
           <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>
           
           <button 
             onClick={onNewCampaign}
             className="w-full flex items-center gap-3 p-4 bg-amber-50 hover:bg-amber-100 transition-colors rounded-xl text-amber-600 font-bold"
           >
             <Plus className="w-5 h-5" />
             New Campaign
           </button>
           
           <button 
             onClick={onAddRecipient}
             className="w-full flex items-center gap-3 p-4 bg-emerald-50 hover:bg-emerald-100 transition-colors rounded-xl text-emerald-600 font-bold"
           >
             <Users className="w-5 h-5" />
             Add Recipient
           </button>
           
           <button 
             onClick={onNewTemplate}
             className="w-full flex items-center gap-3 p-4 bg-amber-50 hover:bg-amber-100 transition-colors rounded-xl text-amber-600 font-bold"
           >
             <LayoutTemplate className="w-5 h-5" />
             New Template
           </button>
        </div>
      </div>
    </div>
  );
};
