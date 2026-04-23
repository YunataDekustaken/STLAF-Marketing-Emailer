/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { 
  Plus, 
  Search, 
  AlertCircle, 
  Edit2, 
  Trash2, 
  ExternalLink,
  X,
  Loader2,
  Copy,
  Check,
  Lock,
  Bell,
  Users,
  Settings,
  Info,
  PanelLeftClose,
  PanelLeftOpen,
  Facebook,
  Instagram,
  Linkedin,
  LayoutGrid,
  FileText,
  Sparkles,
  Music2,
  Mail,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmailCampaign, Template, Recipient, CAMPAIGN_CATEGORIES, ViewMode } from './types';
import { auth, db, googleProvider, isFirebaseConfigured } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User 
} from 'firebase/auth';
import { persistenceService } from './services/persistenceService';

import { AdminView } from './components/AdminView';
import { CampaignsView } from './components/CampaignsView';
import { DashboardView } from './components/DashboardView';
import { TemplatesView } from './components/TemplatesView';
import { RecipientsView } from './components/RecipientsView';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  console.error('Firestore Error: ', error, operationType, path);
};

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [campaignCategoryFilter, setCampaignCategoryFilter] = useState('All');
  const [campaignSearchQuery, setCampaignSearchQuery] = useState('');
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [campaignFormData, setCampaignFormData] = useState<Partial<EmailCampaign>>({
    subject: '',
    category: CAMPAIGN_CATEGORIES[0],
    content: '',
    status: 'draft',
    targetSegment: 'All segments',
    recipientCount: 0
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isNewEmailModalOpen, setIsNewEmailModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ successCount: number, failureCount: number, errorMessage?: string | null } | null>(null);
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    linkedin: '',
    tiktok: ''
  });

  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsAuthReady(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubCampaigns = persistenceService.subscribeToCampaigns((data) => {
      setCampaigns(data);
    });
    const unsubTemplates = persistenceService.subscribeToTemplates((data) => {
      setTemplates(data);
    });
    const unsubRecipients = persistenceService.subscribeToRecipients((data) => {
      setRecipients(data);
    });
    return () => {
      unsubCampaigns();
      unsubTemplates();
      unsubRecipients();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setViewMode('campaigns');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const uniqueSegments = ['All segments', ...Array.from(new Set(recipients.map(r => r.segment))).filter(Boolean)];

  const handleSendCampaign = async (campaignData: Partial<EmailCampaign>) => {
    if (!campaignData.subject || !campaignData.content) {
      alert("Please provide a subject and content before sending.");
      return;
    }
    
    if (recipients.length === 0) {
      alert("You have no recipients in your list to send this campaign to.");
      return;
    }

    const targets = campaignData.targetSegment && campaignData.targetSegment !== 'All segments'
      ? recipients.filter(r => r.segment === campaignData.targetSegment)
      : recipients;

    if (targets.length === 0) {
      alert("No recipients found in the selected segment.");
      return;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      const response = await fetch('/api/send-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: campaignData.subject,
          content: campaignData.content,
          recipients: targets,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send campaign');
      }

      setSendResult({ 
        successCount: data.successCount || 0, 
        failureCount: data.failureCount || 0,
        errorMessage: data.lastError?.message || data.lastError?.name || null
      });
      
      // Update local state to reflect sent status
      const sentCampaign: EmailCampaign = {
        id: editingCampaign?.id || `campaign_${Date.now()}`,
        subject: campaignData.subject,
        category: campaignData.category || CAMPAIGN_CATEGORIES[0],
        content: campaignData.content,
        targetSegment: campaignData.targetSegment || 'All segments',
        status: 'sent',
        recipientCount: data.successCount || 0,
        userId: user?.uid,
        createdAt: editingCampaign?.createdAt || new Date().toISOString()
      };

      await persistenceService.saveCampaign(sentCampaign);
      
      // Optional: keep modal open to show result
      setCampaignFormData({ ...campaignData, status: 'sent', recipientCount: data.successCount || 0 });
      
    } catch (err: any) {
      console.error("Error sending campaign:", err);
      alert('Error sending campaign: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveCampaign = async () => {
    if (!campaignFormData.subject || !campaignFormData.content) return;
    
    const campaignToSave: EmailCampaign = {
      id: editingCampaign?.id || `campaign_${Date.now()}`,
      subject: campaignFormData.subject,
      category: campaignFormData.category || CAMPAIGN_CATEGORIES[0],
      content: campaignFormData.content,
      targetSegment: campaignFormData.targetSegment || 'All segments',
      status: campaignFormData.status || 'draft',
      recipientCount: campaignFormData.recipientCount || 0,
      userId: user?.uid
    };

    try {
      await persistenceService.saveCampaign(campaignToSave);
      setIsCampaignModalOpen(false);
      setIsNewEmailModalOpen(false);
      setCampaignFormData({ subject: '', category: CAMPAIGN_CATEGORIES[0], content: '', status: 'draft', targetSegment: 'All segments', recipientCount: 0 });
      setEditingCampaign(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'campaigns');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      await persistenceService.deleteCampaign(id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'campaigns');
    }
  };

  const handleSaveTemplate = async (template: Template) => {
    try {
      await persistenceService.saveTemplate(template);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'templates');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await persistenceService.deleteTemplate(id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'templates');
    }
  };

  const handleSaveRecipient = async (recipient: Recipient) => {
    try {
      await persistenceService.saveRecipient(recipient);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'recipients');
    }
  };

  const handleDeleteRecipient = async (id: string) => {
    try {
      await persistenceService.deleteRecipient(id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'recipients');
    }
  };

  const handleDeleteRecipients = async (ids: string[]) => {
    try {
      // Execute deletions sequentially or in parallel
      await Promise.all(ids.map(id => persistenceService.deleteRecipient(id)));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'recipients');
    }
  };

  const handleUpdateSocialLinks = (links: any) => {
    setSocialLinks(links);
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg-main font-sans text-slate-900">
      {/* Sidebar */}
      <aside 
        onMouseEnter={() => isSidebarCollapsed && setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`flex flex-col shrink-0 bg-primary-dark text-slate-300 relative z-30 shadow-2xl transition-[width] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isSidebarCollapsed && !isSidebarHovered ? 'w-20' : 'w-64'}`}
      >
        <div className={`px-4 pt-4 flex ${isSidebarCollapsed && !isSidebarHovered ? 'justify-center' : 'justify-start'}`}>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all"
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>

        <div className={`p-6 pt-2 flex items-center transition-all duration-500 ${isSidebarCollapsed && !isSidebarHovered ? 'justify-center' : 'gap-3'}`}>
          <div className="relative shrink-0">
            {/* Main Square Logo */}
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-xs tracking-tighter shadow-lg shadow-amber-500/20">
              MLRS
            </div>
            
            {/* Star Icon Overlay */}
            <div className="absolute -right-1.5 -top-1.5 bg-white rounded-lg p-1 shadow-sm border border-slate-100">
              <Mail className="w-3 h-3 text-amber-500" />
            </div>
          </div>
          <AnimatePresence mode="wait">
            {(!isSidebarCollapsed || isSidebarHovered) && (
              <motion.div 
                key="logo-text"
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h2 className="text-sm font-bold text-white leading-tight">MailersHub</h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Email Marketing</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-3 space-y-2 mt-4 overflow-y-auto no-scrollbar overflow-x-hidden">
          <button 
            onClick={() => setViewMode('dashboard')}
            className={`w-full flex items-center ${isSidebarCollapsed && !isSidebarHovered ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl font-semibold transition-all duration-300 ease-in-out ${viewMode === 'dashboard' ? 'bg-slate-700/50 text-white border-l-2 border-amber-500' : 'hover:bg-white/10 hover:text-white text-slate-400'}`}
          >
            <LayoutGrid className={`w-5 h-5 shrink-0 ${viewMode === 'dashboard' ? 'text-amber-500' : ''}`} />
            <AnimatePresence>
              {(!isSidebarCollapsed || isSidebarHovered) && (
                <motion.span 
                  key="dashboard-text"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Dashboard
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button 
            onClick={() => setViewMode('campaigns')}
            className={`w-full flex items-center ${isSidebarCollapsed && !isSidebarHovered ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl font-semibold transition-all duration-300 ease-in-out ${viewMode === 'campaigns' ? 'bg-slate-700/50 text-white border-l-2 border-amber-500' : 'hover:bg-white/10 hover:text-white text-slate-400'}`}
          >
            <Send className={`w-5 h-5 shrink-0 ${viewMode === 'campaigns' ? 'text-amber-500' : ''}`} />
            <AnimatePresence>
              {(!isSidebarCollapsed || isSidebarHovered) && (
                <motion.span 
                  key="campaigns-text"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Campaigns
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          
          <button 
            onClick={() => setViewMode('templates')}
            className={`w-full flex items-center ${isSidebarCollapsed && !isSidebarHovered ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl font-semibold transition-all duration-300 ease-in-out ${viewMode === 'templates' ? 'bg-slate-700/50 text-white border-l-2 border-amber-500' : 'hover:bg-white/10 hover:text-white text-slate-400'}`}
          >
            <FileText className={`w-5 h-5 shrink-0 ${viewMode === 'templates' ? 'text-amber-500' : ''}`} />
            <AnimatePresence>
              {(!isSidebarCollapsed || isSidebarHovered) && (
                <motion.span 
                  key="templates-text"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Templates
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          
          <button 
            onClick={() => setViewMode('recipients')}
            className={`w-full flex items-center ${isSidebarCollapsed && !isSidebarHovered ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl font-semibold transition-all duration-300 ease-in-out ${viewMode === 'recipients' ? 'bg-slate-700/50 text-white border-l-2 border-amber-500' : 'hover:bg-white/10 hover:text-white text-slate-400'}`}
          >
            <Users className={`w-5 h-5 shrink-0 ${viewMode === 'recipients' ? 'text-amber-500' : ''}`} />
            <AnimatePresence>
              {(!isSidebarCollapsed || isSidebarHovered) && (
                <motion.span 
                  key="recipients-text"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Recipients
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          
          <div className="pt-4 mt-4 border-t border-slate-700/50">
            <button 
              onClick={() => setViewMode('settings')}
              className={`w-full flex items-center ${isSidebarCollapsed && !isSidebarHovered ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl font-semibold transition-all duration-300 ease-in-out ${viewMode === 'settings' ? 'bg-slate-700/50 text-white border-l-2 border-amber-500' : 'hover:bg-white/10 hover:text-white text-slate-400'}`}
            >
              <Settings className={`w-5 h-5 shrink-0 ${viewMode === 'settings' ? 'text-amber-500' : ''}`} />
              <AnimatePresence>
                {(!isSidebarCollapsed || isSidebarHovered) && (
                  <motion.span 
                    key="settings-text"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    Settings
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </nav>

        {isFirebaseConfigured && (
          <div className="p-4 border-t border-slate-700/50">
            {user ? (
              <div className={`flex items-center ${isSidebarCollapsed && !isSidebarHovered ? 'justify-center' : 'gap-3'}`}>
                {user.photoURL && <img src={user.photoURL} className="w-8 h-8 rounded-full border border-slate-600 shrink-0" alt="Profile" referrerPolicy="no-referrer" />}
                {(!isSidebarCollapsed || isSidebarHovered) && (
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{user.displayName}</p>
                    <button onClick={handleLogout} className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className={`w-full flex items-center justify-center ${isSidebarCollapsed && !isSidebarHovered ? 'p-2' : 'gap-2 px-4 py-2'} bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-all`}
              >
                <Lock className="w-3.5 h-3.5 shrink-0" />
                {(!isSidebarCollapsed || isSidebarHovered) && <span>Sign In</span>}
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors">
               <span className="sr-only">Menu</span>
               <div className="w-4 h-4 flex flex-col justify-center gap-1">
                 <div className="w-full h-[2px] bg-current rounded-full" />
                 <div className="w-full h-[2px] bg-current rounded-full" />
                 <div className="w-full h-[2px] bg-current rounded-full" />
               </div>
            </button>
            <h1 className="text-xl font-bold text-slate-800 capitalize">
              {viewMode}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsNewEmailModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl text-sm font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Email
            </button>
            {/* Social Links in Header */}
            <div className="hidden md:flex items-center gap-3">
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 rounded-lg text-[#1877F2] hover:bg-[#1877F2]/10 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 rounded-lg text-[#E4405F] hover:bg-[#E4405F]/10 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 rounded-lg text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {socialLinks.tiktok && (
                <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 rounded-lg text-[#000000] hover:bg-[#000000]/10 transition-colors">
                  <Music2 className="w-4 h-4" />
                </a>
              )}
            </div>
            
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-full transition-all ${showNotifications ? 'bg-slate-100 text-amber-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                <Bell className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 text-center"
                  >
                    <p className="text-xs text-slate-500">No new notifications</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {viewMode === 'dashboard' && (
              <DashboardView 
                campaigns={campaigns}
                recipients={recipients}
                onNewCampaign={() => setIsNewEmailModalOpen(true)}
                onAddRecipient={() => setViewMode('recipients')}
                onNewTemplate={() => setViewMode('templates')}
                onViewAllCampaigns={() => setViewMode('campaigns')}
              />
            )}
            {viewMode === 'campaigns' && (
              <CampaignsView 
                campaigns={campaigns}
                searchQuery={campaignSearchQuery}
                setSearchQuery={setCampaignSearchQuery}
                onNewCampaign={() => setIsNewEmailModalOpen(true)}
                onEditCampaign={(c) => {
                  setEditingCampaign(c);
                  setCampaignFormData(c);
                  setIsNewEmailModalOpen(true);
                }}
                onDeleteCampaign={handleDeleteCampaign}
              />
            )}
            {viewMode === 'templates' && (
              <TemplatesView 
                templates={templates}
                onSaveTemplate={handleSaveTemplate}
                onDeleteTemplate={handleDeleteTemplate}
              />
            )}
            {viewMode === 'recipients' && (
              <RecipientsView 
                recipients={recipients}
                onSaveRecipient={handleSaveRecipient}
                onDeleteRecipient={handleDeleteRecipient}
                onDeleteRecipients={handleDeleteRecipients}
              />
            )}
            {viewMode === 'settings' && (
              <AdminView 
                socialLinks={socialLinks}
                onUpdateSocialLinks={handleUpdateSocialLinks}
                campaigns={campaigns}
                handleSaveCampaign={handleSaveCampaign}
                handleDeleteCampaign={handleDeleteCampaign}
                campaignFormData={campaignFormData}
                setCampaignFormData={setCampaignFormData}
                editingCampaign={editingCampaign}
                setEditingCampaign={setEditingCampaign}
                isCampaignModalOpen={isCampaignModalOpen}
                setIsCampaignModalOpen={setIsCampaignModalOpen}
              />
            )}
          </div>
        </main>
      </div>

      {/* New Email Modal */}
      <AnimatePresence>
        {isNewEmailModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary-dark/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">{editingCampaign ? 'Edit Email Campaign' : 'Compose Email Campaign'}</h2>
                <button onClick={() => { setIsNewEmailModalOpen(false); setEditingCampaign(null); setCampaignFormData({ subject: '', category: CAMPAIGN_CATEGORIES[0], content: '', status: 'draft', recipientCount: 0 }); }} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Subject Line</label>
                    <input 
                      type="text" 
                      value={campaignFormData.subject}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                      placeholder="e.g. Summer Sale is here!"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                    <select 
                      value={campaignFormData.category}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    >
                      {CAMPAIGN_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email Content</label>
                  <textarea 
                    value={campaignFormData.content}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, content: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none min-h-[200px] font-mono text-sm"
                    placeholder="Type your email content here..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Target Segment</label>
                    <select 
                      value={campaignFormData.targetSegment || 'All segments'}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, targetSegment: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    >
                      {uniqueSegments.map(seg => <option key={seg} value={seg}>{seg}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                    <select 
                      value={campaignFormData.status}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="sent">Sent</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
                {sendResult && (
                  <div className={`p-3 rounded-lg text-sm font-bold ${sendResult.failureCount > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'} mb-2`}>
                    Campaign processing complete! Successfully sent: {sendResult.successCount}. Failed: {sendResult.failureCount}.
                    {sendResult.errorMessage && (
                      <p className="mt-1 font-normal opacity-80 break-all text-xs">Error: {sendResult.errorMessage}</p>
                    )}
                  </div>
                )}
                <div className="flex justify-between items-center w-full">
                  <button type="button" onClick={() => { setIsNewEmailModalOpen(false); setEditingCampaign(null); setCampaignFormData({ subject: '', category: CAMPAIGN_CATEGORIES[0], content: '', status: 'draft', targetSegment: 'All segments', recipientCount: 0 }); setSendResult(null); }} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Close</button>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleSaveCampaign}
                      disabled={isSending}
                      className="px-6 py-2 bg-white border border-slate-200 hover:border-amber-400 text-slate-700 text-sm font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                    >
                      Save Draft
                    </button>
                    <button 
                      onClick={() => handleSendCampaign(campaignFormData)}
                      disabled={isSending || !campaignFormData.subject || !campaignFormData.content}
                      className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-primary-dark text-sm font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSending && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isSending ? 'Sending via Resend...' : 'Send Campaign'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
