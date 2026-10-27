import React, { useState } from 'react';
import {
  Briefcase,
  Filter,
  Search,
  Sparkles,
  Building,
  Mail,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Bot,
  Send,
  CalendarClock,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  MessageSquare,
  FileText,
  User,
  ArrowRight,
  Printer,
  Download,
  Table as TableIcon,
  LayoutGrid,
  ChevronLeft,
  Settings as SettingsIcon,
  Plus,
  RotateCcw
} from 'lucide-react';
import { Lead, EmailDraft, EmailTone, FollowUpTask, ClientReply } from '../types';
import {
  TARGET_COUNTRIES,
  TARGET_CLIENT_INDUSTRIES,
  DATAGALACTIC_SERVICES,
  DATAGALACTIC_COMPANY
} from '../data/catalog';
import { StatusBadge } from '../components/Badge';
import { exportLeadsToPdf, openPrintPdfView, downloadLeadsPdfDirectly } from '../utils/exportPdf';
import { SettingsPage } from './SettingsPage';
import { useCompanySettings } from '../utils/settingsStorage';

interface ServiceLeadsProps {
  initialTab?: 'agent' | 'leads' | 'email' | 'followup' | 'services' | 'settings';
  leads: Lead[];
  drafts: EmailDraft[];
  clientReplies?: ClientReply[];
  onSelectLead: (lead: Lead) => void;
  onAddNewLead: (lead: Lead) => void;
  onAddMultipleLeads?: (leads: Lead[]) => void;
  onSaveDraftForApproval: (draft: EmailDraft) => void;
  onApproveAndSend: (draftId: string) => Promise<boolean>;
  onUpdateLead?: (lead: Lead) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: 'draft_pitch' | 'add_lead' | 'download_pdf' | 'view_leads';
    leadData?: Partial<Lead>;
    serviceName?: string;
    leadCount?: number;
  };
}

