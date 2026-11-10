import React, { useState, useRef, useEffect } from 'react';
import {
  Briefcase,
  Sparkles,
  Building,
  Mail,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Bot,
  Send,
  CalendarClock,
  CheckCircle2,
  RefreshCw,
  User,
  Printer,
  Table as TableIcon,
  LayoutGrid,
  ChevronLeft,
  Settings as SettingsIcon,
  SquarePen,
  ArrowUp
} from 'lucide-react';
import { Lead, EmailDraft, EmailTone, FollowUpTask, ClientReply, ChatMessage } from '../types';
import {
  TARGET_COUNTRIES,
  TARGET_CLIENT_INDUSTRIES,
  DATAGALACTIC_SERVICES,
  DATAGALACTIC_COMPANY
} from '../data/catalog';
import { StatusBadge } from '../components/Badge';
import { exportLeadsToPdf } from '../utils/exportPdf';
import { SettingsPage } from './SettingsPage';
import { useCompanySettings } from '../utils/settingsStorage';
import { InlineLeadsTable } from '../components/InlineLeadsTable';
import { renderFormattedChatText } from '../utils/formatChatText';

interface ServiceLeadsProps {
  initialTab?: 'agent' | 'leads' | 'email' | 'followup' | 'services' | 'settings';
  onTabChange?: (tab: 'agent' | 'leads' | 'email' | 'followup' | 'services' | 'settings') => void;
  leads: Lead[];
  drafts: EmailDraft[];
  clientReplies?: ClientReply[];
  chatSessionId?: string;
  initialMessages?: ChatMessage[];
  onSyncChatMessages?: (sessionId: string, messages: ChatMessage[]) => void;
  onNewChat?: () => void;
  onSelectLead: (lead: Lead) => void;
  onAddNewLead: (lead: Lead) => void;
  onAddMultipleLeads?: (leads: Lead[]) => void;
  onSaveDraftForApproval: (draft: EmailDraft) => void;
  onApproveAndSend: (draftId: string) => Promise<boolean>;
  onUpdateLead?: (lead: Lead) => void;
}

