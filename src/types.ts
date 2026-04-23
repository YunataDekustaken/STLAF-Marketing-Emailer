/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ViewMode = 'dashboard' | 'campaigns' | 'templates' | 'recipients' | 'settings';

export interface EmailCampaign {
  id: string;
  subject: string;
  category: string;
  recipientCount: number;
  targetSegment?: string;
  status: 'draft' | 'sent' | 'scheduled';
  scheduledDate?: string;
  content: string;
  userId?: string;
  createdAt?: string;
}

export interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  createdAt?: string;
  userId?: string;
}

export interface Recipient {
  id: string;
  name: string;
  email: string;
  segment: string;
  addedAt?: string;
  userId?: string;
}

export const CAMPAIGN_CATEGORIES = [
  'Promotions',
  'Updates',
  'Newsletters',
  'Alerts',
  'Other'
];

export const INITIAL_CAMPAIGNS: EmailCampaign[] = [
  {
    id: 'c1',
    subject: "April Newsletter",
    category: "Newsletters",
    recipientCount: 1250,
    status: 'sent',
    content: "Legal Updates: April 2026...",
    createdAt: "2026-03-25T10:00:00Z"
  },
  {
    id: 'c2',
    subject: "Product Launch",
    category: "Updates",
    recipientCount: 0,
    status: 'draft',
    content: "Introducing our new AI Legal Assistant...",
    createdAt: "2026-04-10T10:00:00Z"
  }
];

export const INITIAL_TEMPLATES: Template[] = [
  {
    id: 't1',
    name: "Welcome Email",
    subject: "Welcome to MailersHub!",
    content: "Hi [Name],\n\nWelcome to our platform. We're excited to have you on board.",
    createdAt: "2026-01-15T10:00:00Z"
  },
  {
    id: 't2',
    name: "Monthly Newsletter (Standard)",
    subject: "Your Monthly Update",
    content: "Here is your monthly summary of our top news...",
    createdAt: "2026-02-20T10:00:00Z"
  }
];

export const INITIAL_RECIPIENTS: Recipient[] = [
  {
    id: 'r1',
    name: "Alice Johnson",
    email: "alice@example.com",
    segment: "Premium Clients",
    addedAt: "2026-03-10T10:00:00Z"
  },
  {
    id: 'r2',
    name: "Bob Smith",
    email: "bob@example.com",
    segment: "Subscribers",
    addedAt: "2026-04-05T10:00:00Z"
  }
];
