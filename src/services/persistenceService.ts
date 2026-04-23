import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { EmailCampaign, Template, Recipient, INITIAL_CAMPAIGNS, INITIAL_TEMPLATES, INITIAL_RECIPIENTS } from '../types';

const LOCAL_STORAGE_KEYS = {
  CAMPAIGNS: 'email_campaigns',
  TEMPLATES: 'email_templates',
  RECIPIENTS: 'email_recipients',
  NOTIFICATIONS: 'marketing_notifications',
  SETTINGS: 'marketing_settings',
  SOCIAL_LINKS: 'marketing_social_links'
};

export const persistenceService = {
  // Campaigns
  async saveCampaign(campaign: EmailCampaign) {
    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'campaigns', campaign.id), campaign);
    } else {
      const campaigns = this.getLocalCampaigns();
      const index = campaigns.findIndex(c => c.id === campaign.id);
      if (index >= 0) {
        campaigns[index] = campaign;
      } else {
        campaigns.unshift(campaign);
      }
      localStorage.setItem(LOCAL_STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
      window.dispatchEvent(new Event('storage_campaigns'));
    }
  },

  async deleteCampaign(id: string) {
    if (isFirebaseConfigured) {
      await deleteDoc(doc(db, 'campaigns', id));
    } else {
      const campaigns = this.getLocalCampaigns();
      const filtered = campaigns.filter(c => c.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEYS.CAMPAIGNS, JSON.stringify(filtered));
      window.dispatchEvent(new Event('storage_campaigns'));
    }
  },

  getLocalCampaigns(): EmailCampaign[] {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.CAMPAIGNS);
    return stored ? JSON.parse(stored) : INITIAL_CAMPAIGNS;
  },

  subscribeToCampaigns(callback: (campaigns: EmailCampaign[]) => void) {
    if (isFirebaseConfigured) {
      const campaignsRef = collection(db, 'campaigns');
      return onSnapshot(campaignsRef, (snapshot) => {
        const campaigns = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as EmailCampaign[];
        callback(campaigns);
      });
    } else {
      callback(this.getLocalCampaigns());
      const handleStorage = () => callback(this.getLocalCampaigns());
      window.addEventListener('storage_campaigns', handleStorage);
      return () => window.removeEventListener('storage_campaigns', handleStorage);
    }
  },

  // Templates
  async saveTemplate(template: Template) {
    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'templates', template.id), template);
    } else {
      const templates = this.getLocalTemplates();
      const index = templates.findIndex(t => t.id === template.id);
      if (index >= 0) {
        templates[index] = template;
      } else {
        templates.unshift(template);
      }
      localStorage.setItem(LOCAL_STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
      window.dispatchEvent(new Event('storage_templates'));
    }
  },

  async deleteTemplate(id: string) {
    if (isFirebaseConfigured) {
      await deleteDoc(doc(db, 'templates', id));
    } else {
      const templates = this.getLocalTemplates();
      const filtered = templates.filter(t => t.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEYS.TEMPLATES, JSON.stringify(filtered));
      window.dispatchEvent(new Event('storage_templates'));
    }
  },

  getLocalTemplates(): Template[] {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.TEMPLATES);
    return stored ? JSON.parse(stored) : INITIAL_TEMPLATES;
  },

  subscribeToTemplates(callback: (templates: Template[]) => void) {
    if (isFirebaseConfigured) {
      const templatesRef = collection(db, 'templates');
      return onSnapshot(templatesRef, (snapshot) => {
        const templates = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Template[];
        callback(templates);
      });
    } else {
      callback(this.getLocalTemplates());
      const handleStorage = () => callback(this.getLocalTemplates());
      window.addEventListener('storage_templates', handleStorage);
      return () => window.removeEventListener('storage_templates', handleStorage);
    }
  },

  // Recipients
  async saveRecipient(recipient: Recipient) {
    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'recipients', recipient.id), recipient);
    } else {
      const recipients = this.getLocalRecipients();
      const index = recipients.findIndex(r => r.id === recipient.id);
      if (index >= 0) {
        recipients[index] = recipient;
      } else {
        recipients.unshift(recipient);
      }
      localStorage.setItem(LOCAL_STORAGE_KEYS.RECIPIENTS, JSON.stringify(recipients));
      window.dispatchEvent(new Event('storage_recipients'));
    }
  },

  async deleteRecipient(id: string) {
    if (isFirebaseConfigured) {
      await deleteDoc(doc(db, 'recipients', id));
    } else {
      const recipients = this.getLocalRecipients();
      const filtered = recipients.filter(r => r.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEYS.RECIPIENTS, JSON.stringify(filtered));
      window.dispatchEvent(new Event('storage_recipients'));
    }
  },

  getLocalRecipients(): Recipient[] {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.RECIPIENTS);
    return stored ? JSON.parse(stored) : INITIAL_RECIPIENTS;
  },

  subscribeToRecipients(callback: (recipients: Recipient[]) => void) {
    if (isFirebaseConfigured) {
      const recipientsRef = collection(db, 'recipients');
      return onSnapshot(recipientsRef, (snapshot) => {
        const recipients = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Recipient[];
        callback(recipients);
      });
    } else {
      callback(this.getLocalRecipients());
      const handleStorage = () => callback(this.getLocalRecipients());
      window.addEventListener('storage_recipients', handleStorage);
      return () => window.removeEventListener('storage_recipients', handleStorage);
    }
  },

  // Notifications
  async addNotification(notification: any) {
    if (isFirebaseConfigured) {
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: serverTimestamp()
      });
    } else {
      const notifs = this.getLocalNotifications();
      const newNotif = {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        read: false
      };
      notifs.unshift(newNotif);
      localStorage.setItem(LOCAL_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs.slice(0, 50)));
      window.dispatchEvent(new Event('storage_notifications'));
    }
  },

  getLocalNotifications(): any[] {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.NOTIFICATIONS);
    return stored ? JSON.parse(stored) : [];
  },

  subscribeToNotifications(userId: string | null, callback: (notifs: any[]) => void) {
    if (isFirebaseConfigured) {
      const targetUserId = userId || 'guest_user';
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', targetUserId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      return onSnapshot(q, (snapshot) => {
        const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(notifs);
      });
    } else {
      callback(this.getLocalNotifications());
      const handleNotifUpdate = () => callback(this.getLocalNotifications());
      window.addEventListener('storage_notifications', handleNotifUpdate);
      return () => window.removeEventListener('storage_notifications', handleNotifUpdate);
    }
  },

  // Settings & Social Links
  async saveSocialLinks(links: any) {
    if (isFirebaseConfigured) {
      await setDoc(doc(db, 'settings', 'social_links'), links);
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEYS.SOCIAL_LINKS, JSON.stringify(links));
      window.dispatchEvent(new Event('storage_settings'));
    }
  },

  subscribeToSocialLinks(callback: (links: any) => void) {
    if (isFirebaseConfigured) {
      return onSnapshot(doc(db, 'settings', 'social_links'), (snapshot) => {
        if (snapshot.exists()) callback(snapshot.data());
      });
    } else {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.SOCIAL_LINKS);
      if (stored) callback(JSON.parse(stored));
      const handleSettingsUpdate = () => {
        const s = localStorage.getItem(LOCAL_STORAGE_KEYS.SOCIAL_LINKS);
        if (s) callback(JSON.parse(s));
      };
      window.addEventListener('storage_settings', handleSettingsUpdate);
      return () => window.removeEventListener('storage_settings', handleSettingsUpdate);
    }
  }
};