export const ServiceLeads: React.FC<ServiceLeadsProps> = ({
  initialTab = 'agent',
  onTabChange,
  leads,
  drafts,
  clientReplies = [],
  chatSessionId = 'session-a-initial',
  initialMessages = [],
  onSyncChatMessages,
  onNewChat,
  onAddNewLead,
  onAddMultipleLeads,
  onSaveDraftForApproval,
  onApproveAndSend,
  onUpdateLead
}) => {
  const [activeTab, setActiveTabState] = useState<'agent' | 'leads' | 'email' | 'followup' | 'services' | 'settings'>(initialTab);
  const [downloadedFileNotice, setDownloadedFileNotice] = useState<string | null>(null);
  const { settings } = useCompanySettings('mode_a');

  const setActiveTab = (tab: 'agent' | 'leads' | 'email' | 'followup' | 'services' | 'settings') => {
    setActiveTabState(tab);
    if (onTabChange) onTabChange(tab);
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTabState(initialTab);
    }
  }, [initialTab]);

  // Filter only service_leads
  const serviceLeads = leads.filter(l => l.leadMode === 'service_leads');
  const serviceDrafts = drafts.filter(d => {
    const parentLead = leads.find(l => l.id === d.leadId);
    return d.leadMode === 'service_leads' || (parentLead && parentLead.leadMode === 'service_leads');
  });

  // Filter Ribbon States (Tab 2 -> Synced to Tab 3)
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [selectedService, setSelectedService] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // View & Pagination States (Tab 2)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isSourcing100, setIsSourcing100] = useState<boolean>(false);
  const [sourcingSuccessMsg, setSourcingSuccessMsg] = useState<string | null>(null);

  // AI Agent Chat State (Starts completely empty / standby by default!)
  const [chatInput, setChatInput] = useState<string>('');
  const [chatSelectedCountry, setChatSelectedCountry] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages);
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Reset or restore messages when active session changes
  useEffect(() => {
    setChatMessages(initialMessages);
    setIsAgentThinking(false);
  }, [chatSessionId]);

  // Smooth auto-scroll on new messages
  useEffect(() => {
    if (chatMessages.length > 0 || isAgentThinking) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [chatMessages.length, isAgentThinking]);

  const appendChatMessages = (newMsgs: ChatMessage[]) => {
    setChatMessages(prev => {
      const next = [...prev, ...newMsgs];
      if (onSyncChatMessages) {
        onSyncChatMessages(chatSessionId, next);
      }
      return next;
    });
  };

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
      const match =
        lead.companyName.toLowerCase().includes(q) ||
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
  const paginatedLeads =
    pageSize === 0
      ? filteredLeads
      : filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
    link.setAttribute(
      'download',
      `datagalactic_leads_${(chatSelectedCountry || 'clients').toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Start clean New Chat session (returns to centered ChatGPT standby screen)
  const handleStartNewChat = () => {
    setChatInput('');
    setSourcingSuccessMsg(null);
    setIsAgentThinking(false);
    if (onNewChat) {
      onNewChat();
    } else {
      setChatMessages([]);
    }
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

        const finalIndustry = data.industry || industryToUse || 'B2B Clients';
        const finalCountry = data.country || countryToUse;

        const agentMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'agent',
          text: `Sourced and verified **${data.leads.length} ${finalIndustry} records** in **${finalCountry}**.\n\n• **Industry Matched:** ${finalIndustry}\n• **Target Market:** ${finalCountry}\n• **Verification:** Deliverable business emails & decision-maker contacts`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          leads: data.leads,
          industry: finalIndustry,
          country: finalCountry,
          suggestedAction: {
            type: 'download_pdf',
            leadCount: data.leads.length
          }
        };

        appendChatMessages([agentMsg]);
        setSourcingSuccessMsg(`Successfully sourced ${data.leads.length} verified ${finalIndustry} in ${finalCountry}!`);
        return data.leads;
      } else {
        appendChatMessages([
          {
            id: `msg-${Date.now()}`,
            sender: 'agent',
            text: `I could not retrieve leads for "${customPrompt || industryToUse || 'your request'}" right now. Please try specifying an industry and country (e.g., "50 UK Hospitals & Clinics").`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error('Lead sourcing error:', err);
      appendChatMessages([
        {
          id: `msg-${Date.now()}`,
          sender: 'agent',
          text: `Unable to reach the lead sourcing server right now. Please ensure the backend service is running and try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
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
    const isReplyQuery =
      lower.includes('reply') ||
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

    if (detectedIndustry) {
      setSelectedIndustry(detectedIndustry);
    }

    const activeCountry = detectedCountry || chatSelectedCountry || (selectedCountry !== 'All' ? selectedCountry : 'United Kingdom (UK)');
    if (!chatSelectedCountry) {
      setChatSelectedCountry(activeCountry);
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    appendChatMessages([userMsg]);
    if (!textToSend) setChatInput('');

    // Handle Client Replies Query
    if (isReplyQuery) {
      setIsAgentThinking(true);
      setTimeout(() => {
        const modeAReplies = clientReplies.filter(r => r.leadMode === 'service_leads');
        let replyText = '';
        if (modeAReplies.length > 0) {
          replyText =
            `We have **${modeAReplies.length} active client replies** for DataGalactic Services (Mode A):\n\n` +
            modeAReplies
              .map(
                (r, idx) =>
                  `**${idx + 1}. ${r.leadName}** — *${r.companyName}* (${r.replyDate})\n` +
                  `• **Subject:** ${r.replySubject}\n` +
                  `• **Client Message:** "${r.replySnippet}"\n` +
                  `• **Sentiment:** ${r.sentiment} • **Status:** ${r.status}`
              )
              .join('\n\n') +
            `\n\nYou can also manage full reply statuses in **Dashboard** or schedule reminders in **Follow-ups**.`;
        } else {
          replyText = `No new client replies received yet for Mode A. Once prospects respond to your emails, they will appear here and in the Dashboard.`;
        }

        appendChatMessages([
          {
            id: `msg-${Date.now() + 1}`,
            sender: 'agent',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsAgentThinking(false);
      }, 450);
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

    const isClientSearch =
      lower.includes('client') ||
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

    setTimeout(() => {
      let replyText = '';
      let action: ChatMessage['suggestedAction'];

      if (lower.includes('crm') || lower.includes('saas') || lower.includes('cleaning')) {
        replyText = `For SaaS & fast-growing tech teams, our highest-converting service is **Data Cleaning & Formatting**.\n\n• **Core Pain Point:** Rapid customer growth produces duplicate CRM records, mismatched schemas, and decaying email deliverability.\n• **DataGalactic Value:** Schema standardization, deduplication, and contact validation with 100% field hygiene.\n• **Recommended Pitch:** Offer a complimentary 500-record CRM deduplication audit.`;
        action = {
          type: 'draft_pitch',
          serviceName: 'Data Cleaning & Formatting'
        };
      } else if (lower.includes('10 services') || lower.includes('catalog') || lower.includes('core')) {
        replyText = `DataGalactic operates 10 specialized B2B data services:\n1. **Data Entry Services** (99.9% accuracy)\n2. **Data Cleaning & Formatting** (CRM deduplication)\n3. **Data Extraction** (Directories & registries)\n4. **B2B Lead Generation** (Verified contacts)\n5. **Web & Market Research** (Competitor benchmarking)\n6. **Database Building** (Custom schemas)\n7. **Data Validation & Verification** (Email & phone verify)\n8. **CRM & Product Data Management** (Catalog updates)\n9. **Document Digitization & Conversion** (PDF/records to digital)\n10. **Back-Office & Administrative Support** (Routine operations)`;
      } else {
        replyText = `I can source verified corporate leads for any industry across the UK, USA, Canada, and Australia.\n\nTry asking something like:\n• **"50 UK Hospitals & Clinics"**\n• **"50 UK Law Firms"**\n• **"100 USA Logistics Companies"**`;
      }

      appendChatMessages([
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedAction: action
        }
      ]);
      setIsAgentThinking(false);
    }, 600);
  };

  // Generate Email for Selected Lead
  const handleGeneratePitchForLead = (lead: Lead) => {
    setComposerLeadId(lead.id);
    const targetService =
      selectedService !== 'All' ? selectedService : lead.recommendedService || 'Data Cleaning & Formatting';
    setComposerService(targetService);
    setActiveTab('email');
    generateEmailContent(lead, composerTone, targetService);
  };

  const generateEmailContent = (targetLead: Lead, tone: EmailTone, serviceName: string) => {
    setIsDrafting(true);
    setSendSuccessMsg(null);

    const serviceObj = DATAGALACTIC_SERVICES.find(s => s.name === serviceName) || DATAGALACTIC_SERVICES[0];

    setTimeout(() => {
      const subject =
        tone === 'Concise'
          ? `Quick question regarding ${targetLead.companyName}'s ${serviceName}`
          : `${serviceName} for ${targetLead.companyName} – High-Precision Support`;

      let greeting = `Hi ${targetLead.contactFirstName},`;
      if (tone === 'Formal') greeting = `Dear Mr./Ms. ${targetLead.contactLastName || targetLead.contactFirstName},`;

      const body = `${greeting}

I noticed ${targetLead.companyName}'s prominent position in the ${targetLead.industry} sector across ${targetLead.country}. As operations scale, handling high volumes of data operations often drains key internal team hours.

At ${settings.companyName || DATAGALACTIC_COMPANY.name}, we provide specialized ${serviceName} with 99.9% guaranteed precision. ${serviceObj.pitchSnippet}

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
    }, 250);
  };

  // Synchronize Email Composer with filtered leads and chosen service filter
  useEffect(() => {
    if (filteredLeads.length > 0) {
      const leadExists = filteredLeads.some(l => l.id === composerLeadId);
      const activeLead = leadExists
        ? filteredLeads.find(l => l.id === composerLeadId) || filteredLeads[0]
        : filteredLeads[0];

      if (!leadExists || composerLeadId !== activeLead.id) {
        setComposerLeadId(activeLead.id);
      }

      const activeService =
        selectedService !== 'All'
          ? selectedService
          : activeLead.recommendedService || composerService || 'Data Cleaning & Formatting';

      if (composerService !== activeService) {
        setComposerService(activeService);
      }

      generateEmailContent(activeLead, composerTone, activeService);
    } else {
      setComposerLeadId('');
      setComposedSubject('');
      setComposedBody(
        'No leads match your current filter criteria in the Saved Clients List. Please adjust your filters in Saved Clients List to view prospects and compose outreach.'
      );
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
    setSendSuccessMsg(`Draft saved and queued for Approval Gate (From: ${settings.companyEmail}).`);
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
    await onApproveAndSend(tempDraftId);

    // Explicit company-named Follow-up task
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

    setSendSuccessMsg(
      `Dispatched from ${settings.companyEmail} (${settings.founder}) to ${targetLead.businessEmail}! Follow-up queued for ${targetLead.companyName}.`
    );
  };

  // Reusable Pill Composer JSX (rendered centered on standby, or pinned at bottom during chat)
  const renderChatComposer = (centered: boolean) => (
    <div
      className={`w-full ${centered ? 'max-w-2xl' : 'max-w-3xl'} mx-auto rounded-[26px] bg-[#f4f4f4] dark:bg-[#2f2f2f] border border-neutral-200 dark:border-white/10 px-4 py-3 shadow-sm transition-colors`}
    >
      <textarea
        rows={centered ? 2 : 1}
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendChatMessage();
          }
        }}
        placeholder={
          chatSelectedCountry
            ? `Message DataGalactic Agent (${chatSelectedCountry})...`
            : 'Ask for B2B leads (e.g. "50 UK Hospitals & Clinics", "100 USA Law Firms")...'
        }
        className="chatgpt-pill-input w-full bg-transparent border-0 resize-none text-sm text-neutral-900 dark:text-[#ececec] placeholder-neutral-500 dark:placeholder-[#9e9e9e] focus:outline-none leading-relaxed max-h-36"
      />

      <div className="flex items-center justify-between gap-2 pt-2 mt-1 border-t border-neutral-200/70 dark:border-white/10">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={chatSelectedCountry}
            onChange={(e) => setChatSelectedCountry(e.target.value)}
            className="chatgpt-pill-select px-3 py-1.5 rounded-full bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 text-xs font-medium text-neutral-800 dark:text-[#ececec] cursor-pointer focus:outline-none"
          >
            <option value="">🌍 Country (Auto)</option>
            <option value="United Kingdom (UK)">🇬🇧 United Kingdom</option>
            <option value="United States (USA)">🇺🇸 United States</option>
            <option value="Canada">🇨🇦 Canada</option>
            <option value="Australia">🇦🇺 Australia</option>
            <option value="Germany">🇩🇪 Germany</option>
            <option value="Singapore">🇸🇬 Singapore</option>
            <option value="United Arab Emirates (UAE)">🇦🇪 UAE</option>
            <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
          </select>

          {!centered && chatMessages.length > 0 && (
            <button
              onClick={handleStartNewChat}
              className="px-2.5 py-1.5 rounded-full text-xs font-medium text-neutral-600 dark:text-[#b4b4b4] hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/70 dark:hover:bg-[#383838] flex items-center gap-1 transition-colors"
              title="Start new chat"
            >
              <SquarePen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New chat</span>
            </button>
          )}
        </div>

        <button
          onClick={() => handleSendChatMessage()}
          disabled={!chatInput.trim() || isAgentThinking}
          title="Send message"
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
            chatInput.trim() && !isAgentThinking
              ? 'bg-[#0d0d0d] dark:bg-white text-white dark:text-[#212121] hover:opacity-85 cursor-pointer'
              : 'bg-neutral-300 dark:bg-[#424242] text-neutral-500 dark:text-[#8e8e8e] cursor-not-allowed'
          }`}
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className={`flex flex-col flex-1 w-full ${activeTab === 'agent' ? 'space-y-3' : 'space-y-5'}`}>
      {/* Workspace Header shown ONLY on structured workspace tabs 2-6 */}
      {activeTab !== 'agent' && (
        <div className="chatgpt-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-[#2f2f2f] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-[#d4d4d4] text-[11px] font-medium mb-2">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Mode A • B2B Service Outreach</span>
            </div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
              DataGalactic Service Workspace
            </h1>
            <p className="text-xs text-neutral-500 dark:text-[#9e9e9e] mt-0.5 max-w-2xl">
              Manage saved B2B leads, generate personalized outreach pitches, and track client follow-ups.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#212121] border border-neutral-200 dark:border-white/10 text-center min-w-[74px]">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-[#8e8e8e] block font-semibold">
                Prospects
              </span>
              <span className="text-base font-bold text-neutral-900 dark:text-white">{serviceLeads.length}</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#212121] border border-neutral-200 dark:border-white/10 text-center min-w-[74px]">
              <span className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 block font-semibold">
                Approvals
              </span>
              <span className="text-base font-bold text-amber-600 dark:text-amber-400">{awaitingApprovalCount}</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#212121] border border-neutral-200 dark:border-white/10 text-center min-w-[74px]">
              <span className="text-[10px] uppercase tracking-wider text-[#10a37f] block font-semibold">
                Sent
              </span>
              <span className="text-base font-bold text-[#10a37f]">{sentCount}</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#212121] border border-neutral-200 dark:border-white/10 text-center min-w-[74px]">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-[#9e9e9e] block font-semibold">
                Follow-ups
              </span>
              <span className="text-base font-bold text-neutral-900 dark:text-white">{followUpsDueCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Slim ChatGPT Sub-Navigation Pill Strip */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-neutral-200/80 dark:border-white/10 overflow-x-auto">
        <div className="flex items-center gap-1 flex-nowrap">
          {[
            { id: 'agent', label: 'AI Agent Chat', icon: Bot },
            { id: 'leads', label: `Saved Clients (${filteredLeads.length})`, icon: Building },
            { id: 'email', label: `Cold Emails (${serviceDrafts.length})`, icon: Mail },
            { id: 'followup', label: `Follow-ups (${followUpTasks.length})`, icon: CalendarClock },
            { id: 'services', label: '10 Services', icon: Sparkles },
            { id: 'settings', label: 'Settings', icon: SettingsIcon }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-neutral-900 dark:bg-[#2f2f2f] text-white font-semibold'
                    : 'text-neutral-600 dark:text-[#9e9e9e] hover:text-neutral-900 dark:hover:text-[#ececec] hover:bg-neutral-100 dark:hover:bg-[#2f2f2f]/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'agent' && chatMessages.length > 0 && (
          <button
            onClick={handleStartNewChat}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-700 dark:text-[#ececec] bg-neutral-100 dark:bg-[#2f2f2f] hover:bg-neutral-200 dark:hover:bg-[#383838] border border-neutral-200 dark:border-white/10 shrink-0 transition-colors"
          >
            <SquarePen className="w-3.5 h-3.5" />
            <span>New chat</span>
          </button>
        )}
      </div>

      {/* Download Notice Toast */}
      {downloadedFileNotice && (
        <div className="px-4 py-2.5 rounded-xl bg-[#10a37f]/15 border border-[#10a37f]/30 text-[#0e906f] dark:text-[#34d399] text-xs font-medium flex items-center justify-between gap-2 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{downloadedFileNotice}</span>
          </div>
          <button
            onClick={() => setDownloadedFileNotice(null)}
            className="text-xs underline font-semibold shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================
          TAB 1: CHATGPT SINGLE-COLUMN AI AGENT INTERFACE
         ======================================================== */}
      {activeTab === 'agent' && (
        <div className="flex-1 flex flex-col w-full min-h-[calc(100vh-11rem)]">
          {chatMessages.length === 0 ? (
            /* STANDBY / NEW CHAT VIEW (Vertically Centered ChatGPT Screen) */
            <div className="flex-1 flex flex-col items-center justify-center py-8 px-2 max-w-3xl mx-auto w-full">
              <div className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-[#2f2f2f] border border-neutral-200 dark:border-white/10 flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-neutral-800 dark:text-white" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-white text-center tracking-tight">
                What B2B leads can I find for you?
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#9e9e9e] mt-1.5 mb-6 text-center">
                DataGalactic AI Agent • Mode A Services • Verified Emails & 1-Click PDF
              </p>

              {/* Centered Pill Input */}
              {renderChatComposer(true)}

              {/* Subtle Suggestion Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-5 max-w-2xl">
                {[
                  '50 UK Hospitals & Clinics',
                  '50 UK Law Firms',
                  '100 USA Logistics Companies',
                  '50 UK E-commerce Stores',
                  'Client replies status venum',
                  'CRM Deduplication Pitch'
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendChatMessage(chip)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-[#2a2a2a] hover:bg-neutral-100 dark:hover:bg-[#383838] text-neutral-700 dark:text-[#d4d4d4] border border-neutral-200 dark:border-white/10 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ACTIVE CONVERSATION SINGLE-COLUMN FEED */
            <>
              <div className="flex-1 w-full max-w-4xl mx-auto space-y-6 pb-8 pt-2">
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'user' ? (
                      <div className="max-w-[85%] sm:max-w-[75%] rounded-3xl px-4 py-2.5 bg-[#f4f4f4] dark:bg-[#2f2f2f] text-neutral-900 dark:text-[#ececec] text-sm leading-relaxed">
                        {msg.text}
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 w-full max-w-full min-w-0">
                        <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-[#2f2f2f] border border-neutral-200 dark:border-white/10 flex items-center justify-center text-neutral-800 dark:text-white shrink-0 mt-0.5">
                          <Bot className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-2 text-sm text-neutral-800 dark:text-[#ececec] leading-relaxed">
                          <div>{renderFormattedChatText(msg.text)}</div>

                          {/* Inline Sourced Leads Table rendered inside Agent Message */}
                          {msg.leads && msg.leads.length > 0 && (
                            <InlineLeadsTable
                              leads={msg.leads}
                              mode="service_leads"
                              industryOrCategory={msg.industry}
                              country={msg.country}
                              onPitchLead={handleGeneratePitchForLead}
                              onExportCsv={handleExportCsv}
                              onPdfDownloaded={setDownloadedFileNotice}
                            />
                          )}

                          {/* Optional Draft Pitch Action Button */}
                          {msg.suggestedAction?.type === 'draft_pitch' && serviceLeads.length > 0 && (
                            <div className="pt-1">
                              <button
                                onClick={() => {
                                  if (msg.suggestedAction?.serviceName) {
                                    setComposerService(msg.suggestedAction.serviceName);
                                  }
                                  setActiveTab('email');
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d0d0d] dark:bg-white text-white dark:text-[#212121] text-xs font-semibold hover:opacity-85 transition-opacity"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>Open Email Composer</span>
                              </button>
                            </div>
                          )}

                          <div className="text-[10px] text-neutral-400 dark:text-[#8e8e8e]">
                            {msg.timestamp}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isAgentThinking && (
                  <div className="flex items-center gap-3 text-neutral-500 dark:text-[#b4b4b4] text-sm">
                    <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-[#2f2f2f] border border-neutral-200 dark:border-white/10 flex items-center justify-center shrink-0">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#10a37f]" />
                    </div>
                    <span>Searching verified business leads in {chatSelectedCountry || 'target market'}...</span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Sticky Bottom Pill Composer */}
              <div className="sticky bottom-0 z-20 pt-3 pb-1 bg-gradient-to-t from-white via-white/95 dark:from-[#212121] dark:via-[#212121]/95 to-transparent w-full">
                {renderChatComposer(false)}
                <p className="text-[10px] text-center text-neutral-400 dark:text-[#8e8e8e] mt-1.5">
                  DataGalactic LeadPilot AI • Results auto-sync to Saved Clients List
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: SOURCED SERVICE LEADS DIRECTORY
         ======================================================== */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          {/* Filter Ribbon */}
          <div className="chatgpt-card p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-neutral-500 dark:text-[#9e9e9e] block mb-1">
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-lg text-xs text-neutral-900 dark:text-white"
              >
                <option value="All">All Countries</option>
                {TARGET_COUNTRIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-500 dark:text-[#9e9e9e] block mb-1">
                Industry Sector
              </label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-lg text-xs text-neutral-900 dark:text-white"
              >
                <option value="All">All Industries</option>
                {TARGET_CLIENT_INDUSTRIES.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-500 dark:text-[#9e9e9e] block mb-1">
                DataGalactic Service
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-lg text-xs text-neutral-900 dark:text-white"
              >
                <option value="All">All 10 Core Services</option>
                {DATAGALACTIC_SERVICES.map(srv => (
                  <option key={srv.name} value={srv.name}>{srv.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-500 dark:text-[#9e9e9e] block mb-1">
                Search Leads
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Company, name, email..."
                className="w-full px-3 py-1.5 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-lg text-xs text-neutral-900 dark:text-white placeholder-neutral-400"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedCountry('All');
                  setSelectedIndustry('All');
                  setSelectedService('All');
                  setSearchQuery('');
                }}
                className="w-full py-1.5 px-3 rounded-lg bg-neutral-100 dark:bg-[#2f2f2f] hover:bg-neutral-200 dark:hover:bg-[#383838] text-neutral-700 dark:text-[#ececec] text-xs font-medium border border-neutral-200 dark:border-white/10 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="chatgpt-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                Service Prospects Directory ({filteredLeads.length})
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10a37f]/15 text-[#0e906f] dark:text-[#34d399] border border-[#10a37f]/25 font-medium">
                100% Deliverable
              </span>
              {sourcingSuccessMsg && (
                <span className="text-[11px] text-[#10a37f] font-semibold">
                  ✓ {sourcingSuccessMsg}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleSourceClients(100)}
                disabled={isSourcing100}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d0d0d] dark:bg-white text-white dark:text-[#212121] disabled:opacity-50 text-xs font-semibold hover:opacity-85 transition-opacity"
              >
                {isSourcing100 ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Search 100 Clients</span>
              </button>

              <button
                onClick={() =>
                  exportLeadsToPdf(filteredLeads, {
                    title: 'DataGalactic B2B Service Prospects Intelligence Dossier',
                    leadMode: 'service_leads'
                  })
                }
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#10a37f] hover:bg-[#0e906f] text-white text-xs font-semibold transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Download PDF ({filteredLeads.length})</span>
              </button>

              <div className="flex items-center bg-neutral-100 dark:bg-[#212121] p-0.5 rounded-lg border border-neutral-200 dark:border-white/10">
                <button
                  onClick={() => setViewMode('table')}
                  title="Table View"
                  className={`p-1.5 rounded-md text-xs transition-colors ${
                    viewMode === 'table'
                      ? 'bg-neutral-900 dark:bg-[#2f2f2f] text-white'
                      : 'text-neutral-500 dark:text-[#9e9e9e]'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  title="Cards View"
                  className={`p-1.5 rounded-md text-xs transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-neutral-900 dark:bg-[#2f2f2f] text-white'
                      : 'text-neutral-500 dark:text-[#9e9e9e]'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>

              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-lg text-xs text-neutral-900 dark:text-white"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
                <option value={0}>Show All ({filteredLeads.length})</option>
              </select>
            </div>
          </div>

          {/* Table View */}
          {viewMode === 'table' && filteredLeads.length > 0 && (
            <div className="chatgpt-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-[#1e1e1e] border-b border-neutral-200 dark:border-white/10 text-neutral-500 dark:text-[#9e9e9e] text-[10px] uppercase tracking-wider">
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
                  <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                    {paginatedLeads.map((lead, idx) => (
                      <tr key={lead.id} className="hover:bg-neutral-50 dark:hover:bg-[#212121] transition-colors">
                        <td className="py-3 px-3 text-center font-mono text-neutral-400 text-[11px]">
                          {(currentPage - 1) * (pageSize || 1) + idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-neutral-900 dark:text-white text-xs flex items-center gap-1.5">
                            <span>{lead.companyName}</span>
                            <a
                              href={lead.companyWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <div className="text-[10px] text-neutral-500 dark:text-[#9e9e9e] mt-0.5">{lead.industry}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-neutral-800 dark:text-[#ececec]">{lead.contactFullName}</div>
                          <div className="text-[10px] text-neutral-500 dark:text-[#9e9e9e]">{lead.jobTitle}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-neutral-800 dark:text-[#d4d4d4] text-xs flex items-center gap-1">
                            <span>{lead.businessEmail}</span>
                            <ShieldCheck className="w-3 h-3 text-[#10a37f]" />
                          </div>
                          {lead.publicBusinessPhone && (
                            <div className="text-[10px] text-neutral-500 dark:text-[#8e8e8e] mt-0.5">
                              {lead.publicBusinessPhone}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-neutral-600 dark:text-[#b4b4b4] text-xs">
                          {lead.regionCity || lead.country}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-[#2f2f2f] text-neutral-700 dark:text-[#d4d4d4] border border-neutral-200 dark:border-white/10 font-medium">
                            {lead.recommendedService || 'Data Cleaning & Formatting'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-semibold text-[#10a37f] text-xs">{lead.leadScore}/100</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge status={lead.leadStatus} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleGeneratePitchForLead(lead)}
                            className="px-2.5 py-1 rounded-lg bg-[#0d0d0d] dark:bg-white text-white dark:text-[#212121] hover:opacity-85 text-[11px] font-semibold transition-opacity whitespace-nowrap"
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

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedLeads.map((lead) => (
                <div key={lead.id} className="chatgpt-card p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">{lead.companyName}</h3>
                          <a
                            href={lead.companyWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-[#9e9e9e] font-medium">
                          {lead.industry} • {lead.country}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-[#10a37f]">{lead.leadScore}/100</div>
                        <span className="text-[10px] text-neutral-400">Quality Score</span>
                      </div>
                    </div>

                    <div className="mt-4 p-3.5 rounded-xl bg-neutral-50 dark:bg-[#212121] border border-neutral-200 dark:border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">{lead.contactFullName}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-md bg-neutral-200/70 dark:bg-[#2f2f2f] text-neutral-700 dark:text-[#d4d4d4] font-medium">
                          {lead.department}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-[#9e9e9e] mt-1">{lead.jobTitle}</p>

                      <div className="mt-2.5 flex items-center justify-between text-xs pt-2.5 border-t border-neutral-200 dark:border-white/10">
                        <span className="text-neutral-700 dark:text-[#d4d4d4] font-mono text-xs">{lead.businessEmail}</span>
                        <span className="text-xs text-[#10a37f] font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {lead.emailVerificationStatus} ({lead.emailConfidenceScore}%)
                        </span>
                      </div>
                    </div>

                    <div className="mt-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500 dark:text-[#9e9e9e]">Recommended Service:</span>
                        <span className="font-semibold text-neutral-900 dark:text-white">{lead.recommendedService}</span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-[#b4b4b4] bg-neutral-50 dark:bg-[#212121] p-3 rounded-xl border border-neutral-200 dark:border-white/10 leading-relaxed">
                        <strong className="text-neutral-900 dark:text-white">Evidence of Fit:</strong> {lead.leadScoreReason}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-white/10 flex items-center justify-between">
                    <StatusBadge status={lead.leadStatus} />
                    <button
                      onClick={() => handleGeneratePitchForLead(lead)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d0d0d] dark:bg-white text-white dark:text-[#212121] text-xs font-semibold hover:opacity-85 transition-opacity"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Write AI Cold Email</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredLeads.length > 0 && pageSize > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-white/10 text-xs text-neutral-500 dark:text-[#9e9e9e]">
              <span>
                Showing {Math.min((currentPage - 1) * pageSize + 1, filteredLeads.length)} to{' '}
                {Math.min(currentPage * pageSize, filteredLeads.length)} of {filteredLeads.length} clients
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#2f2f2f] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-[#ececec] disabled:opacity-40 flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <span className="text-neutral-900 dark:text-white font-semibold">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#2f2f2f] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-[#ececec] disabled:opacity-40 flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {filteredLeads.length === 0 && (
            <div className="chatgpt-card p-12 text-center rounded-2xl">
              <p className="text-sm text-neutral-500 dark:text-[#9e9e9e]">
                No service prospects found matching the selected filters.
              </p>
              <button
                onClick={() => handleSourceClients(100)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d0d0d] dark:bg-white text-white dark:text-[#212121] text-xs font-semibold"
              >
                <Sparkles className="w-4 h-4" />
                <span>Search and Load 100 Clients</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: MAIL PROCESSING HUB
         ======================================================== */}
      {activeTab === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Email Composer */}
          <div className="lg:col-span-2 chatgpt-card p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-white/10 flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Mode A Cold Email Generator</span>
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-[#9e9e9e]">
                  Compose tailored cold outreach for DataGalactic service prospects
                </p>
              </div>

              {sendSuccessMsg && (
                <span className="text-xs px-3 py-1 rounded-lg bg-[#10a37f]/15 text-[#0e906f] dark:text-[#34d399] border border-[#10a37f]/30 font-semibold">
                  {sendSuccessMsg}
                </span>
              )}
            </div>

            {/* Active Filter Bar synced with Tab 2 */}
            {selectedCountry !== 'All' || selectedIndustry !== 'All' || selectedService !== 'All' || searchQuery.trim() ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-100 dark:bg-[#212121] border border-neutral-200 dark:border-white/10 text-xs flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-neutral-600 dark:text-[#b4b4b4] text-[11px]">
                    Synced Filters:
                  </span>
                  {selectedCountry !== 'All' && (
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#2f2f2f] text-neutral-800 dark:text-[#ececec] border border-neutral-200 dark:border-white/10 text-[10px]">
                      {selectedCountry}
                    </span>
                  )}
                  {selectedIndustry !== 'All' && (
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#2f2f2f] text-neutral-800 dark:text-[#ececec] border border-neutral-200 dark:border-white/10 text-[10px]">
                      {selectedIndustry}
                    </span>
                  )}
                  {selectedService !== 'All' && (
                    <span className="px-2 py-0.5 rounded bg-[#10a37f]/15 text-[#0e906f] dark:text-[#34d399] border border-[#10a37f]/25 text-[10px]">
                      {selectedService}
                    </span>
                  )}
                  {searchQuery.trim() && (
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-[#2f2f2f] text-neutral-700 dark:text-[#d4d4d4] text-[10px]">
                      "{searchQuery}"
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-500 dark:text-[#9e9e9e]">
                    ({filteredLeads.length} leads in Target Prospect)
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCountry('All');
                      setSelectedIndustry('All');
                      setSelectedService('All');
                      setSearchQuery('');
                    }}
                    className="text-[11px] text-neutral-900 dark:text-white underline font-semibold"
                  >
                    Reset
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-[#212121] border border-neutral-200 dark:border-white/10 text-[11px] text-neutral-500 dark:text-[#9e9e9e]">
                <span>Showing all {filteredLeads.length} saved clients. Filter them anytime in Saved Clients List.</span>
                <button
                  onClick={() => setActiveTab('leads')}
                  className="text-neutral-900 dark:text-white font-semibold underline"
                >
                  Open Filter Ribbon
                </button>
              </div>
            )}

            {/* Sender Profile synced with Settings */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-[#212121] border border-neutral-200 dark:border-white/10 text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#10a37f]" />
                <span className="text-[11px] text-neutral-500 dark:text-[#9e9e9e]">Sending Email From:</span>
                <span className="font-semibold text-neutral-900 dark:text-white underline">{settings.companyEmail}</span>
                <span className="text-neutral-500 dark:text-[#9e9e9e]">({settings.founder})</span>
              </div>
              <button
                onClick={() => setActiveTab('settings')}
                className="text-[11px] text-neutral-700 dark:text-[#ececec] hover:underline font-semibold ml-auto flex items-center gap-1"
              >
                <span>Edit in Settings</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Controls Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-neutral-500 dark:text-[#9e9e9e]">
                    Target Prospect
                  </label>
                  <span className="text-[10px] text-neutral-600 dark:text-[#b4b4b4] font-medium">
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
                      const srv = selectedService !== 'All' ? selectedService : found.recommendedService || composerService;
                      setComposerService(srv);
                      generateEmailContent(found, composerTone, srv);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-none"
                >
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.companyName} ({l.contactFullName}) – {l.country}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No leads match current filter criteria
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-500 dark:text-[#9e9e9e] block mb-1">
                  Email Tone
                </label>
                <select
                  value={composerTone}
                  onChange={(e) => {
                    const tone = e.target.value as EmailTone;
                    setComposerTone(tone);
                    const found = filteredLeads.find(l => l.id === composerLeadId) || leads.find(l => l.id === composerLeadId);
                    if (found) generateEmailContent(found, tone, composerService);
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-none"
                >
                  <option value="Professional">Professional (Consultative)</option>
                  <option value="Friendly">Friendly & Approachable</option>
                  <option value="Concise">Concise (Direct to Point)</option>
                  <option value="Formal">Formal & Enterprise</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-neutral-500 dark:text-[#9e9e9e]">
                    Pitched Service
                  </label>
                  <span className="text-[10px] text-neutral-500 dark:text-[#8e8e8e]">
                    {selectedService !== 'All' ? `Filtered` : `${pitchedServiceOptions.length} available`}
                  </span>
                </div>
                <select
                  value={composerService}
                  onChange={(e) => {
                    const srv = e.target.value;
                    setComposerService(srv);
                    const found = filteredLeads.find(l => l.id === composerLeadId) || leads.find(l => l.id === composerLeadId);
                    if (found) generateEmailContent(found, composerTone, srv);
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-xl text-xs text-neutral-900 dark:text-white focus:outline-none"
                >
                  {pitchedServiceOptions.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-500 dark:text-[#9e9e9e] block mb-1">
                Email Subject Line
              </label>
              <input
                type="text"
                value={composedSubject}
                onChange={(e) => setComposedSubject(e.target.value)}
                placeholder="Subject line..."
                className="w-full px-3.5 py-2 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-xl text-xs text-neutral-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-neutral-500 dark:text-[#9e9e9e]">Message Body</label>
                {isDrafting && (
                  <span className="text-[11px] text-[#10a37f] flex items-center gap-1 font-semibold">
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
                className="w-full p-3.5 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-xl text-xs text-neutral-900 dark:text-[#ececec] leading-relaxed font-sans focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-neutral-200 dark:border-white/10 flex items-center justify-between flex-wrap gap-2">
              <button
                onClick={() => {
                  const found = leads.find(l => l.id === composerLeadId);
                  if (found) generateEmailContent(found, composerTone, composerService);
                }}
                className="px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#2f2f2f] hover:bg-neutral-200 dark:hover:bg-[#383838] text-neutral-800 dark:text-[#ececec] text-xs font-semibold flex items-center gap-1.5 border border-neutral-200 dark:border-white/10 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Regenerate Draft</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveCurrentDraft}
                  disabled={!composerLeadId || filteredLeads.length === 0}
                  className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-[#2f2f2f] hover:bg-neutral-200 dark:hover:bg-[#383838] disabled:opacity-40 text-neutral-900 dark:text-white text-xs font-semibold border border-neutral-200 dark:border-white/10 transition-colors"
                >
                  Save as Draft
                </button>
                <button
                  onClick={handleSendDirect}
                  disabled={!composerLeadId || filteredLeads.length === 0}
                  className="px-4 py-2 rounded-xl bg-[#10a37f] hover:bg-[#0e906f] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Approve & Send Now</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Outbound Sent History & Drafts */}
          <div className="chatgpt-card p-5 rounded-2xl flex flex-col h-[600px]">
            <div className="pb-3 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Mode A Outreach History</h3>
                <p className="text-[11px] text-neutral-500 dark:text-[#9e9e9e]">Campaign drafts & sent records</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-[#2f2f2f] text-neutral-700 dark:text-[#ececec] font-semibold border border-neutral-200 dark:border-white/10">
                {serviceDrafts.length} Total
              </span>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
              {serviceDrafts.map((d) => (
                <div
                  key={d.id}
                  className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#212121] border border-neutral-200 dark:border-white/10 text-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-semibold text-neutral-900 dark:text-white block">{d.recipientName}</span>
                      <span className="text-[11px] text-neutral-500 dark:text-[#9e9e9e]">{d.companyName}</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        d.status === 'Sent'
                          ? 'bg-[#10a37f]/15 text-[#0e906f] dark:text-[#34d399] border border-[#10a37f]/30'
                          : d.status === 'Awaiting Approval'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                          : 'bg-neutral-200 dark:bg-[#2f2f2f] text-neutral-700 dark:text-[#d4d4d4]'
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-700 dark:text-[#d4d4d4] font-medium truncate">
                    {d.subject}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-neutral-500 dark:text-[#8e8e8e] pt-1 border-t border-neutral-200 dark:border-white/10">
                    <span>
                      {d.sentAt
                        ? `Sent: ${new Date(d.sentAt).toLocaleDateString()}`
                        : `Created: ${new Date(d.createdAt).toLocaleDateString()}`}
                    </span>
                    <button
                      onClick={() => {
                        setComposedSubject(d.subject);
                        setComposedBody(d.body);
                        setComposerLeadId(d.leadId);
                      }}
                      className="text-neutral-900 dark:text-white hover:underline font-semibold"
                    >
                      Load in Editor
                    </button>
                  </div>
                </div>
              ))}

              {serviceDrafts.length === 0 && (
                <div className="p-8 text-center text-neutral-500 dark:text-[#9e9e9e] text-xs">
                  No outreach drafts generated yet for Mode A.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: FOLLOW-UP CADENCE
         ======================================================== */}
      {activeTab === 'followup' && (
        <div className="chatgpt-card p-5 rounded-2xl">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-neutral-200 dark:border-white/10">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <CalendarClock className="w-4 h-4" />
                <span>Mode A Follow-up Cadence (Day 3 & Day 7)</span>
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-[#9e9e9e]">
                Automated sales follow-up tracker showing exact company names
              </p>
            </div>

            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-[#212121] p-1 rounded-xl border border-neutral-200 dark:border-white/10">
              {(['All', 'Due Today', 'Overdue', 'Upcoming'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFollowUpTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    followUpTab === tab
                      ? 'bg-neutral-900 dark:bg-[#2f2f2f] text-white'
                      : 'text-neutral-600 dark:text-[#9e9e9e] hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Inbound Client Replies */}
          {clientReplies.filter(r => r.leadMode === 'service_leads').length > 0 && (
            <div className="pt-4 pb-3 border-b border-neutral-200 dark:border-white/10">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-[#10a37f] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    Inbound Client Replies Received ({clientReplies.filter(r => r.leadMode === 'service_leads').length})
                  </span>
                </span>
                <span className="text-[10px] text-neutral-500 dark:text-[#8e8e8e]">
                  Replied prospects pause automated follow-ups
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {clientReplies
                  .filter(r => r.leadMode === 'service_leads')
                  .map(reply => (
                    <div
                      key={reply.id}
                      className="p-3 rounded-xl bg-neutral-50 dark:bg-[#212121] border border-[#10a37f]/30 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                          {reply.leadName} ({reply.companyName})
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10a37f]/15 text-[#0e906f] dark:text-[#34d399] font-semibold">
                          {reply.sentiment}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 dark:text-[#b4b4b4] italic line-clamp-2">
                        "{reply.replySnippet}"
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-neutral-500 dark:text-[#8e8e8e] pt-1 border-t border-neutral-200 dark:border-white/10">
                        <span>{reply.replyDate}</span>
                        <span className="text-neutral-900 dark:text-white font-medium">{reply.status}</span>
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
                  className="p-4 rounded-xl bg-neutral-50 dark:bg-[#212121] border border-neutral-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-semibold text-neutral-900 dark:text-white text-sm">{task.leadName}</span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-[#2f2f2f] text-neutral-900 dark:text-white border border-neutral-200 dark:border-white/10 text-xs font-semibold flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-[#10a37f]" />
                        <span>Company: {task.companyName}</span>
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          task.status === 'Due Today'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                            : task.status === 'Overdue'
                            ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                            : 'bg-neutral-200 dark:bg-[#2f2f2f] text-neutral-700 dark:text-[#d4d4d4]'
                        }`}
                      >
                        {task.status} (Day {task.cadenceDay})
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-[#9e9e9e] flex items-center gap-1.5 pt-0.5">
                      <Mail className="w-3 h-3" />
                      <span>{task.email}</span>
                      <span>•</span>
                      <span>Due: {task.dueDate}</span>
                    </p>
                    {task.suggestedDraftSubject && (
                      <p className="text-xs text-neutral-700 dark:text-[#d4d4d4] mt-1 font-medium bg-white dark:bg-[#171717] p-2 rounded-lg border border-neutral-200 dark:border-white/10">
                        Follow-up for {task.companyName}: "{task.suggestedDraftSubject}"
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
                      className="px-3 py-1.5 rounded-xl bg-[#0d0d0d] dark:bg-white text-white dark:text-[#212121] text-xs font-semibold flex items-center gap-1.5 hover:opacity-85 transition-opacity"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Open Follow-up Email</span>
                    </button>

                    <button
                      onClick={() => {
                        setFollowUpTasks(prev =>
                          prev.map(t => (t.id === task.id ? { ...t, status: 'Completed' } : t))
                        );
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#2f2f2f] hover:bg-neutral-100 dark:hover:bg-[#383838] text-neutral-700 dark:text-[#ececec] text-xs font-semibold border border-neutral-200 dark:border-white/10 transition-colors"
                    >
                      Mark Done
                    </button>
                  </div>
                </div>
              ))}

            {followUpTasks.length === 0 && (
              <div className="p-8 text-center text-neutral-500 dark:text-[#9e9e9e] text-xs">
                No active follow-up tasks currently due for Mode A.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: 10 CORE SERVICES CATALOG
         ======================================================== */}
      {activeTab === 'services' && (
        <div className="chatgpt-card p-6 rounded-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-white/10 mb-5 flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#10a37f]" />
                <span>DataGalactic 10 Core Services Catalog</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-[#9e9e9e] mt-1">
                High-precision B2B service offerings with verified conversion hooks
              </p>
            </div>
            <button
              onClick={() => setActiveTab('agent')}
              className="px-4 py-2 rounded-xl bg-[#0d0d0d] dark:bg-white text-white dark:text-[#212121] text-xs font-semibold flex items-center gap-1.5 hover:opacity-85 transition-opacity"
            >
              <Bot className="w-4 h-4" />
              <span>Return to AI Agent</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DATAGALACTIC_SERVICES.map((srv, idx) => (
              <div
                key={srv.id}
                className="p-4 rounded-xl bg-neutral-50 dark:bg-[#212121] border border-neutral-200 dark:border-white/10 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-neutral-900 dark:text-white text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-neutral-200 dark:bg-[#2f2f2f] text-neutral-800 dark:text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </span>
                    {srv.name}
                  </span>
                  <button
                    onClick={() => {
                      if (!chatSelectedCountry) setChatSelectedCountry('United Kingdom (UK)');
                      setActiveTab('agent');
                      handleSendChatMessage(`How do we pitch ${srv.name}?`);
                    }}
                    className="text-xs text-[#10a37f] hover:underline font-semibold shrink-0"
                  >
                    Ask Agent →
                  </button>
                </div>
                <p className="text-xs text-neutral-600 dark:text-[#b4b4b4] leading-relaxed">{srv.shortDesc}</p>
                <div className="text-xs p-2.5 rounded-lg bg-white dark:bg-[#171717] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-[#d4d4d4]">
                  <strong className="text-neutral-900 dark:text-white">Pitch Hook:</strong> "{srv.pitchSnippet}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 6: SETTINGS & COMPANY SENDER PROFILE
         ======================================================== */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <SettingsPage mode="mode_a" />
        </div>
      )}
    </div>
  );
};