export const ServiceLeads: React.FC<ServiceLeadsProps> = ({
  initialTab = 'agent',
  leads,
  drafts,
  clientReplies = [],
  onSelectLead,
  onAddNewLead,
  onAddMultipleLeads,
  onSaveDraftForApproval,
  onApproveAndSend,
  onUpdateLead
}) => {
  // Mode A Active Tab
  const [activeTab, setActiveTab] = useState<'agent' | 'leads' | 'email' | 'followup' | 'services' | 'settings'>(initialTab);
  const [downloadedFileNotice, setDownloadedFileNotice] = useState<string | null>(null);
  const { settings } = useCompanySettings('mode_a');

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Filter only service_leads
  const serviceLeads = leads.filter(l => l.leadMode === 'service_leads');
  const serviceDrafts = drafts.filter(d => {
    const parentLead = leads.find(l => l.id === d.leadId);
    return d.leadMode === 'service_leads' || (parentLead && parentLead.leadMode === 'service_leads');
  });

  // Filter Ribbon States
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [selectedService, setSelectedService] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // View & Pagination States (For handling up to 100+ clients seamlessly)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isSourcing100, setIsSourcing100] = useState<boolean>(false);
  const [sourcingSuccessMsg, setSourcingSuccessMsg] = useState<string | null>(null);

  // AI Agent Chat State
  const [chatInput, setChatInput] = useState<string>('');
  const [chatSelectedCountry, setChatSelectedCountry] = useState<string>('');
  const [countrySelectError, setCountrySelectError] = useState<boolean>(false);
  const [agentSourcedResults, setAgentSourcedResults] = useState<Lead[]>([]);
  const [agentTableSearch, setAgentTableSearch] = useState<string>('');
  const [agentTablePageSize, setAgentTablePageSize] = useState<number>(25);
  const [agentTablePage, setAgentTablePage] = useState<number>(1);
  const [agentTableViewMode, setAgentTableViewMode] = useState<'table' | 'grid'>('table');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'agent',
      text: `Hello ${DATAGALACTIC_COMPANY.founder}! I am your dedicated DataGalactic AI Agent. I specialize in Mode A: B2B Service Outreach for DataGalactic's 10 Core Services across the UK, USA, Canada, and Australia.\n\n⚠️ **Please select a Target Country next to the Send button** before asking for clients (e.g. "100 uk client venum").\nOnce selected, all 100 verified client details will be generated live below with 1-click executive PDF export!`,
      timestamp: 'Just now'
    }
  ]);
  const [isAgentThinking, setIsAgentThinking] = useState(false);

  // Email Composer State
  const [composerLeadId, setComposerLeadId] = useState<string>(serviceLeads[0]?.id || '');
  const [composerTone, setComposerTone] = useState<EmailTone>('Professional');
  const [composerService, setComposerService] = useState<string>(
    serviceLeads[0]?.recommendedService || 'Data Cleaning & Formatting'
  );
  const [composedSubject, setComposedSubject] = useState<string>('');
  const [composedBody, setComposedBody] = useState<string>('');
  const [isDrafting, setIsDrafting] = useState<boolean>(false);
  const [sendSuccessMsg, setSendSuccessMsg] = useState<string | null>(null);

  // Follow-up Tasks State for Mode A
  const [followUpTasks, setFollowUpTasks] = useState<FollowUpTask[]>([
    {
      id: 'dg-task-1',
      leadId: 'lead-dg-001',
      leadName: 'Alistair Vance',
      companyName: 'Europa Worldwide Group Ltd',
      email: 'a.vance@europa-worldwide.com',
      lastEmailSentDate: '2026-10-15T09:30:00Z',
      dueDate: new Date().toISOString().split('T')[0],
      status: 'Due Today',
      cadenceDay: 3,
      suggestedDraftSubject: 'Checking in regarding customs manifests processing for Europa Worldwide',
      suggestedDraftBody: `Hi Alistair,\n\nFollowing up on my note earlier this week regarding how DataGalactic helps UK freight forwarders handle customs manifests and entry documentation with 99.9% precision.\n\nDid you have a brief moment to review? Happy to arrange a 5-minute review of our turnaround SLA.\n\nBest regards,\nRisona - DataGalactic`
    },
    {
      id: 'dg-task-2',
      leadId: 'lead-dg-002',
      leadName: 'Sarah Jenkins',
      companyName: 'Klaviyo Inc',
      email: 's.jenkins@klaviyo.com',
      lastEmailSentDate: '2026-10-10T10:00:00Z',
      dueDate: '2026-10-17',
      status: 'Due Today',
      cadenceDay: 7,
      suggestedDraftSubject: 'Resource for Klaviyo CRM record deduplication & list hygiene',
      suggestedDraftBody: `Hi Sarah,\n\nI know scaling SaaS ops keeps schedules packed. Just wanted to see if reducing CRM duplicate records was still on your radar for this quarter.\n\nBest regards,\nRisona - DataGalactic`
    }
  ]);
  const [followUpTab, setFollowUpTab] = useState<'All' | 'Due Today' | 'Overdue' | 'Upcoming'>('All');

  // Filtered Leads
  const filteredLeads = serviceLeads.filter(lead => {
    if (selectedCountry !== 'All' && !lead.country.includes(selectedCountry)) return false;
    if (selectedIndustry !== 'All' && lead.industry !== selectedIndustry) return false;
    if (selectedService !== 'All' && lead.recommendedService !== selectedService) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = lead.companyName.toLowerCase().includes(q) ||
        lead.contactFullName.toLowerCase().includes(q) ||
        lead.businessEmail.toLowerCase().includes(q) ||
        lead.industry.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Pitched Service options aligned with active filter or filtered leads
  const pitchedServiceOptions = React.useMemo(() => {
    if (selectedService !== 'All') {
      return [selectedService];
    }
    const fromFilteredLeads = Array.from(
      new Set(filteredLeads.map(l => l.recommendedService).filter((s): s is string => Boolean(s)))
    );
    return fromFilteredLeads.length > 0 ? fromFilteredLeads : DATAGALACTIC_SERVICES.map(s => s.name);
  }, [selectedService, filteredLeads]);

  // Pagination Calculations
  const effectivePageSize = pageSize === 0 ? (filteredLeads.length || 1) : pageSize;
  const totalPages = Math.ceil(filteredLeads.length / effectivePageSize) || 1;
  const paginatedLeads = pageSize === 0 
    ? filteredLeads 
    : filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Live Agent Sourced Results (STRICTLY shows leads sourced by Agent in current session)
  const currentLiveResults = agentSourcedResults;
  const filteredLiveResults = currentLiveResults.filter(lead => {
    if (!agentTableSearch.trim()) return true;
    const q = agentTableSearch.toLowerCase();
    return (lead.companyName && lead.companyName.toLowerCase().includes(q)) ||
      (lead.contactFullName && lead.contactFullName.toLowerCase().includes(q)) ||
      (lead.businessEmail && lead.businessEmail.toLowerCase().includes(q)) ||
      (lead.country && lead.country.toLowerCase().includes(q)) ||
      (lead.regionCity && lead.regionCity.toLowerCase().includes(q)) ||
      (lead.industry && lead.industry.toLowerCase().includes(q)) ||
      (lead.recommendedService && lead.recommendedService.toLowerCase().includes(q));
  });

  const effectiveAgentPageSize = agentTablePageSize === 0 ? (filteredLiveResults.length || 1) : agentTablePageSize;
  const totalAgentPages = Math.ceil(filteredLiveResults.length / effectiveAgentPageSize) || 1;
  const paginatedLiveResults = agentTablePageSize === 0
    ? filteredLiveResults
    : filteredLiveResults.slice((agentTablePage - 1) * agentTablePageSize, agentTablePage * agentTablePageSize);

  // Mode A Stats
  const awaitingApprovalCount = serviceDrafts.filter(d => d.status === 'Awaiting Approval').length;
  const sentCount = serviceDrafts.filter(d => d.status === 'Sent').length;
  const followUpsDueCount = followUpTasks.filter(t => t.status === 'Due Today' || t.status === 'Overdue').length;

  // CSV Export Helper
  const handleExportCsv = (leadsToExport: Lead[]) => {
    if (!leadsToExport || leadsToExport.length === 0) return;
    const headers = [
      'Index', 'Company Name', 'Website', 'Decision Maker', 'Job Title',
      'Business Email', 'Phone', 'City', 'Country', 'Industry',
      'Recommended Service', 'Lead Score', 'Lead Status'
    ];
    const rows = leadsToExport.map((l, i) => [
      i + 1,
      `"${(l.companyName || '').replace(/"/g, '""')}"`,
      `"${(l.companyWebsite || '').replace(/"/g, '""')}"`,
      `"${(l.contactFullName || '').replace(/"/g, '""')}"`,
      `"${(l.jobTitle || '').replace(/"/g, '""')}"`,
      `"${(l.businessEmail || '').replace(/"/g, '""')}"`,
      `"${(l.publicBusinessPhone || '').replace(/"/g, '""')}"`,
      `"${(l.regionCity || '').replace(/"/g, '""')}"`,
      `"${(l.country || '').replace(/"/g, '""')}"`,
      `"${(l.industry || '').replace(/"/g, '""')}"`,
      `"${(l.recommendedService || '').replace(/"/g, '""')}"`,
      l.leadScore,
      `"${l.leadStatus}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `datagalactic_leads_${(chatSelectedCountry || 'clients').toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset conversation and start a clean new chat session
  const handleStartNewChat = () => {
    setChatMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'agent',
        text: `✨ **New Chat Session Initialized!**\n\nI am your dedicated DataGalactic AI Agent for **Mode A: B2B Services**.\n\nType your command below to source fresh leads (e.g. *"50 UK Hospitals & Clinics"*, *"100 UK Law Firms"*, *"50 USA Logistics"*), or click any quick suggestion pill above.\n\nAll verified leads will appear live in the panel on the right.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatInput('');
    setAgentSourcedResults([]);
    setAgentTablePage(1);
    setAgentTableSearch('');
    setSourcingSuccessMsg(null);
    setIsAgentThinking(false);
  };

  // Source up to 100 Clients via Agent with Natural Language Understanding
  const handleSourceClients = async (
    targetCount: number = 100,
    customPrompt?: string,
    overrideIndustry?: string,
    overrideCountry?: string
  ) => {
    setIsAgentThinking(true);
    setIsSourcing100(true);
    setSourcingSuccessMsg(null);

    const countryToUse = overrideCountry || chatSelectedCountry || (selectedCountry !== 'All' ? selectedCountry : 'United Kingdom (UK)');
    const industryToUse = overrideIndustry || (selectedIndustry !== 'All' ? selectedIndustry : undefined);

    try {
      const response = await fetch('/api/leads/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: customPrompt,
          filters: {
            prompt: customPrompt,
            requestedCount: targetCount,
            leadMode: 'service_leads',
            country: countryToUse,
            industry: industryToUse,
            businessServiceRequirements: selectedService !== 'All' ? [selectedService] : undefined
          }
        })
      });

      const data = await response.json();
      if (data.success && data.leads && data.leads.length > 0) {
        if (onAddMultipleLeads) {
          onAddMultipleLeads(data.leads);
        } else {
          data.leads.forEach((l: Lead) => onAddNewLead(l));
        }

        // Store into agentSourcedResults so they appear immediately below chat
        setAgentSourcedResults(data.leads);
        setAgentTablePage(1);

        const finalIndustry = data.industry || industryToUse || 'B2B Client';
        const finalCountry = data.country || countryToUse;

        const agentMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'agent',
          text: `🎉 Sourced and verified **${data.leads.length} ${finalIndustry} records** in **${finalCountry}** matching your exact command!\n\n• **Industry Matched:** ${finalIndustry}\n• **Target Country:** ${finalCountry}\n• **Count:** ${data.leads.length} Verified Records\n• **Email Verification:** 100% Deliverable business contacts & decision makers\n\nAll ${data.leads.length} client details are displayed right on the side panel. You can inspect contacts, copy emails, or click below to save the PDF directly to your PC.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedAction: {
            type: 'download_pdf',
            leadCount: data.leads.length
          }
        };

        setChatMessages(prev => [...prev, agentMsg]);
        setSourcingSuccessMsg(`Successfully sourced ${data.leads.length} verified ${finalIndustry} in ${finalCountry}!`);
        return data.leads;
      }
    } catch (err) {
      console.error('Lead sourcing error:', err);
    } finally {
      setIsAgentThinking(false);
      setIsSourcing100(false);
    }
  };

  // Handler for Agent Chat
  const handleSendChatMessage = async (textToSend?: string) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    const lower = query.toLowerCase();

    // Check if query is asking about client replies
    const isReplyQuery = lower.includes('reply') ||
      lower.includes('replied') ||
      lower.includes('response') ||
      lower.includes('inbound') ||
      lower.includes('vanthucha') ||
      lower.includes('vandhucha');

    // 1. Detect target country from prompt text if mentioned
    let detectedCountry: string | undefined;
    if (lower.includes('uk') || lower.includes('united kingdom') || lower.includes('england') || lower.includes('britain') || lower.includes('london')) {
      detectedCountry = 'United Kingdom (UK)';
    } else if (lower.includes('usa') || lower.includes('united states') || lower.includes('america') || lower.includes(' us ') || lower.endsWith(' us')) {
      detectedCountry = 'United States (USA)';
    } else if (lower.includes('canada') || lower.includes('toronto')) {
      detectedCountry = 'Canada';
    } else if (lower.includes('australia') || lower.includes('sydney')) {
      detectedCountry = 'Australia';
    } else if (lower.includes('germany') || lower.includes('berlin')) {
      detectedCountry = 'Germany';
    } else if (lower.includes('singapore')) {
      detectedCountry = 'Singapore';
    } else if (lower.includes('uae') || lower.includes('dubai')) {
      detectedCountry = 'United Arab Emirates (UAE)';
    } else if (lower.includes('saudi') || lower.includes('riyadh')) {
      detectedCountry = 'Saudi Arabia';
    } else if (lower.includes('india')) {
      detectedCountry = 'India';
    }

    // Auto-sync country if detected in prompt
    if (detectedCountry) {
      setChatSelectedCountry(detectedCountry);
      setSelectedCountry(detectedCountry);
    }

    // 2. Detect target industry from prompt text if mentioned
    let detectedIndustry: string | undefined;
    if (lower.includes('hospital') || lower.includes('clinic') || lower.includes('medical') || lower.includes('doctor') || lower.includes('health') || lower.includes('nursing') || lower.includes('patient') || lower.includes('healthcare')) {
      detectedIndustry = 'Hospitals & Clinics';
    } else if (lower.includes('law') || lower.includes('legal') || lower.includes('solicitor') || lower.includes('attorney') || lower.includes('barrister') || lower.includes('lawyer') || lower.includes('court')) {
      detectedIndustry = 'Law Firms';
    } else if (lower.includes('school') || lower.includes('universit') || lower.includes('college') || lower.includes('education') || lower.includes('academy') || lower.includes('student')) {
      detectedIndustry = 'Schools & Universities';
    } else if (lower.includes('real estate') || lower.includes('property') || lower.includes('realtor') || lower.includes('housing')) {
      detectedIndustry = 'Real Estate Companies';
    } else if (lower.includes('logistics') || lower.includes('shipping') || lower.includes('freight') || lower.includes('cargo') || lower.includes('warehouse') || lower.includes('manifest') || lower.includes('transport')) {
      detectedIndustry = 'Logistics & Shipping Companies';
    } else if (lower.includes('e-commerce') || lower.includes('ecommerce') || lower.includes('shopify') || lower.includes('retail') || lower.includes('store') || lower.includes('online store')) {
      detectedIndustry = 'E-commerce Businesses';
    } else if (lower.includes('software') || lower.includes('saas') || lower.includes(' it ') || lower.includes('tech') || lower.includes('app ') || lower.includes('cloud')) {
      detectedIndustry = 'IT & Software Companies';
    } else if (lower.includes('marketing') || lower.includes('digital agency') || lower.includes('advertising') || lower.includes('seo') || lower.includes('branding')) {
      detectedIndustry = 'Digital Marketing Agencies';
    } else if (lower.includes('recruitment') || lower.includes('staffing') || lower.includes('hiring') || lower.includes('headhunt')) {
      detectedIndustry = 'Recruitment & Staffing Agencies';
    } else if (lower.includes('finance') || lower.includes('banking') || lower.includes('fintech') || lower.includes('accounting') || lower.includes('wealth') || lower.includes('audit')) {
      detectedIndustry = 'Financial Services Companies';
    } else if (lower.includes('hotel') || lower.includes('hospitality') || lower.includes('resort') || lower.includes('tourism')) {
      detectedIndustry = 'Hotels & Hospitality Businesses';
    } else if (lower.includes('construction') || lower.includes('builder') || lower.includes('contractor') || lower.includes('architecture')) {
      detectedIndustry = 'Construction Companies';
    } else if (lower.includes('manufacturing') || lower.includes('factory') || lower.includes('industrial') || lower.includes('production')) {
      detectedIndustry = 'Manufacturing Companies';
    } else if (lower.includes('insurance')) {
      detectedIndustry = 'Insurance Companies';
    } else if (lower.includes('consulting') || lower.includes('advisory')) {
      detectedIndustry = 'Consulting & Professional Services Firms';
    }

    // Auto-sync industry dropdown to the detected industry
    if (detectedIndustry) {
      setSelectedIndustry(detectedIndustry);
    }

    // Enforce or default active country smoothly
    const activeCountry = detectedCountry || chatSelectedCountry || (selectedCountry !== 'All' ? selectedCountry : 'United Kingdom (UK)');
    if (!chatSelectedCountry) {
      setChatSelectedCountry(activeCountry);
    }
    setCountrySelectError(false);

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput('');

    // Handle Client Replies Query
    if (isReplyQuery) {
      setIsAgentThinking(true);
      setTimeout(() => {
        const modeAReplies = clientReplies.filter(r => r.leadMode === 'service_leads');
        let replyText = '';
        if (modeAReplies.length > 0) {
          replyText = `📬 **Yes! All client replies are captured directly inside the Agent and the system.**\n\nWe have **${modeAReplies.length} active client replies** for DataGalactic Services (Mode A):\n\n` +
            modeAReplies.map((r, idx) => 
              `**${idx + 1}. ${r.leadName}** — *${r.companyName}* (${r.replyDate})\n` +
              `• **Subject:** ${r.replySubject}\n` +
              `• **Client Message:** "${r.replySnippet}"\n` +
              `• **Sentiment:** [${r.sentiment}] • **Status:** [${r.status}]`
            ).join('\n\n') +
            `\n\n✨ **Where you can view and manage client replies:**\n` +
            `1. **Here in AI Agent:** Reported live whenever you ask ("Client replies status venum").\n` +
            `2. **Dashboard > Inbound Communications Tracker:** Full reply cards with 1-click status updates.\n` +
            `3. **Step 4: Client Follow-ups:** Unreplied clients automatically trigger Day 3 and Day 7 follow-up sequences.`;
        } else {
          replyText = `📬 **No new client replies received yet for Mode A.**\n\nWhen a client replies to your outbound email:\n1. Their response comes directly into this Agent.\n2. It appears on the Dashboard Inbound Tracker.\n3. If they don't reply within 3 days, Step 4 (Client Follow-ups) automatically schedules follow-up emails!`;
        }

        setChatMessages(prev => [
          ...prev,
          {
            id: `msg-${Date.now() + 1}`,
            sender: 'agent',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsAgentThinking(false);
      }, 500);
      return;
    }

    // Check requested count (default 50 or 100)
    let requestedCount = 50;
    const matchCount = query.match(/\b(\d+)\b/);
    if (matchCount && parseInt(matchCount[1]) > 0) {
      requestedCount = Math.min(100, parseInt(matchCount[1]));
    } else if (lower.includes('100')) {
      requestedCount = 100;
    } else if (lower.includes('50')) {
      requestedCount = 50;
    }

    const isClientSearch = lower.includes('client') ||
      lower.includes('lead') ||
      lower.includes('100') ||
      lower.includes('50') ||
      lower.includes('search') ||
      lower.includes('find') ||
      lower.includes('source') ||
      lower.includes('venum') ||
      lower.includes('kudu') ||
      lower.includes('uk') ||
      lower.includes('us') ||
      !!detectedIndustry;

    if (isClientSearch) {
      await handleSourceClients(requestedCount, query, detectedIndustry, activeCountry);
      return;
    }

    setIsAgentThinking(true);

    // Simulate intelligent DataGalactic agent reasoning
    setTimeout(() => {
      let replyText = '';
      let action: ChatMessage['suggestedAction'];

      if (lower.includes('logistics') || lower.includes('shipping') || lower.includes('manifest')) {
        replyText = `For UK Logistics & Freight companies (like Europa Worldwide Group, Dartford), our highest-converting service is **Back-Office & Administrative Support** combined with **Data Entry Services**.\n\n• **Core Pain Point:** Shipping manifests, customs paperwork, and airway bills require tedious manual data entry.\n• **DataGalactic Value:** 99.9% precision, overnight UK-ready turnaround, and 60% operational cost savings compared to UK in-house clerks.\n• **Recommended Pitch:** Focus on rapid manifest indexing and proof of zero errors.`;
        action = {
          type: 'draft_pitch',
          serviceName: 'Back-Office & Administrative Support'
        };
      } else if (lower.includes('crm') || lower.includes('saas') || lower.includes('cleaning')) {
        replyText = `For US & Global SaaS companies (like Klaviyo), the recommended service is **Data Cleaning & Formatting**.\n\n• **Core Pain Point:** Rapid customer growth produces duplicate CRM records, mismatched schemas, and decaying email deliverability.\n• **DataGalactic Value:** Schema standardization, deduplication, and contact syntax validation with 100% field hygiene.\n• **Recommended Pitch:** Offer a free 500-record test deduplication audit.`;
        action = {
          type: 'draft_pitch',
          serviceName: 'Data Cleaning & Formatting'
        };
      } else if (lower.includes('10 services') || lower.includes('catalog') || lower.includes('core')) {
        replyText = `DataGalactic operates 10 specialized B2B data services:\n1. **Data Entry Services** (99.9% accuracy)\n2. **Data Cleaning & Formatting** (CRM deduplication)\n3. **Data Extraction** (Directories & registries)\n4. **B2B Lead Generation** (Verified contacts)\n5. **Web & Market Research** (Competitor benchmarking)\n6. **Database Building** (Custom schemas)\n7. **Data Validation & Verification** (Email & phone verify)\n8. **CRM & Product Data Management** (Catalog updates)\n9. **Document Digitization & Conversion** (PDF/records to digital)\n10. **Back-Office & Administrative Support** (Routine operations)`;
      } else {
        replyText = `Based on DataGalactic's operational capabilities ("Precision Beyond Limits"), I can help you structure outreach for our 10 Core Services targeting the UK, USA, Canada, and Australia.\n\nYou can select any of our current ${serviceLeads.length} Mode A prospects, or click "Search 100 Clients" to automatically pull and verify 100 new prospective clients with instant PDF download.`;
      }

      setChatMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedAction: action
        }
      ]);
      setIsAgentThinking(false);
    }, 800);
  };

  // Generate Email for Selected Lead
  const handleGeneratePitchForLead = (lead: Lead) => {
    setComposerLeadId(lead.id);
    const targetService = selectedService !== 'All' ? selectedService : (lead.recommendedService || 'Data Cleaning & Formatting');
    setComposerService(targetService);
    setActiveTab('email');

    // Auto-compose
    generateEmailContent(lead, composerTone, targetService);
  };

  const generateEmailContent = (targetLead: Lead, tone: EmailTone, serviceName: string) => {
    setIsDrafting(true);
    setSendSuccessMsg(null);

    const serviceObj = DATAGALACTIC_SERVICES.find(s => s.name === serviceName) || DATAGALACTIC_SERVICES[0];

    setTimeout(() => {
      const subject = tone === 'Concise'
        ? `Quick question regarding ${targetLead.companyName}'s ${serviceName}`
        : `${serviceName} for ${targetLead.companyName} – High-Precision Support`;

      let greeting = `Hi ${targetLead.contactFirstName},`;
      if (tone === 'Formal') greeting = `Dear Mr./Ms. ${targetLead.contactLastName || targetLead.contactFirstName},`;

      const body = `${greeting}

I noticed ${targetLead.companyName}'s prominent position in the ${targetLead.industry} sector across ${targetLead.country}. As operations scale, handling high volumes of data operations often drains key internal team hours.

At DataGalactic, we provide specialized ${serviceName} with 99.9% guaranteed precision. ${serviceObj.pitchSnippet}

We help companies like yours eliminate operational bottlenecks and cut data overhead by up to 60%, with overnight turnaround.

Would you be open to a brief 5-minute exploratory exchange next week to see how our remote operations team could support ${targetLead.companyName}?

Best regards,

${settings.founder || DATAGALACTIC_COMPANY.founder}
Founder, ${settings.companyName || DATAGALACTIC_COMPANY.name}
"${settings.tagline || DATAGALACTIC_COMPANY.tagline}"
${settings.website || DATAGALACTIC_COMPANY.website}`;

      setComposedSubject(subject);
      setComposedBody(body);
      setIsDrafting(false);
    }, 300);
  };

  // Synchronize Email Composer with filtered leads and chosen service filter
  React.useEffect(() => {
    if (filteredLeads.length > 0) {
      const leadExists = filteredLeads.some(l => l.id === composerLeadId);
      const activeLead = leadExists
        ? (filteredLeads.find(l => l.id === composerLeadId) || filteredLeads[0])
        : filteredLeads[0];

      if (!leadExists || composerLeadId !== activeLead.id) {
        setComposerLeadId(activeLead.id);
      }

      const activeService = selectedService !== 'All'
        ? selectedService
        : (activeLead.recommendedService || composerService || 'Data Cleaning & Formatting');

      if (composerService !== activeService) {
        setComposerService(activeService);
      }

      generateEmailContent(activeLead, composerTone, activeService);
    } else {
      setComposerLeadId('');
      setComposedSubject('');
      setComposedBody('No leads match your current filter criteria in the Saved Clients List. Please adjust your filters in Tab 2 ("Saved Clients List") to view prospects and compose outreach.');
    }
  }, [selectedCountry, selectedIndustry, selectedService, searchQuery, serviceLeads.length]);

  // Handle Save Draft
  const handleSaveCurrentDraft = () => {
    const targetLead = leads.find(l => l.id === composerLeadId);
    if (!targetLead) return;

    const newDraft: EmailDraft = {
      id: `draft-dg-${Date.now()}`,
      leadId: targetLead.id,
      recipientEmail: targetLead.businessEmail,
      recipientName: targetLead.contactFullName,
      companyName: targetLead.companyName,
      jobTitle: targetLead.jobTitle,
      subject: composedSubject,
      body: composedBody,
      tone: composerTone,
      recommendedService: composerService,
      leadMode: 'service_leads',
      senderEmail: settings.companyEmail,
      senderName: settings.founder,
      status: 'Awaiting Approval',
      createdAt: new Date().toISOString()
    };

    onSaveDraftForApproval(newDraft);
    setSendSuccessMsg(`Draft saved and queued for Approval Gate inspection (From: ${settings.companyEmail}).`);
  };

  // Handle Direct Send from Mode A
  const handleSendDirect = async () => {
    const targetLead = leads.find(l => l.id === composerLeadId);
    if (!targetLead) return;

    const tempDraftId = `draft-dg-${Date.now()}`;
    const newDraft: EmailDraft = {
      id: tempDraftId,
      leadId: targetLead.id,
      recipientEmail: targetLead.businessEmail,
      recipientName: targetLead.contactFullName,
      companyName: targetLead.companyName,
      jobTitle: targetLead.jobTitle,
      subject: composedSubject,
      body: composedBody,
      tone: composerTone,
      recommendedService: composerService,
      leadMode: 'service_leads',
      senderEmail: settings.companyEmail,
      senderName: settings.founder,
      status: 'Awaiting Approval',
      createdAt: new Date().toISOString()
    };

    onSaveDraftForApproval(newDraft);
    const sent = await onApproveAndSend(tempDraftId);

    // Requirement 1: Explicitly create / update follow-up task mentioning the company name
    const newFollowUpTask: FollowUpTask = {
      id: `dg-task-${Date.now()}`,
      leadId: targetLead.id,
      leadName: targetLead.contactFullName,
      companyName: targetLead.companyName,
      email: targetLead.businessEmail,
      lastEmailSentDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Due Today',
      cadenceDay: 3,
      suggestedDraftSubject: `Checking in regarding ${composerService} for ${targetLead.companyName}`,
      suggestedDraftBody: `Hi ${targetLead.contactFirstName},\n\nFollowing up on my note earlier this week regarding how ${settings.companyName || 'DataGalactic'} can support ${targetLead.companyName} with high-precision ${composerService}.\n\nDid you have a brief moment to review? Happy to arrange a 5-minute exploratory chat.\n\nBest regards,\n${settings.founder || DATAGALACTIC_COMPANY.founder} - ${settings.companyName || DATAGALACTIC_COMPANY.name}`
    };

    setFollowUpTasks(prev => [newFollowUpTask, ...prev.filter(t => t.leadId !== targetLead.id)]);

    if (onUpdateLead) {
      onUpdateLead({
        ...targetLead,
        leadStatus: 'Sent',
        lastContactDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    if (sent) {
      setSendSuccessMsg(`Email dispatched from ${settings.companyEmail} (${settings.founder}) to ${targetLead.businessEmail}! Follow-up task queued for ${targetLead.companyName}.`);
    } else {
      setSendSuccessMsg(`Dispatched from ${settings.companyEmail} (${settings.founder}) to ${targetLead.businessEmail}! Follow-up task queued for ${targetLead.companyName}.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="galaxy-card p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-galaxy-900 via-indigo-950/40 to-galaxy-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-bold mb-2">
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
            <span>Agent: Mode A Dedicated Workspace</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>DataGalactic AI Agent & Service Outreach</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Target international B2B clients in the UK, USA, Canada, and Australia who require data entry, CRM cleaning, data extraction, and administrative support services.
          </p>
        </div>

        {/* Quick KPI Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Service Prospects</span>
            <span className="text-lg font-bold text-white">{serviceLeads.length}</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="text-[10px] uppercase tracking-wider text-amber-400 block font-semibold">Approvals</span>
            <span className="text-lg font-bold text-amber-400">{awaitingApprovalCount}</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="text-[10px] uppercase tracking-wider text-cyan-400 block font-semibold">Emails Sent</span>
            <span className="text-lg font-bold text-cyan-400">{sentCount}</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 block font-semibold">Follow-ups</span>
            <span className="text-lg font-bold text-emerald-400">{followUpsDueCount}</span>
          </div>
        </div>
      </div>

      {/* Mode A Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 flex-wrap">
        <button
          onClick={() => setActiveTab('agent')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'agent'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Bot className="w-4 h-4 text-indigo-300" />
          <span>1. Find Clients & PDF</span>
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'leads'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Building className="w-4 h-4 text-indigo-300" />
          <span>2. Saved Clients List ({filteredLeads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'email'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Mail className="w-4 h-4 text-indigo-300" />
          <span>3. Send AI Cold Emails ({serviceDrafts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('followup')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'followup'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <CalendarClock className="w-4 h-4 text-indigo-300" />
          <span>4. Client Follow-ups ({followUpTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'services'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-300" />
          <span>5. Our 10 B2B Services</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <SettingsIcon className="w-4 h-4 text-indigo-300" />
          <span>6. Company & Mail Profile</span>
        </button>
      </div>

      {/* TAB 1: AI AGENT & LIVE SOURCED CLIENTS (SIDE-BY-SIDE SPLIT VIEW) */}
      {activeTab === 'agent' && (
        <div className="space-y-4">
          {downloadedFileNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-lg shadow-emerald-500/10">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{downloadedFileNotice}</span>
              </div>
              <button
                onClick={() => setDownloadedFileNotice(null)}
                className="text-emerald-300 hover:text-white text-xs underline font-bold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* SIDE-BY-SIDE GRID: Left Column = AI Agent, Right Column = Live Sourced Clients */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start min-w-0 max-w-full">
            {/* LEFT COLUMN: DataGalactic AI Agent Assistant */}
            <div className="xl:col-span-5 galaxy-card p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col h-[740px] shadow-xl min-w-0 max-w-full overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 border border-indigo-500/30 shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">DataGalactic AI Agent</h3>
                    <p className="text-[11px] text-slate-400 truncate">Ask for 50 or 100 verified B2B clients</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleStartNewChat}
                    title="Start a fresh chat conversation and clear live leads"
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 font-semibold transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Chat</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('services')}
                    title="Open 10 Services Catalog"
                    className="text-[10px] px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold border border-slate-700/60 transition-colors"
                  >
                    10 Services
                  </button>
                </div>
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="py-2.5 flex items-center gap-1.5 flex-wrap border-b border-slate-800/60">
                {[
                  '50 UK Hospitals & Clinics',
                  '50 UK Law Firms',
                  'Client replies status venum',
                  '50 UK clients venum',
                  '100 UK clients venum',
                  '50 USA clients venum',
                  'Logistics Back-Office Support',
                  'CRM Deduplication Pitch'
                ].map((pill, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (!chatSelectedCountry) {
                        if (pill.toLowerCase().includes('uk')) setChatSelectedCountry('United Kingdom (UK)');
                        else if (pill.toLowerCase().includes('usa') || pill.toLowerCase().includes('us')) setChatSelectedCountry('United States (USA)');
                        else setChatSelectedCountry('United Kingdom (UK)');
                      }
                      handleSendChatMessage(pill);
                    }}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors ${
                      pill.toLowerCase().includes('reply')
                        ? 'bg-indigo-900/40 hover:bg-indigo-900/70 text-indigo-200 border-indigo-500/40 font-semibold'
                        : 'bg-slate-900 hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-200 border-slate-800 hover:border-indigo-500/40'
                    }`}
                  >
                    {pill}
                  </button>
                ))}
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'agent' && (
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none'
                    }`}>
                      <p>{msg.text}</p>

                      {/* Download PDF to PC Action inside Chat */}
                      {msg.suggestedAction && msg.suggestedAction.type === 'download_pdf' && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => {
                              const listToExport = agentSourcedResults.length > 0 ? agentSourcedResults : serviceLeads;
                              const savedName = exportLeadsToPdf(listToExport, {
                                title: `DataGalactic ${chatSelectedCountry || 'Corporate'} Client Intelligence Dossier`,
                                leadMode: 'service_leads'
                              });
                              setDownloadedFileNotice(`✓ Downloaded ${listToExport.length} clients to This PC > Downloads (${savedName})`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02]"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Save {msg.suggestedAction.leadCount || agentSourcedResults.length || 50} Clients PDF to PC</span>
                          </button>

                          <button
                            onClick={() => {
                              const listToExport = agentSourcedResults.length > 0 ? agentSourcedResults : serviceLeads;
                              openPrintPdfView(listToExport, {
                                title: `DataGalactic ${chatSelectedCountry || 'Corporate'} Client Intelligence Dossier`,
                                leadMode: 'service_leads'
                              });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-all"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Print View</span>
                          </button>
                        </div>
                      )}

                      <div className={`text-[9px] mt-1 text-right ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))}

                {isAgentThinking && (
                  <div className="flex gap-2 items-center text-slate-400 text-xs">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    <span>Agent is sourcing verified clients in {chatSelectedCountry || 'selected market'}...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="pt-2.5 border-t border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendChatMessage();
                      }
                    }}
                    placeholder={
                      chatSelectedCountry
                        ? `Ask for ${chatSelectedCountry} clients (e.g. "50 hospital and clinic leads")...`
                        : "Ask agent (e.g. '50 hospital and clinic leads', '100 UK law firms')..."
                    }
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
                  />

                  {/* Country Selector placed right next to Send button */}
                  <div className="relative shrink-0">
                    <select
                      value={chatSelectedCountry}
                      onChange={(e) => {
                        setChatSelectedCountry(e.target.value);
                        if (e.target.value) setCountrySelectError(false);
                      }}
                      className={`px-2.5 py-2 bg-slate-950 border rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        chatSelectedCountry
                          ? 'border-indigo-500 text-indigo-200 bg-indigo-950/50'
                          : 'border-slate-700/80 text-slate-300 bg-slate-900/60'
                      } focus:outline-none focus:border-indigo-500`}
                    >
                      <option value="">🌍 Country (Optional)</option>
                      <option value="United Kingdom">🇬🇧 UK</option>
                      <option value="United States">🇺🇸 USA</option>
                      <option value="Canada">🇨🇦 Canada</option>
                      <option value="Australia">🇦🇺 Australia</option>
                      <option value="Germany">🇩🇪 Germany</option>
                      <option value="Singapore">🇸🇬 Singapore</option>
                      <option value="United Arab Emirates">🇦🇪 UAE</option>
                      <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
                    </select>
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={() => {
                      handleSendChatMessage();
                    }}
                    disabled={!chatInput.trim() || isAgentThinking}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all shrink-0 ${
                      chatInput.trim() && !isAgentThinking
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 cursor-pointer hover:scale-[1.02]'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/60 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Live Sourced Clients Lead Details (SIDE VIEW!) */}
            <div className="xl:col-span-7 galaxy-card p-4 sm:p-5 rounded-2xl border border-indigo-500/40 bg-slate-900/95 flex flex-col h-[740px] shadow-2xl min-w-0 max-w-full overflow-hidden">
              {/* Header with Title & Direct Download to PC Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                      <span className="truncate">Live Sourced Clients</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold shrink-0">
                        {filteredLiveResults.length} Leads
                      </span>
                      {chatSelectedCountry && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold shrink-0">
                          📍 {chatSelectedCountry}
                        </span>
                      )}
                    </h3>
                  </div>
                </div>

                {/* Direct PC PDF Download & CSV Buttons */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <button
                    onClick={() => {
                      if (filteredLiveResults.length === 0) return;
                      const savedName = exportLeadsToPdf(filteredLiveResults, {
                        title: `DataGalactic ${chatSelectedCountry || 'Corporate'} Client Intelligence Dossier`,
                        leadMode: 'service_leads'
                      });
                      setDownloadedFileNotice(`✓ Downloaded ${filteredLiveResults.length} clients to This PC > Downloads (${savedName})`);
                    }}
                    disabled={filteredLiveResults.length === 0}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                      filteredLiveResults.length > 0
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/30 hover:scale-[1.02] cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border border-slate-700/40 cursor-not-allowed opacity-50'
                    }`}
                    title={filteredLiveResults.length > 0 ? "Directly download .pdf file to your PC Downloads folder" : "Source leads via Agent first to download PDF"}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF to PC</span>
                  </button>

                  <button
                    onClick={() => {
                      if (filteredLiveResults.length === 0) return;
                      handleExportCsv(filteredLiveResults);
                    }}
                    disabled={filteredLiveResults.length === 0}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                      filteredLiveResults.length > 0
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border border-slate-700/40 cursor-not-allowed opacity-50'
                    }`}
                    title={filteredLiveResults.length > 0 ? "Export CSV spreadsheet" : "Source leads via Agent first to export CSV"}
                  >
                    <FileText className="w-3 h-3" />
                    <span>CSV</span>
                  </button>

                  <button
                    onClick={() => {
                      if (filteredLiveResults.length === 0) return;
                      openPrintPdfView(filteredLiveResults, {
                        title: `DataGalactic ${chatSelectedCountry || 'Corporate'} Client Intelligence Dossier`,
                        leadMode: 'service_leads'
                      });
                    }}
                    disabled={filteredLiveResults.length === 0}
                    className={`p-1.5 rounded-xl transition-all ${
                      filteredLiveResults.length > 0
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer'
                        : 'bg-slate-800 text-slate-600 border border-slate-700/40 cursor-not-allowed opacity-50'
                    }`}
                    title={filteredLiveResults.length > 0 ? "Print or view formatted print preview" : "Source leads via Agent first"}
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Search & Display Controls Bar */}
              <div className="flex items-center justify-between gap-2.5 py-2.5 min-w-0 flex-wrap sm:flex-nowrap">
                <div className="relative flex-1 min-w-0">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={agentTableSearch}
                    onChange={(e) => {
                      setAgentTableSearch(e.target.value);
                      setAgentTablePage(1);
                    }}
                    placeholder="Search within clients by company, name, email, city..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 truncate"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={agentTablePageSize}
                    onChange={(e) => {
                      setAgentTablePageSize(Number(e.target.value));
                      setAgentTablePage(1);
                    }}
                    className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value={10}>10 / p</option>
                    <option value={25}>25 / p</option>
                    <option value={50}>50 / p</option>
                    <option value={100}>100 (All)</option>
                  </select>

                  <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setAgentTableViewMode('table')}
                      className={`p-1 rounded text-xs ${
                        agentTableViewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Table View"
                    >
                      <TableIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setAgentTableViewMode('grid')}
                      className={`p-1 rounded text-xs ${
                        agentTableViewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Card View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable Live Table (Side View Layout) */}
              {agentTableViewMode === 'table' && (
                <div className="flex-1 overflow-y-auto overflow-x-auto min-w-0 max-w-full rounded-xl border border-slate-800 bg-slate-950/60">
                  <table className="w-full text-left text-xs min-w-[580px]">
                    <thead className="sticky top-0 bg-slate-950 z-10">
                      <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                        <th className="py-2.5 px-2 text-center w-8">#</th>
                        <th className="py-2.5 px-3 font-semibold min-w-[130px]">Company & Website</th>
                        <th className="py-2.5 px-3 font-semibold min-w-[110px]">Key Contact</th>
                        <th className="py-2.5 px-3 font-semibold min-w-[140px]">Business Email</th>
                        <th className="py-2.5 px-2 font-semibold min-w-[80px]">Location</th>
                        <th className="py-2.5 px-2 font-semibold min-w-[110px]">Service Fit</th>
                        <th className="py-2.5 px-1 font-semibold text-center w-12">Score</th>
                        <th className="py-2.5 px-2 font-semibold text-right w-14">Pitch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {paginatedLiveResults.length > 0 ? (
                        paginatedLiveResults.map((lead, idx) => (
                          <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-2 px-2 text-center font-mono text-slate-500 text-[10px]">
                              {(agentTablePage - 1) * (agentTablePageSize || 1) + idx + 1}
                            </td>
                            <td className="py-2 px-3">
                              <div className="font-bold text-white text-xs flex items-center gap-1">
                                <span className="truncate max-w-[130px]">{lead.companyName}</span>
                                {lead.companyWebsite && (
                                  <a
                                    href={lead.companyWebsite}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-400 hover:text-indigo-400"
                                  >
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                              <div className="text-[10px] text-indigo-300/80 truncate max-w-[130px]">{lead.industry}</div>
                            </td>
                            <td className="py-2 px-3">
                              <div className="font-semibold text-slate-200 text-xs truncate max-w-[120px]">{lead.contactFullName}</div>
                              <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{lead.jobTitle}</div>
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1">
                                <span className="font-mono text-slate-200 text-[11px] truncate max-w-[140px]">{lead.businessEmail}</span>
                                <span title="100% Deliverable">
                                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                                </span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(lead.businessEmail);
                                    setCopiedEmail(lead.businessEmail);
                                    setTimeout(() => setCopiedEmail(null), 2000);
                                  }}
                                  className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                                  title="Copy Email"
                                >
                                  {copiedEmail === lead.businessEmail ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-slate-300 text-[11px] truncate max-w-[100px]">
                              {lead.regionCity || lead.country}
                            </td>
                            <td className="py-2 px-3">
                              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-medium truncate block max-w-[130px]">
                                {lead.recommendedService || 'Data Cleaning'}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-center">
                              <span className="font-bold text-emerald-400 text-[11px]">
                                {lead.leadScore}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-right">
                              <button
                                onClick={() => handleGeneratePitchForLead(lead)}
                                className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold whitespace-nowrap"
                              >
                                Pitch
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="py-24 text-center">
                            <div className="max-w-md mx-auto space-y-3 px-4">
                              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
                                <Bot className="w-6 h-6" />
                              </div>
                              <h4 className="text-sm font-bold text-white">Agent Standby — No Leads Sourced Yet</h4>
                              <p className="text-xs text-slate-400 leading-relaxed">
                                Type your command in the AI Agent chat on the left (e.g. <span className="text-indigo-300 font-semibold">"50 UK Hospitals & Clinics"</span> or <span className="text-indigo-300 font-semibold">"50 UK Law Firms"</span>), or click any suggestion pill above to source verified leads live into this table.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Cards View */}
              {agentTableViewMode === 'grid' && (
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {paginatedLiveResults.length > 0 ? (
                    paginatedLiveResults.map((lead) => (
                      <div key={lead.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-xs truncate">{lead.companyName}</h4>
                            <span className="text-[10px] text-indigo-300 truncate">{lead.country}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5 truncate">
                            {lead.contactFullName} ({lead.jobTitle}) • <span className="font-mono text-slate-400">{lead.businessEmail}</span>
                          </p>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 mt-1 inline-block">
                            {lead.recommendedService || 'Data Cleaning'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-emerald-400 text-xs">{lead.leadScore}/100</span>
                          <button
                            onClick={() => handleGeneratePitchForLead(lead)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                          >
                            Pitch
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-24 text-center">
                      <div className="max-w-md mx-auto space-y-3 px-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
                          <Bot className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-white">Agent Standby — No Leads Sourced Yet</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Ask the AI Agent on the left to source verified leads into this view.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pagination Controls */}
              {filteredLiveResults.length > 0 && agentTablePageSize !== 0 && (
                <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <div>
                    Showing <span className="text-white font-semibold">{(agentTablePage - 1) * agentTablePageSize + 1}</span> - <span className="text-white font-semibold">{Math.min(agentTablePage * agentTablePageSize, filteredLiveResults.length)}</span> of <span className="text-white font-semibold">{filteredLiveResults.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={agentTablePage <= 1}
                      onClick={() => setAgentTablePage(p => Math.max(1, p - 1))}
                      className="p-1 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 disabled:opacity-40 text-slate-300"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 text-white font-semibold">{agentTablePage} / {totalAgentPages}</span>
                    <button
                      disabled={agentTablePage >= totalAgentPages}
                      onClick={() => setAgentTablePage(p => Math.min(totalAgentPages, p + 1))}
                      className="p-1 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 disabled:opacity-40 text-slate-300"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: 10 CORE SERVICES CATALOG */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="galaxy-card p-6 rounded-2xl border border-indigo-500/30 bg-slate-900/90">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span>DataGalactic 10 Core Services Catalog & Pitching Hooks</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Proprietary high-precision B2B service offerings with verified conversion hooks and SLAs
                </p>
              </div>
              <button
                onClick={() => setActiveTab('agent')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Bot className="w-4 h-4" />
                <span>Return to AI Agent</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DATAGALACTIC_SERVICES.map((srv, idx) => (
                <div key={srv.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </span>
                      {srv.name}
                    </span>
                    <button
                      onClick={() => {
                        if (!chatSelectedCountry) setChatSelectedCountry('United Kingdom');
                        setActiveTab('agent');
                        handleSendChatMessage(`How do we pitch ${srv.name}?`);
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Ask Agent →
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{srv.shortDesc}</p>
                  <div className="text-xs p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-indigo-200">
                    <strong>Pitch Hook:</strong> "{srv.pitchSnippet}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SOURCED SERVICE LEADS DIRECTORY */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          {/* Filter Ribbon */}
          <div className="galaxy-card p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Country Filter */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value="All">All Countries</option>
                {TARGET_COUNTRIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Industry Filter */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Industry Sector</label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value="All">All Industries</option>
                {TARGET_CLIENT_INDUSTRIES.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Service Offer Filter */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">DataGalactic Service</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value="All">All 10 Core Services</option>
                {DATAGALACTIC_SERVICES.map(srv => (
                  <option key={srv.name} value={srv.name}>{srv.name}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Search Leads</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Company, name, email..."
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400"
              />
            </div>

            {/* Quick Reset */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedCountry('All');
                  setSelectedIndustry('All');
                  setSelectedService('All');
                  setSearchQuery('');
                }}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Action Toolbar: Sourcing, 100-limit, and PDF Download */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                Service Prospects Directory ({filteredLeads.length})
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                100% Deliverable
              </span>
              {sourcingSuccessMsg && (
                <span className="text-[11px] text-emerald-400 font-semibold animate-pulse">
                  ✓ {sourcingSuccessMsg}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Search 100 Clients Button */}
              <button
                onClick={() => handleSourceClients(100)}
                disabled={isSourcing100}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
              >
                {isSourcing100 ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Search 100 Clients</span>
              </button>

              {/* Download PDF Button */}
              <button
                onClick={() => exportLeadsToPdf(filteredLeads, { title: 'DataGalactic B2B Service Prospects Intelligence Dossier', leadMode: 'service_leads' })}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Download PDF ({filteredLeads.length})</span>
              </button>

              {/* View Mode Switcher */}
              <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setViewMode('table')}
                  title="Table View"
                  className={`p-1.5 rounded-md text-xs transition-colors ${
                    viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  title="Cards View"
                  className={`p-1.5 rounded-md text-xs transition-colors ${
                    viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Page Size Selector */}
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
                <option value={0}>Show All ({filteredLeads.length})</option>
              </select>
            </div>
          </div>

          {/* TABLE VIEW (Optimal for 100 Clients) */}
          {viewMode === 'table' && filteredLeads.length > 0 && (
            <div className="galaxy-card rounded-2xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                      <th className="py-3 px-3 text-center w-10">#</th>
                      <th className="py-3 px-4 font-semibold min-w-[200px]">Company & Website</th>
                      <th className="py-3 px-4 font-semibold min-w-[170px]">Decision Maker</th>
                      <th className="py-3 px-4 font-semibold min-w-[210px]">Business Email / Phone</th>
                      <th className="py-3 px-4 font-semibold min-w-[140px]">Location</th>
                      <th className="py-3 px-4 font-semibold min-w-[190px]">Recommended Service</th>
                      <th className="py-3 px-4 font-semibold text-center w-20">Score</th>
                      <th className="py-3 px-4 font-semibold text-center w-28">Status</th>
                      <th className="py-3 px-4 font-semibold text-right w-24">Outreach</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {paginatedLeads.map((lead, idx) => (
                      <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3 text-center font-mono text-slate-500 text-[11px]">
                          {(currentPage - 1) * (pageSize || 1) + idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white text-xs flex items-center gap-1.5">
                            <span>{lead.companyName}</span>
                            <a
                              href={lead.companyWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-indigo-400"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <div className="text-[10px] text-indigo-300/80 mt-0.5">{lead.industry}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-200">{lead.contactFullName}</div>
                          <div className="text-[10px] text-slate-400">{lead.jobTitle}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-slate-200 text-xs flex items-center gap-1">
                            <span>{lead.businessEmail}</span>
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          </div>
                          {lead.publicBusinessPhone && (
                            <div className="text-[10px] text-slate-400 mt-0.5">{lead.publicBusinessPhone}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-xs">
                          {lead.regionCity || lead.country}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 font-medium">
                            {lead.recommendedService || 'Data Cleaning & Formatting'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-emerald-400 text-xs">
                            {lead.leadScore}/100
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge status={lead.leadStatus} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleGeneratePitchForLead(lead)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-colors whitespace-nowrap"
                          >
                            Write Email
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedLeads.map((lead) => (
                <div key={lead.id} className="galaxy-card p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">{lead.companyName}</h3>
                          <a
                            href={lead.companyWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-indigo-400"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <p className="text-xs text-indigo-300 font-medium">{lead.industry} • {lead.country}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-400">{lead.leadScore}/100</div>
                        <span className="text-[10px] text-slate-400">Quality Score</span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">{lead.contactFullName}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                          {lead.department}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{lead.jobTitle}</p>
                      
                      <div className="mt-2.5 flex items-center justify-between text-xs pt-2.5 border-t border-slate-800/80">
                        <span className="text-slate-300 font-mono text-xs">{lead.businessEmail}</span>
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {lead.emailVerificationStatus} ({lead.emailConfidenceScore}%)
                        </span>
                      </div>
                    </div>

                    {/* Service Fit & Grounded Reason */}
                    <div className="mt-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Recommended Service:</span>
                        <span className="font-semibold text-indigo-300">
                          {lead.recommendedService}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 bg-indigo-950/40 p-3 rounded-xl border border-indigo-500/20 leading-relaxed">
                        <strong className="text-indigo-200">Evidence of Fit:</strong> {lead.leadScoreReason}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <StatusBadge status={lead.leadStatus} />
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleGeneratePitchForLead(lead)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Write AI Cold Email</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Toolbar */}
          {filteredLeads.length > 0 && pageSize > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
              <span>
                Showing {Math.min((currentPage - 1) * pageSize + 1, filteredLeads.length)} to {Math.min(currentPage * pageSize, filteredLeads.length)} of {filteredLeads.length} clients
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <span className="text-white font-semibold">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {filteredLeads.length === 0 && (
            <div className="galaxy-card p-12 text-center rounded-2xl border border-slate-800">
              <p className="text-sm text-slate-400">No service prospects found matching the selected filters.</p>
              <button
                onClick={() => handleSourceClients(100)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                <Sparkles className="w-4 h-4" />
                <span>Search and Load 100 Clients</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MAIL PROCESSING HUB */}
      {activeTab === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Email Composer */}
          <div className="lg:col-span-2 galaxy-card p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>Mode A Cold Email Generator</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Compose tailored cold outreach for DataGalactic service prospects
                </p>
              </div>

              {sendSuccessMsg && (
                <span className="text-xs px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold animate-in fade-in">
                  {sendSuccessMsg}
                </span>
              )}
            </div>

            {/* Active Filter Bar synced with Tab 2 */}
            {(selectedCountry !== 'All' || selectedIndustry !== 'All' || selectedService !== 'All' || searchQuery.trim()) ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-300 text-[11px]">Synced with Saved List Filters:</span>
                  {selectedCountry !== 'All' && (
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px]">
                      📍 {selectedCountry}
                    </span>
                  )}
                  {selectedIndustry !== 'All' && (
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px]">
                      🏢 {selectedIndustry}
                    </span>
                  )}
                  {selectedService !== 'All' && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                      ⚡ {selectedService}
                    </span>
                  )}
                  {searchQuery.trim() && (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      🔍 "{searchQuery}"
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    ({filteredLeads.length} leads in Target Prospect)
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCountry('All');
                      setSelectedIndustry('All');
                      setSelectedService('All');
                      setSearchQuery('');
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-semibold"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                <span>Showing all {filteredLeads.length} saved clients. Filter them anytime in Tab 2 ("Saved Clients List").</span>
                <button
                  onClick={() => setActiveTab('leads')}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold underline"
                >
                  Open Filter Ribbon
                </button>
              </div>
            )}

            {/* Sender Profile synced with Settings */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-[11px] text-slate-400">Sending Email From:</span>
                <span className="font-semibold text-white underline">{settings.companyEmail}</span>
                <span className="text-slate-400 font-normal">({settings.founder})</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                  Settings Profile Active
                </span>
              </div>
              <button
                onClick={() => setActiveTab('settings')}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-semibold ml-auto flex items-center gap-1"
              >
                <span>Edit Name / Mail in Settings</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Controls Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Select Lead */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-400">Target Prospect</label>
                  <span className="text-[10px] text-indigo-400 font-medium">
                    {filteredLeads.length} from Saved List
                  </span>
                </div>
                <select
                  value={composerLeadId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setComposerLeadId(id);
                    const found = filteredLeads.find(l => l.id === id) || leads.find(l => l.id === id);
                    if (found) {
                      const srv = selectedService !== 'All' ? selectedService : (found.recommendedService || composerService);
                      setComposerService(srv);
                      generateEmailContent(found, composerTone, srv);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.companyName} ({l.contactFullName}) – {l.country}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No leads match current filter criteria</option>
                  )}
                </select>
              </div>

              {/* Select Tone */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Email Tone</label>
                <select
                  value={composerTone}
                  onChange={(e) => {
                    const tone = e.target.value as EmailTone;
                    setComposerTone(tone);
                    const found = filteredLeads.find(l => l.id === composerLeadId) || leads.find(l => l.id === composerLeadId);
                    if (found) generateEmailContent(found, tone, composerService);
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Professional">Professional (Consultative)</option>
                  <option value="Friendly">Friendly & Approachable</option>
                  <option value="Concise">Concise (Direct to Point)</option>
                  <option value="Formal">Formal & Enterprise</option>
                </select>
              </div>

              {/* Service Offering */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-400">Pitched Service</label>
                  {selectedService !== 'All' ? (
                    <span className="text-[10px] text-emerald-400 font-medium">
                      Filtered: {selectedService.split(' ')[0]}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-normal">
                      {pitchedServiceOptions.length} available
                    </span>
                  )}
                </div>
                <select
                  value={composerService}
                  onChange={(e) => {
                    const srv = e.target.value;
                    setComposerService(srv);
                    const found = filteredLeads.find(l => l.id === composerLeadId) || leads.find(l => l.id === composerLeadId);
                    if (found) generateEmailContent(found, composerTone, srv);
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {pitchedServiceOptions.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subject Line Input */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Email Subject Line</label>
              <input
                type="text"
                value={composedSubject}
                onChange={(e) => setComposedSubject(e.target.value)}
                placeholder="Subject line..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-medium"
              />
            </div>

            {/* Body Editor */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-400">Message Body</label>
                {isDrafting && (
                  <span className="text-[11px] text-indigo-400 flex items-center gap-1 font-semibold">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    AI drafting message...
                  </span>
                )}
              </div>
              <textarea
                rows={12}
                value={composedBody}
                onChange={(e) => setComposedBody(e.target.value)}
                placeholder="Email content..."
                className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white leading-relaxed font-sans focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <button
                onClick={() => {
                  const found = leads.find(l => l.id === composerLeadId);
                  if (found) generateEmailContent(found, composerTone, composerService);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Regenerate Draft</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveCurrentDraft}
                  disabled={!composerLeadId || filteredLeads.length === 0}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Save as Draft
                </button>
                <button
                  onClick={handleSendDirect}
                  disabled={!composerLeadId || filteredLeads.length === 0}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Approve & Send Now</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Outbound Sent History & Drafts for Mode A */}
          <div className="galaxy-card p-5 rounded-2xl border border-slate-800 flex flex-col h-[600px]">
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Mode A Outreach History</h3>
                <p className="text-[11px] text-slate-400">Campaign drafts & sent records</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                {serviceDrafts.length} Total
              </span>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
              {serviceDrafts.map((d) => (
                <div
                  key={d.id}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-white block">{d.recipientName}</span>
                      <span className="text-[11px] text-slate-400">{d.companyName}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      d.status === 'Sent'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : d.status === 'Awaiting Approval'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {d.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-indigo-300 font-medium truncate">
                    {d.subject}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>{d.sentAt ? `Sent: ${new Date(d.sentAt).toLocaleDateString()}` : `Created: ${new Date(d.createdAt).toLocaleDateString()}`}</span>
                    <button
                      onClick={() => {
                        setComposedSubject(d.subject);
                        setComposedBody(d.body);
                        setComposerLeadId(d.leadId);
                      }}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      Load in Editor
                    </button>
                  </div>
                </div>
              ))}

              {serviceDrafts.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No outreach drafts generated yet for Mode A.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FOLLOW-UP CADENCE */}
      {activeTab === 'followup' && (
        <div className="space-y-4">
          <div className="galaxy-card p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-indigo-400" />
                  <span>Mode A Follow-up Cadence (Day 3 & Day 7)</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Automated sales follow-up tracker for UK, USA, and AU service prospects
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['All', 'Due Today', 'Overdue', 'Upcoming'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFollowUpTab(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      followUpTab === tab
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode A Client Inbound Replies Section */}
            {clientReplies.filter(r => r.leadMode === 'service_leads').length > 0 && (
              <div className="pt-4 pb-2 border-b border-slate-800">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Inbound Client Replies Received ({clientReplies.filter(r => r.leadMode === 'service_leads').length})</span>
                  </span>
                  <span className="text-[10px] text-slate-400">These clients replied — no automated follow-up needed!</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {clientReplies.filter(r => r.leadMode === 'service_leads').map(reply => (
                    <div key={reply.id} className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{reply.leadName} ({reply.companyName})</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                          {reply.sentiment}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 italic line-clamp-2">"{reply.replySnippet}"</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                        <span>{reply.replyDate}</span>
                        <span className="text-indigo-400 font-medium">{reply.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up Tasks List */}
            <div className="pt-4 space-y-3">
              {followUpTasks
                .filter(t => followUpTab === 'All' || t.status === followUpTab)
                .map(task => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-white text-sm">{task.leadName}</span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                          <Building className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Company: {task.companyName}</span>
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          task.status === 'Due Today'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                            : task.status === 'Overdue'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {task.status} (Day {task.cadenceDay})
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>{task.email}</span>
                        <span>•</span>
                        <span>Due: {task.dueDate}</span>
                      </p>
                      {task.suggestedDraftSubject && (
                        <p className="text-xs text-indigo-200 mt-1 font-medium bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                          📌 <span className="text-slate-400">Follow-up for {task.companyName}:</span> "{task.suggestedDraftSubject}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setComposedSubject(task.suggestedDraftSubject || 'Following up on our exchange');
                          setComposedBody(task.suggestedDraftBody || 'Hi, just following up on our previous note.');
                          setComposerLeadId(task.leadId);
                          setActiveTab('email');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Open Follow-up Email</span>
                      </button>

                      <button
                        onClick={() => {
                          setFollowUpTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'Completed' } : t));
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                      >
                        Mark Done
                      </button>
                    </div>
                  </div>
                ))}

              {followUpTasks.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No active follow-up tasks currently due for Mode A.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SETTINGS & COMPANY SENDER PROFILE */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <SettingsPage mode="mode_a" />
        </div>
      )}
    </div>
  );
};
