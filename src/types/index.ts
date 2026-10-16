export type LeadMode = 'service_leads' | 'export_buyers';

export type LeadStatus =
  | 'New'
  | 'Qualified'
  | 'Draft Ready'
  | 'Awaiting Approval'
  | 'Approved'
  | 'Sent'
  | 'Replied'
  | 'Follow-up Due'
  | 'Converted'
  | 'Not Interested'
  | 'Bounced'
  | 'Unsubscribed'
  | 'Do Not Contact';

export type EmailVerificationStatus = 'Deliverable' | 'Risky' | 'Undeliverable' | 'Unknown';

export interface Lead {
  id: string;
  leadMode: LeadMode;
  companyName: string;
  industry: string;
  country: string;
  regionCity: string;
  companyWebsite: string;
  companyDomain: string;
  companyLinkedInUrl?: string;
  companySize: string; // e.g. "50-200"
  contactFirstName: string;
  contactLastName: string;
  contactFullName: string;
  jobTitle: string;
  department: string;
  professionalLinkedInUrl?: string;
  businessEmail: string;
  emailVerificationStatus: EmailVerificationStatus;
  emailConfidenceScore?: number;
  publicBusinessPhone?: string;
  sourceProvider: 'Apollo.io' | 'Hunter.io' | 'Trade Directory' | 'Web Sourced' | 'Demo Mode';
  sourceUrl?: string;
  sourceRetrievalDate: string;
  leadScore: number; // 0-100
  leadScoreReason: string;
  potentialFit: string;
  recommendedService?: string; // from 10 DataGalactic services
  leadStatus: LeadStatus;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  notes: string[];
  isDoNotContact: boolean;
  isDuplicate?: boolean;
  duplicateOfId?: string;
  createdAt: string;
  updatedAt: string;

  // Export buyer specific
  buyerType?: 'importer' | 'distributor' | 'wholesaler' | 'retailer' | 'sourcing_company' | 'manufacturer';
  targetProductCategory?: string;
  productCertifications?: string[];
}

export type EmailTone = 'Professional' | 'Friendly' | 'Concise' | 'Formal';

export interface EmailDraft {
  id: string;
  leadId: string;
  recipientEmail: string;
  recipientName: string;
  companyName: string;
  jobTitle: string;
  subject: string;
  body: string;
  tone: EmailTone;
  recommendedService: string;
  status: 'Draft' | 'Awaiting Approval' | 'Approved' | 'Sent' | 'Rejected';
  createdAt: string;
  approvedAt?: string;
  sentAt?: string;
  messageId?: string;
  errorMessage?: string;
}

export interface FollowUpTask {
  id: string;
  leadId: string;
  leadName: string;
  companyName: string;
  email: string;
  lastEmailSentDate: string;
  dueDate: string;
  status: 'Due Today' | 'Overdue' | 'Upcoming' | 'Completed' | 'Snoozed';
  suggestedDraftSubject?: string;
  suggestedDraftBody?: string;
  cadenceDay: number; // e.g. 3, 7, 14
}

export interface ParsedSearchFilters {
  leadMode: LeadMode;
  country: string;
  region?: string;
  industry: string;
  requestedCount: number;
  employeeRange: string;
  companyKeywords: string[];
  targetJobTitles: string[];
  seniority: string[];
  businessServiceRequirements: string[];
  availableContactFields: string[];
  minimumQualityScore: number;
}

export interface IntegrationStatus {
  id: 'apollo' | 'hunter' | 'gemini' | 'gmail' | 'supabase';
  name: string;
  status: 'connected' | 'not_configured' | 'demo_mode' | 'error' | 'quota_reached';
  creditsRemaining?: number | string;
  lastTested?: string;
  message?: string;
}
