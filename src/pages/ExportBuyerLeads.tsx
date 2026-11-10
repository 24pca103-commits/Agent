import React, { useState, useRef, useEffect } from 'react';
import {
  Globe2,
  Package,
  Ship,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Bot,
  Send,
  CalendarClock,
  RefreshCw,
  Building2,
  ArrowRight,
  Mail,
  Printer,
  Table as TableIcon,
  LayoutGrid,
  ChevronLeft,
  CheckCircle2,
  Settings as SettingsIcon,
  SquarePen,
  ArrowUp
} from 'lucide-react';
import { Lead, EmailDraft, EmailTone, FollowUpTask, ClientReply, ChatMessage } from '../types';
import { DATAGALACTIC_COMPANY } from '../data/catalog';
import { StatusBadge } from '../components/Badge';
import { exportLeadsToPdf } from '../utils/exportPdf';
import { SettingsPage } from './SettingsPage';
import { useCompanySettings } from '../utils/settingsStorage';
import { InlineLeadsTable } from '../components/InlineLeadsTable';
import { renderFormattedChatText } from '../utils/formatChatText';
import { detectCountryFromPrompt, generateFallbackLeads } from '../utils/leadSourcingFallback';

interface ExportBuyerLeadsProps {
  initialTab?: 'agent' | 'leads' | 'email' | 'followup' | 'products' | 'settings';
  onTabChange?: (tab: 'agent' | 'leads' | 'email' | 'followup' | 'products' | 'settings') => void;
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

export const ExportBuyerLeads: React.FC<ExportBuyerLeadsProps> = ({
  initialTab = 'agent',
  onTabChange,
  leads,
  drafts,
  clientReplies = [],
  chatSessionId = 'session-b-initial',
  initialMessages = [],
  onSyncChatMessages,
  onNewChat,
  onAddNewLead,
  onAddMultipleLeads,
  onSaveDraftForApproval,
  onApproveAndSend,
  onUpdateLead
}) => {
  const [activeTab, setActiveTabState] = useState<'agent' | 'leads' | 'email' | 'followup' | 'products' | 'settings'>(
    initialTab
  );
  const [downloadedFileNotice, setDownloadedFileNotice] = useState<string | null>(null);
  const { settings } = useCompanySettings('mode_b');

  const setActiveTab = (tab: 'agent' | 'leads' | 'email' | 'followup' | 'products' | 'settings') => {
    setActiveTabState(tab);
    if (onTabChange) onTabChange(tab);
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTabState(initialTab);
    }
  }, [initialTab]);

  // Filter only export_buyers leads
  const buyerLeads = leads.filter(l => l.leadMode === 'export_buyers');
  const exportDrafts = drafts.filter(d => {
    const parentLead = leads.find(l => l.id === d.leadId);
    return d.leadMode === 'export_buyers' || (parentLead && parentLead.leadMode === 'export_buyers');
  });

  // Export Sourcing Config State
  const [productCategory, setProductCategory] = useState('Agro-Commodities & Spices');
  const [targetCountry, setTargetCountry] = useState('United Arab Emirates (UAE)');
  const [minOrderQty, setMinOrderQty] = useState('1 x 20ft Full Container Load (FCL)');
  const [isSearching, setIsSearching] = useState(false);
  const [sourcingSuccess, setSourcingSuccess] = useState<string | null>(null);

  // View & Pagination States (Tab 2)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // AI Agent Chat State (Starts clean/empty on load)
  const [chatInput, setChatInput] = useState<string>('');
  const [chatSelectedCountry, setChatSelectedCountry] = useState<string>('United Arab Emirates (UAE)');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages);
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChatMessages(initialMessages);
    setIsAgentThinking(false);
  }, [chatSessionId]);

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
  const [composerLeadId, setComposerLeadId] = useState<string>(buyerLeads[0]?.id || '');
  const [composerTone, setComposerTone] = useState<EmailTone>('Formal');
  const [composedSubject, setComposedSubject] = useState<string>('');
  const [composedBody, setComposedBody] = useState<string>('');
  const [isDrafting, setIsDrafting] = useState<boolean>(false);
  const [sendSuccessMsg, setSendSuccessMsg] = useState<string | null>(null);

  // Follow-up Tasks State for Mode B
  const [followUpTasks, setFollowUpTasks] = useState<FollowUpTask[]>([
    {
      id: 'exp-task-1',
      leadId: 'lead-dg-006',
      leadName: 'Erik Lindqvist',
      companyName: 'Biofood-Biolivs AB',
      email: 'erik.l@biofood.se',
      lastEmailSentDate: '2026-10-15T11:00:00Z',
      dueDate: new Date().toISOString().split('T')[0],
      status: 'Due Today',
      cadenceDay: 3,
      suggestedDraftSubject: 'Update regarding organic spices sample packet dispatch for Biofood Stockholm',
      suggestedDraftBody: `Hej Erik,\n\nFollowing up on our exchange regarding certified organic spices container supply for Biofood-Biolivs.\n\nOur export documentation and lab COA (Certificate of Analysis) are prepared. Did you have a moment to review our product specification sheets?\n\nBest regards,\nRisona - Global Trade Operations`
    },
    {
      id: 'exp-task-2',
      leadId: 'lead-dg-007',
      leadName: 'Tariq Al-Hashimi',
      companyName: 'Truebell Marketing & Trading LLC',
      email: 'tariq.h@truebell.org',
      lastEmailSentDate: '2026-10-13T14:00:00Z',
      dueDate: '2026-10-18',
      status: 'Upcoming',
      cadenceDay: 7,
      suggestedDraftSubject: 'CIF Dubai price schedule & Halal verification for Truebell bulk food procurement',
      suggestedDraftBody: `Dear Mr. Tariq Al-Hashimi,\n\nI am writing to check if your procurement division reviewed our CIF Jebel Ali quotation for bulk container food commodities.\n\nWe would be honored to arrange an introductory video exchange or forward official laboratory sample packs to your Dubai Investment Park facility.\n\nRespectfully,\nRisona - Export Division`
    }
  ]);
  const [followUpTab, setFollowUpTab] = useState<'All' | 'Due Today' | 'Overdue' | 'Upcoming'>('All');

  // Pagination Calculations
  const effectivePageSize = pageSize === 0 ? (buyerLeads.length || 1) : pageSize;
  const totalPages = Math.ceil(buyerLeads.length / effectivePageSize) || 1;
  const paginatedLeads =
    pageSize === 0
      ? buyerLeads
      : buyerLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Mode B Stats
  const awaitingApprovalCount = exportDrafts.filter(d => d.status === 'Awaiting Approval').length;
  const sentCount = exportDrafts.filter(d => d.status === 'Sent').length;
  const followUpsDueCount = followUpTasks.filter(t => t.status === 'Due Today' || t.status === 'Overdue').length;

  // CSV Export Helper
  const handleExportCsv = (leadsToExport: Lead[]) => {
    if (!leadsToExport || leadsToExport.length === 0) return;
    const headers = [
      'Index', 'Company Name', 'Website', 'Decision Maker', 'Job Title',
      'Business Email', 'Phone', 'City', 'Country', 'Buyer Type',
      'Target Product', 'MOQ', 'Score', 'Status'
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
      `"${(l.buyerType || '').replace(/"/g, '""')}"`,
      `"${(l.targetProductCategory || '').replace(/"/g, '""')}"`,
      `"${(l.minOrderQuantity || '1 FCL').replace(/"/g, '""')}"`,
      l.leadScore,
      `"${l.leadStatus}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `export_buyers_${(chatSelectedCountry || targetCountry || 'all').toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Start clean New Chat session
  const handleStartNewChat = () => {
    setChatInput('');
    setSourcingSuccess(null);
    setIsAgentThinking(false);
    if (onNewChat) {
      onNewChat();
    } else {
      setChatMessages([]);
    }
  };

  // Handle Sourcing Search
  const handleSourcingSearch = async (
    overrideCount?: number,
    customPrompt?: string,
    overrideCountry?: string,
    overrideCategory?: string
  ) => {
    const targetCount = overrideCount || 50;
    const countryToUse = overrideCountry || chatSelectedCountry || targetCountry || 'United Arab Emirates (UAE)';
    const categoryToUse = overrideCategory || productCategory;
    setIsAgentThinking(true);
    setIsSearching(true);
    setSourcingSuccess(null);

    try {
      let data: {
        success?: boolean;
        leads?: Lead[];
        country?: string;
      } | null = null;

      try {
        const response = await fetch('/api/leads/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: customPrompt,
            filters: {
              prompt: customPrompt,
              requestedCount: targetCount,
              leadMode: 'export_buyers',
              country: countryToUse,
              industry: 'Export & Import Trade',
              targetProductCategory: categoryToUse
            }
          })
        });

        if (response.ok) {
          const json = await response.json();
          if (json?.success && Array.isArray(json.leads) && json.leads.length > 0) {
            data = json;
          }
        }
      } catch (apiErr) {
        console.warn('Export buyer backend unreachable, falling back to local engine:', apiErr);
      }

      if (!data) {
        const fallback = generateFallbackLeads({
          prompt: customPrompt,
          leadMode: 'export_buyers',
          country: countryToUse,
          targetProductCategory: categoryToUse,
          requestedCount: targetCount
        });
        data = {
          success: true,
          leads: fallback.leads,
          country: fallback.country
        };
      }

      if (data.success && data.leads && data.leads.length > 0) {
        if (onAddMultipleLeads) {
          onAddMultipleLeads(data.leads);
        } else {
          data.leads.forEach((l: Lead) => onAddNewLead(l));
        }

        const finalCountry = data.country || countryToUse;
        setSourcingSuccess(`Successfully sourced ${data.leads.length} verified overseas buyers in ${finalCountry}!`);

        const agentMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'agent',
          text: `Sourced **${data.leads.length} verified overseas buyers** in **${finalCountry}**.\n\n• **Product Category:** ${categoryToUse}\n• **Container MOQ:** ${minOrderQty}\n• **Compliance Focus:** ISO 22000, HACCP, Halal / Trade Verified`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          leads: data.leads,
          industry: categoryToUse,
          country: finalCountry,
          suggestedAction: {
            type: 'download_pdf',
            leadCount: data.leads.length
          }
        };

        appendChatMessages([agentMsg]);
        return data.leads;
      }
    } catch (err) {
      console.error('Error sourcing export buyers:', err);
      appendChatMessages([
        {
          id: `msg-${Date.now()}`,
          sender: 'agent',
          text: `Could not source export buyers for "${customPrompt || 'your request'}". Please try specifying a product category and country (e.g. "50 UAE agro spice buyers").`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAgentThinking(false);
      setIsSearching(false);
    }
  };

  // Agent Chat Handler with natural-language Country & Product Category detection
  const handleSendChatMessage = async (textToSend?: string) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    const lower = query.toLowerCase();

    const isReplyQuery =
      lower.includes('reply') ||
      lower.includes('replied') ||
      lower.includes('response') ||
      lower.includes('inbound') ||
      lower.includes('vanthucha') ||
      lower.includes('vandhucha');

    // Auto-detect Country
    const detectedCountry = detectCountryFromPrompt(query);

    if (detectedCountry) {
      setChatSelectedCountry(detectedCountry);
      setTargetCountry(detectedCountry);
    }

    // Auto-detect Product Category
    let detectedCategory: string | undefined;
    if (lower.includes('spice') || lower.includes('agro') || lower.includes('pepper') || lower.includes('cardamom')) {
      detectedCategory = 'Agro-Commodities & Spices';
    } else if (lower.includes('organic') || lower.includes('superfood') || lower.includes('moringa')) {
      detectedCategory = 'Organic Foods & Health Products';
    } else if (lower.includes('food') || lower.includes('beverage') || lower.includes('rice') || lower.includes('mango')) {
      detectedCategory = 'Processed Food & Beverages';
    } else if (lower.includes('garment') || lower.includes('apparel') || lower.includes('textile') || lower.includes('cotton')) {
      detectedCategory = 'Apparel, Garments & Textiles';
    } else if (lower.includes('chemical') || lower.includes('mineral')) {
      detectedCategory = 'Industrial Chemicals & Minerals';
    } else if (lower.includes('engineering') || lower.includes('auto') || lower.includes('cnc') || lower.includes('machin')) {
      detectedCategory = 'Engineering & Auto Components';
    } else if (lower.includes('ceramic') || lower.includes('tile') || lower.includes('sanitary')) {
      detectedCategory = 'Ceramics, Tiles & Sanitaryware';
    }

    if (detectedCategory) {
      setProductCategory(detectedCategory);
    }

    const activeCountry = detectedCountry || chatSelectedCountry || targetCountry || 'United Arab Emirates (UAE)';

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    appendChatMessages([userMsg]);
    if (!textToSend) setChatInput('');

    // Handle Overseas Buyer Replies Query
    if (isReplyQuery) {
      setIsAgentThinking(true);
      setTimeout(() => {
        const modeBReplies = clientReplies.filter(r => r.leadMode === 'export_buyers');
        let replyText = '';
        if (modeBReplies.length > 0) {
          replyText =
            `We have **${modeBReplies.length} active trade buyer replies** for Mode B Export Buyers:\n\n` +
            modeBReplies
              .map(
                (r, idx) =>
                  `**${idx + 1}. ${r.leadName}** — *${r.companyName}* (${r.replyDate})\n` +
                  `• **Subject:** ${r.replySubject}\n` +
                  `• **Buyer Message:** "${r.replySnippet}"\n` +
                  `• **Sentiment:** ${r.sentiment} • **Status:** ${r.status}`
              )
              .join('\n\n') +
            `\n\nYou can also manage full buyer response statuses in **Dashboard** or schedule sample follow-ups in **Follow-ups**.`;
        } else {
          replyText = `No new overseas buyer replies received yet for Mode B.`;
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

    let requestedCount = 50;
    const matchCount = query.match(/\b(\d+)\b/);
    if (matchCount && parseInt(matchCount[1]) > 0) {
      requestedCount = Math.min(100, parseInt(matchCount[1]));
    } else if (lower.includes('100')) {
      requestedCount = 100;
    }

    const isBuyerSearch =
      lower.includes('100') ||
      lower.includes('50') ||
      lower.includes('buyer') ||
      lower.includes('importer') ||
      lower.includes('distributor') ||
      lower.includes('wholesaler') ||
      lower.includes('search') ||
      lower.includes('source') ||
      lower.includes('find') ||
      lower.includes('need') ||
      lower.includes('get') ||
      lower.includes('show') ||
      lower.includes('list') ||
      lower.includes('give') ||
      lower.includes('venum') ||
      lower.includes('kudu') ||
      lower.includes('edunga') ||
      lower.includes('eduthu') ||
      /\b\d+\b/.test(lower) ||
      !!detectedCountry ||
      !!detectedCategory;

    if (isBuyerSearch) {
      await handleSourcingSearch(requestedCount, query, activeCountry, detectedCategory || productCategory);
      return;
    }

    setIsAgentThinking(true);

    setTimeout(() => {
      let replyText = '';
      if (lower.includes('moq') || lower.includes('container') || lower.includes('fcl')) {
        replyText = `Standard International Trade MOQ benchmarks:\n\n• **Spices & High-Value Agro:** 1 x 20ft Full Container Load (approx. 14-18 Metric Tons).\n• **Grains & Bulk Commodities:** 1 x 40ft FCL or 25-50 MT breakbulk.\n• **Samples:** Usually 250g - 500g courier packs sent via DHL/FedEx with Certificate of Analysis (COA).`;
      } else if (lower.includes('halal') || lower.includes('iso') || lower.includes('cert')) {
        replyText = `Key Export Compliance Certifications by Region:\n\n• **UAE & Saudi Arabia (GCC):** ESMA Halal, ISO 22000, HACCP, SFDA / SABER registration.\n• **European Union:** EU Organic (EC 834/2007), MRL lab test reports.\n• **United States:** US FDA Food Facility Registration & Prior Notice.`;
      } else {
        replyText = `In Mode B, I source verified overseas importers, distributors, and wholesalers for physical product exports.\n\nAsk me anything like **"50 UAE agro spice buyers"**, **"100 Germany organic food importers"**, or **"50 Saudi ceramic tile distributors"**.`;
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
    }, 600);
  };

  // Generate Email for Selected Buyer
  const handleGeneratePitchForBuyer = (buyer: Lead) => {
    setComposerLeadId(buyer.id);
    setActiveTab('email');
    generateExportEmailContent(buyer, composerTone);
  };

  const generateExportEmailContent = (targetBuyer: Lead, tone: EmailTone) => {
    setIsDrafting(true);
    setSendSuccessMsg(null);

    setTimeout(() => {
      const subject =
        tone === 'Concise'
          ? `Direct Export Supply: Container-load ${targetBuyer.targetProductCategory || 'Agro-Commodities'} for ${targetBuyer.companyName}`
          : `Export Trade Inquiry: Certified ${targetBuyer.targetProductCategory || 'Commodity Products'} for ${targetBuyer.companyName} (${targetBuyer.country})`;

      let greeting = `Dear Mr./Ms. ${targetBuyer.contactLastName || targetBuyer.contactFirstName},`;
      if (tone === 'Friendly') greeting = `Hi ${targetBuyer.contactFirstName},`;

      const certText =
        targetBuyer.productCertifications && targetBuyer.productCertifications.length > 0
          ? `We maintain certified compliance with ${targetBuyer.productCertifications.join(', ')}.`
          : `We maintain certified compliance with ISO 22000, HACCP, and international export safety standards.`;

      const body = `${greeting}

I hope this message finds you well at ${targetBuyer.companyName}.

We are direct international suppliers specializing in export-grade ${targetBuyer.targetProductCategory || 'food and agro commodities'}. We noticed ${targetBuyer.companyName}'s prominent position as a trusted ${targetBuyer.buyerType || 'importer & distributor'} across ${targetBuyer.country}.

${certText} We have immediate container allocations available for ${targetBuyer.regionCity || targetBuyer.country} port delivery, supported by full third-party laboratory inspection reports and Phytosanitary certificates.

We would be pleased to forward our 2026 Export Product Catalog along with current CIF port price schedules. Furthermore, we are happy to dispatch complimentary courier sample packets to your procurement office for quality appraisal.

Could you let us know if your procurement committee is currently accepting supplier quotations for upcoming container shipments?

Respectfully yours,

${settings.founder || DATAGALACTIC_COMPANY.founder}
${settings.companyName || 'Global Trade Operations'}
${settings.website || DATAGALACTIC_COMPANY.website}
Email: ${settings.companyEmail}`;

      setComposedSubject(subject);
      setComposedBody(body);
      setIsDrafting(false);
    }, 300);
  };

  // Save Draft
  const handleSaveCurrentDraft = () => {
    const targetLead = leads.find(l => l.id === composerLeadId);
    if (!targetLead) return;

    const newDraft: EmailDraft = {
      id: `draft-exp-${Date.now()}`,
      leadId: targetLead.id,
      recipientEmail: targetLead.businessEmail,
      recipientName: targetLead.contactFullName,
      companyName: targetLead.companyName,
      jobTitle: targetLead.jobTitle,
      subject: composedSubject,
      body: composedBody,
      tone: composerTone,
      recommendedService: targetLead.targetProductCategory || 'Export Sourcing',
      leadMode: 'export_buyers',
      senderEmail: settings.companyEmail,
      senderName: settings.founder,
      status: 'Awaiting Approval',
      createdAt: new Date().toISOString()
    };

    onSaveDraftForApproval(newDraft);
    setSendSuccessMsg(`Export draft saved and queued for Approval Gate (From: ${settings.companyEmail}).`);
  };

  // Send Direct
  const handleSendDirect = async () => {
    const targetLead = leads.find(l => l.id === composerLeadId);
    if (!targetLead) return;

    const tempDraftId = `draft-exp-${Date.now()}`;
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
      recommendedService: targetLead.targetProductCategory || 'Export Sourcing',
      leadMode: 'export_buyers',
      senderEmail: settings.companyEmail,
      senderName: settings.founder,
      status: 'Awaiting Approval',
      createdAt: new Date().toISOString()
    };

    onSaveDraftForApproval(newDraft);
    await onApproveAndSend(tempDraftId);

    const newFollowUpTask: FollowUpTask = {
      id: `exp-task-${Date.now()}`,
      leadId: targetLead.id,
      leadName: targetLead.contactFullName,
      companyName: targetLead.companyName,
      email: targetLead.businessEmail,
      lastEmailSentDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Due Today',
      cadenceDay: 3,
      suggestedDraftSubject: `Export quotation follow-up for ${targetLead.companyName}`,
      suggestedDraftBody: `Dear ${targetLead.contactFirstName},\n\nChecking in regarding our export trade inquiry and CIF quotation for ${targetLead.companyName}.\n\nBest regards,\n${settings.founder} - ${settings.companyName}`
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
      `Export inquiry dispatched from ${settings.companyEmail} (${settings.founder}) to ${targetLead.businessEmail}!`
    );
  };

  // Reusable ChatGPT Pill Composer for Mode B
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
        placeholder={`Ask Export AI Agent (e.g. "50 ${chatSelectedCountry} buyers", "100 Germany organic importers")...`}
        className="chatgpt-pill-input w-full bg-transparent border-0 resize-none text-sm text-neutral-900 dark:text-[#ececec] placeholder-neutral-500 dark:placeholder-[#9e9e9e] focus:outline-none leading-relaxed max-h-36"
      />

      <div className="flex items-center justify-between gap-2 pt-2 mt-1 border-t border-neutral-200/70 dark:border-white/10 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <select
            value={chatSelectedCountry}
            onChange={(e) => {
              setChatSelectedCountry(e.target.value);
              setTargetCountry(e.target.value);
            }}
            className="chatgpt-pill-select px-2.5 py-1.5 rounded-full bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 text-xs font-medium text-neutral-800 dark:text-[#ececec] cursor-pointer focus:outline-none"
          >
            <option value="United Arab Emirates (UAE)">🇦🇪 UAE (Dubai)</option>
            <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
            <option value="Germany">🇩🇪 Germany</option>
            <option value="United Kingdom (UK)">🇬🇧 United Kingdom</option>
            <option value="United States (USA)">🇺🇸 United States</option>
            <option value="Canada">🇨🇦 Canada</option>
            <option value="Singapore">🇸🇬 Singapore</option>
            <option value="Australia">🇦🇺 Australia</option>
          </select>

          <select
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
            className="chatgpt-pill-select px-2.5 py-1.5 rounded-full bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 text-xs font-medium text-neutral-800 dark:text-[#ececec] cursor-pointer focus:outline-none max-w-[175px] truncate"
          >
            <option value="Agro-Commodities & Spices">Agro & Spices</option>
            <option value="Processed Food & Beverages">Processed Food</option>
            <option value="Organic Foods & Health Products">Organic Foods</option>
            <option value="Apparel, Garments & Textiles">Apparel & Textiles</option>
            <option value="Industrial Chemicals & Minerals">Chemicals & Minerals</option>
            <option value="Engineering & Auto Components">Engineering & Auto</option>
            <option value="Ceramics, Tiles & Sanitaryware">Ceramics & Tiles</option>
          </select>

          <select
            value={minOrderQty}
            onChange={(e) => setMinOrderQty(e.target.value)}
            className="chatgpt-pill-select hidden sm:inline-block px-2.5 py-1.5 rounded-full bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 text-xs font-medium text-neutral-800 dark:text-[#ececec] cursor-pointer focus:outline-none max-w-[140px] truncate"
          >
            <option value="1 x 20ft Full Container Load (FCL)">1x20ft FCL</option>
            <option value="1 x 40ft High Cube FCL">1x40ft HQ FCL</option>
            <option value="LCL / Air Cargo Pallet">LCL / Air Pallet</option>
          </select>

          {!centered && chatMessages.length > 0 && (
            <button
              onClick={handleStartNewChat}
              className="px-2.5 py-1.5 rounded-full text-xs font-medium text-neutral-600 dark:text-[#b4b4b4] hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/70 dark:hover:bg-[#383838] flex items-center gap-1 transition-colors"
              title="Start new chat"
            >
              <SquarePen className="w-3.5 h-3.5" />
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
      {/* Header visible on structured workspace tabs 2-6 */}
      {activeTab !== 'agent' && (
        <div className="chatgpt-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-[#2f2f2f] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-[#d4d4d4] text-[11px] font-medium mb-2">
              <Globe2 className="w-3.5 h-3.5" />
              <span>Mode B • International Export Trade Hub</span>
            </div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Export Buyer Sourcing & Outreach
            </h1>
            <p className="text-xs text-neutral-500 dark:text-[#9e9e9e] mt-0.5 max-w-2xl">
              Manage overseas importers, container MOQs, Halal/ISO certifications, and outbound trade proposals.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#212121] border border-neutral-200 dark:border-white/10 text-center min-w-[74px]">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-[#8e8e8e] block font-semibold">
                Buyers
              </span>
              <span className="text-base font-bold text-neutral-900 dark:text-white">{buyerLeads.length}</span>
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

      {/* Slim ChatGPT Sub-Navigation Strip */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-neutral-200/80 dark:border-white/10 overflow-x-auto">
        <div className="flex items-center gap-1 flex-nowrap">
          {[
            { id: 'agent', label: 'Export AI Chat', icon: Bot },
            { id: 'leads', label: `Saved Buyers (${buyerLeads.length})`, icon: Building2 },
            { id: 'email', label: `Export Proposals (${exportDrafts.length})`, icon: Mail },
            { id: 'followup', label: `Follow-ups (${followUpTasks.length})`, icon: CalendarClock },
            { id: 'products', label: 'Products & MOQ', icon: Package },
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

      {/* Download Notification Toast */}
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
          TAB 1: CHATGPT SINGLE-COLUMN EXPORT AI AGENT
         ======================================================== */}
      {activeTab === 'agent' && (
        <div className="flex-1 flex flex-col w-full min-h-[calc(100vh-11rem)]">
          {chatMessages.length === 0 ? (
            /* STANDBY VIEW (Vertically Centered ChatGPT Screen) */
            <div className="flex-1 flex flex-col items-center justify-center py-8 px-2 max-w-3xl mx-auto w-full">
              <div className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-[#2f2f2f] border border-neutral-200 dark:border-white/10 flex items-center justify-center mb-4">
                <Ship className="w-6 h-6 text-neutral-800 dark:text-white" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-white text-center tracking-tight">
                Which export buyers are we sourcing?
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#9e9e9e] mt-1.5 mb-6 text-center">
                Mode B Global Trade AI • Overseas Importers, Distributors & Wholesalers
              </p>

              {/* Centered Pill Composer */}
              {renderChatComposer(true)}

              {/* Subtle Suggestion Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-5 max-w-2xl">
                {[
                  '50 UAE agro spice buyers',
                  '100 UAE buyers venum',
                  '50 Saudi ceramic tile buyers',
                  '50 Germany organic food importers',
                  'Buyer replies status venum',
                  'Agro-Commodities MOQ'
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
                          <Ship className="w-3.5 h-3.5" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-2 text-sm text-neutral-800 dark:text-[#ececec] leading-relaxed">
                          <div>{renderFormattedChatText(msg.text)}</div>

                          {/* Inline Sourced Buyers Table rendered inside Agent Message */}
                          {msg.leads && msg.leads.length > 0 && (
                            <InlineLeadsTable
                              leads={msg.leads}
                              mode="export_buyers"
                              industryOrCategory={msg.industry}
                              country={msg.country}
                              onPitchLead={handleGeneratePitchForBuyer}
                              onExportCsv={handleExportCsv}
                              onPdfDownloaded={setDownloadedFileNotice}
                            />
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
                    <span>Searching verified overseas buyers in {chatSelectedCountry || targetCountry}...</span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Sticky Bottom Pill Composer */}
              <div className="sticky bottom-0 z-20 pt-3 pb-1 bg-gradient-to-t from-white via-white/95 dark:from-[#212121] dark:via-[#212121]/95 to-transparent w-full">
                {renderChatComposer(false)}
                <p className="text-[10px] text-center text-neutral-400 dark:text-[#8e8e8e] mt-1.5">
                  Export Hub AI • Importers & distributors synced to Saved Buyers List
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: OVERSEAS BUYER LEADS DIRECTORY
         ======================================================== */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="chatgpt-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                Overseas Buyer Directory ({buyerLeads.length})
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10a37f]/15 text-[#0e906f] dark:text-[#34d399] border border-[#10a37f]/25 font-medium">
                Verified Importers
              </span>
              {sourcingSuccess && (
                <span className="text-[11px] text-[#10a37f] font-semibold">✓ {sourcingSuccess}</span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleSourcingSearch(100)}
                disabled={isSearching}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d0d0d] dark:bg-white text-white dark:text-[#212121] disabled:opacity-50 text-xs font-semibold hover:opacity-85 transition-opacity"
              >
                {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Source 100 Buyers</span>
              </button>

              <button
                onClick={() =>
                  exportLeadsToPdf(buyerLeads, {
                    title: 'International Export Buyer Intelligence Dossier',
                    leadMode: 'export_buyers'
                  })
                }
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#10a37f] hover:bg-[#0e906f] text-white text-xs font-semibold transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Download PDF ({buyerLeads.length})</span>
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
                <option value={0}>Show All ({buyerLeads.length})</option>
              </select>
            </div>
          </div>

          {viewMode === 'table' && buyerLeads.length > 0 && (
            <div className="chatgpt-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-[#1e1e1e] border-b border-neutral-200 dark:border-white/10 text-neutral-500 dark:text-[#9e9e9e] text-[10px] uppercase tracking-wider">
                      <th className="py-3 px-3 text-center w-10">#</th>
                      <th className="py-3 px-4 font-semibold min-w-[200px]">Buyer Enterprise</th>
                      <th className="py-3 px-4 font-semibold min-w-[170px]">Procurement Lead</th>
                      <th className="py-3 px-4 font-semibold min-w-[210px]">Direct Email</th>
                      <th className="py-3 px-4 font-semibold min-w-[150px]">Port & Destination</th>
                      <th className="py-3 px-4 font-semibold min-w-[200px]">Target Products & MOQ</th>
                      <th className="py-3 px-4 font-semibold text-center w-20">Score</th>
                      <th className="py-3 px-4 font-semibold text-center w-28">Status</th>
                      <th className="py-3 px-4 font-semibold text-right w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                    {paginatedLeads.map((buyer, idx) => (
                      <tr key={buyer.id} className="hover:bg-neutral-50 dark:hover:bg-[#212121] transition-colors">
                        <td className="py-3 px-3 text-center font-mono text-neutral-400 text-[11px]">
                          {(currentPage - 1) * (pageSize || 1) + idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-neutral-900 dark:text-white text-xs flex items-center gap-1.5">
                            <span>{buyer.companyName}</span>
                            <a
                              href={buyer.companyWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <div className="text-[10px] text-neutral-500 dark:text-[#9e9e9e] mt-0.5">
                            {buyer.buyerType?.toUpperCase() || 'IMPORTER & DISTRIBUTOR'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-neutral-800 dark:text-[#ececec]">{buyer.contactFullName}</div>
                          <div className="text-[10px] text-neutral-500 dark:text-[#9e9e9e]">{buyer.jobTitle}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-neutral-800 dark:text-[#d4d4d4] text-xs flex items-center gap-1">
                            <span>{buyer.businessEmail}</span>
                            <ShieldCheck className="w-3 h-3 text-[#10a37f]" />
                          </div>
                          {buyer.publicBusinessPhone && (
                            <div className="text-[10px] text-neutral-500 dark:text-[#8e8e8e] mt-0.5">
                              {buyer.publicBusinessPhone}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-neutral-600 dark:text-[#b4b4b4] text-xs">
                          {buyer.regionCity || buyer.country}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-xs font-medium text-neutral-900 dark:text-white">
                            {buyer.targetProductCategory || 'Agro-Commodities'}
                          </div>
                          <div className="text-[10px] text-neutral-500 dark:text-[#8e8e8e] mt-0.5">
                            MOQ: {buyer.minOrderQuantity || '1 x 20ft FCL'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-semibold text-[#10a37f] text-xs">{buyer.leadScore}/100</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge status={buyer.leadStatus} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleGeneratePitchForBuyer(buyer)}
                            className="px-2.5 py-1 rounded-lg bg-[#0d0d0d] dark:bg-white text-white dark:text-[#212121] hover:opacity-85 text-[11px] font-semibold transition-opacity whitespace-nowrap"
                          >
                            Send Pitch
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedLeads.map((buyer) => (
                <div key={buyer.id} className="chatgpt-card p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">{buyer.companyName}</h3>
                          <a
                            href={buyer.companyWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-[#9e9e9e] font-medium">
                          {buyer.regionCity || buyer.country} • {buyer.buyerType?.toUpperCase() || 'IMPORTER'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-[#10a37f]">{buyer.leadScore}/100</div>
                        <span className="text-[10px] text-neutral-400">Trade Score</span>
                      </div>
                    </div>

                    <div className="mt-4 p-3.5 rounded-xl bg-neutral-50 dark:bg-[#212121] border border-neutral-200 dark:border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">{buyer.contactFullName}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-md bg-neutral-200/70 dark:bg-[#2f2f2f] text-neutral-700 dark:text-[#d4d4d4] font-medium">
                          {buyer.jobTitle}
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-xs pt-2.5 border-t border-neutral-200 dark:border-white/10">
                        <span className="text-neutral-700 dark:text-[#d4d4d4] font-mono text-xs">{buyer.businessEmail}</span>
                        <span className="text-xs text-[#10a37f] font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {buyer.emailVerificationStatus} ({buyer.emailConfidenceScore}%)
                        </span>
                      </div>
                    </div>

                    <div className="mt-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500 dark:text-[#9e9e9e]">Product Category:</span>
                        <span className="font-semibold text-neutral-900 dark:text-white">
                          {buyer.targetProductCategory || 'Agro-Commodities'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500 dark:text-[#9e9e9e]">MOQ:</span>
                        <span className="text-neutral-700 dark:text-[#d4d4d4]">
                          {buyer.minOrderQuantity || '1 x 20ft FCL'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-white/10 flex items-center justify-between">
                    <StatusBadge status={buyer.leadStatus} />
                    <button
                      onClick={() => handleGeneratePitchForBuyer(buyer)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d0d0d] dark:bg-white text-white dark:text-[#212121] text-xs font-semibold hover:opacity-85 transition-opacity"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Write Pitch</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {buyerLeads.length > 0 && pageSize > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-white/10 text-xs text-neutral-500 dark:text-[#9e9e9e]">
              <span>
                Showing {Math.min((currentPage - 1) * pageSize + 1, buyerLeads.length)} to{' '}
                {Math.min(currentPage * pageSize, buyerLeads.length)} of {buyerLeads.length} buyers
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

          {buyerLeads.length === 0 && (
            <div className="chatgpt-card p-12 text-center rounded-2xl">
              <p className="text-sm text-neutral-500 dark:text-[#9e9e9e]">
                No overseas buyers sourced yet. Use the AI Chat or click below to scan trade directories.
              </p>
              <button
                onClick={() => handleSourcingSearch(100)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0d0d0d] dark:bg-white text-white dark:text-[#212121] text-xs font-semibold"
              >
                <Sparkles className="w-4 h-4" />
                <span>Source 100 Verified Overseas Buyers</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: EXPORT MAIL PROCESSING
         ======================================================== */}
      {activeTab === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 chatgpt-card p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-white/10 flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Mode B Export Inquiry Generator</span>
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-[#9e9e9e]">
                  Compose formal international buyer pitches and container specifications
                </p>
              </div>

              {sendSuccessMsg && (
                <span className="text-xs px-3 py-1 rounded-lg bg-[#10a37f]/15 text-[#0e906f] dark:text-[#34d399] border border-[#10a37f]/30 font-semibold">
                  {sendSuccessMsg}
                </span>
              )}
            </div>

            {/* Sender Profile synced with Mode B Settings */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-[#212121] border border-neutral-200 dark:border-white/10 text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#10a37f]" />
                <span className="text-[11px] text-neutral-500 dark:text-[#9e9e9e]">Sending Export Mail From:</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-neutral-500 dark:text-[#9e9e9e] block mb-1">
                  Target Overseas Buyer
                </label>
                <select
                  value={composerLeadId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setComposerLeadId(id);
                    const found = leads.find(l => l.id === id);
                    if (found) generateExportEmailContent(found, composerTone);
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-xl text-xs text-neutral-900 dark:text-white"
                >
                  {buyerLeads.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.companyName} – {b.country} ({b.contactFullName})
                    </option>
                  ))}
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
                    const found = leads.find(l => l.id === composerLeadId);
                    if (found) generateExportEmailContent(found, tone);
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-xl text-xs text-neutral-900 dark:text-white"
                >
                  <option value="Formal">Formal (Standard International Trade)</option>
                  <option value="Professional">Professional (Consultative)</option>
                  <option value="Concise">Concise (Direct Specifications & CIF)</option>
                  <option value="Friendly">Friendly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-500 dark:text-[#9e9e9e] block mb-1">
                Subject Line
              </label>
              <input
                type="text"
                value={composedSubject}
                onChange={(e) => setComposedSubject(e.target.value)}
                placeholder="Export subject line..."
                className="w-full px-3.5 py-2 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-xl text-xs text-neutral-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-neutral-500 dark:text-[#9e9e9e]">
                  Trade Letter Content
                </label>
                {isDrafting && (
                  <span className="text-[11px] text-[#10a37f] flex items-center gap-1 font-semibold">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    AI drafting trade proposal...
                  </span>
                )}
              </div>
              <textarea
                rows={12}
                value={composedBody}
                onChange={(e) => setComposedBody(e.target.value)}
                placeholder="Export inquiry copy..."
                className="w-full p-3.5 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/10 rounded-xl text-xs text-neutral-900 dark:text-[#ececec] leading-relaxed font-sans focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-neutral-200 dark:border-white/10 flex items-center justify-between flex-wrap gap-2">
              <button
                onClick={() => {
                  const found = leads.find(l => l.id === composerLeadId);
                  if (found) generateExportEmailContent(found, composerTone);
                }}
                className="px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#2f2f2f] hover:bg-neutral-200 dark:hover:bg-[#383838] text-neutral-800 dark:text-[#ececec] text-xs font-semibold flex items-center gap-1.5 border border-neutral-200 dark:border-white/10 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Regenerate Export Pitch</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveCurrentDraft}
                  className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-[#2f2f2f] hover:bg-neutral-200 dark:hover:bg-[#383838] text-neutral-900 dark:text-white text-xs font-semibold border border-neutral-200 dark:border-white/10 transition-colors"
                >
                  Save as Draft
                </button>
                <button
                  onClick={handleSendDirect}
                  className="px-4 py-2 rounded-xl bg-[#10a37f] hover:bg-[#0e906f] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Approve & Send Now</span>
                </button>
              </div>
            </div>
          </div>

          <div className="chatgpt-card p-5 rounded-2xl flex flex-col h-[600px]">
            <div className="pb-3 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Mode B Export Outbox</h3>
                <p className="text-[11px] text-neutral-500 dark:text-[#9e9e9e]">Trade inquiries & approvals</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-[#2f2f2f] text-neutral-700 dark:text-[#ececec] font-semibold border border-neutral-200 dark:border-white/10">
                {exportDrafts.length} Total
              </span>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
              {exportDrafts.map((d) => (
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

              {exportDrafts.length === 0 && (
                <div className="p-8 text-center text-neutral-500 dark:text-[#9e9e9e] text-xs">
                  No export outreach drafts generated yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: EXPORT FOLLOW-UP CADENCE
         ======================================================== */}
      {activeTab === 'followup' && (
        <div className="chatgpt-card p-5 rounded-2xl">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-neutral-200 dark:border-white/10">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <CalendarClock className="w-4 h-4" />
                <span>Mode B Trade Cadence & Sample Follow-ups</span>
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-[#9e9e9e]">
                Track catalog review, sample shipment delivery, and quotation discussions
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

          {clientReplies.filter(r => r.leadMode === 'export_buyers').length > 0 && (
            <div className="pt-4 pb-3 border-b border-neutral-200 dark:border-white/10">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-[#10a37f] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    Inbound Buyer Replies Received ({clientReplies.filter(r => r.leadMode === 'export_buyers').length})
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {clientReplies
                  .filter(r => r.leadMode === 'export_buyers')
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
                      <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-[#2f2f2f] text-neutral-900 dark:text-white border border-neutral-200 dark:border-white/10 text-xs font-semibold">
                        Company: {task.companyName}
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
                    <p className="text-xs text-neutral-500 dark:text-[#9e9e9e]">
                      {task.email} • Due: {task.dueDate}
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
                        setComposedSubject(task.suggestedDraftSubject || 'Following up on our export proposal');
                        setComposedBody(task.suggestedDraftBody || 'Hi, checking in regarding our trade inquiry.');
                        setComposerLeadId(task.leadId);
                        setActiveTab('email');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#0d0d0d] dark:bg-white text-white dark:text-[#212121] text-xs font-semibold flex items-center gap-1.5 hover:opacity-85 transition-opacity"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Open Trade Follow-up</span>
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
                No active export follow-ups currently due.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: EXPORT PRODUCT CATEGORIES, MOQ & CERTIFICATIONS
         ======================================================== */}
      {activeTab === 'products' && (
        <div className="space-y-5">
          <div className="chatgpt-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                Export Product Categories, MOQ & Certifications
              </h2>
              <p className="text-xs text-neutral-500 dark:text-[#9e9e9e] mt-1 max-w-2xl">
                International commodity catalogs with standard container MOQs, port delivery specs, and compliance certifications.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('agent')}
              className="px-4 py-2 rounded-xl bg-[#0d0d0d] dark:bg-white text-white dark:text-[#212121] text-xs font-semibold flex items-center gap-2 hover:opacity-85 transition-opacity shrink-0"
            >
              <Bot className="w-4 h-4" />
              <span>Ask Export AI Agent</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: 'agro',
                title: 'Agro-Commodities & Spices',
                badge: 'High Volume Export',
                moq: '1 x 20ft FCL (15-18 MT)',
                ports: 'Jebel Ali, Rotterdam, London Gateway',
                certs: ['ISO 22000:2018', 'HACCP', 'Halal Certified', 'Spice Board', 'Phytosanitary'],
                items: ['Black Pepper (TGSEB)', 'Green Cardamom (8mm)', 'Turmeric Fingers', 'Dry Ginger', 'Cumin Seeds'],
                prompt: '50 UAE agro spice buyers venum'
              },
              {
                id: 'food',
                title: 'Processed Food & Beverages',
                badge: 'FMCG Wholesale',
                moq: '1 x 20ft FCL or Mixed 40ft HQ',
                ports: 'Jebel Ali, Dammam, Singapore, New York',
                certs: ['US FDA Registered', 'FSSAI Export', 'ISO 22000', 'Halal Certified', 'BRCGS'],
                items: ['Alphonso Mango Pulp', 'Ready-to-Eat Curries', 'Instant Coffee Powder', '1121 Basmati Rice', 'Condiments'],
                prompt: '50 UAE food distributors venum'
              },
              {
                id: 'organic',
                title: 'Organic Foods & Health Products',
                badge: 'Premium Margin',
                moq: '500 kg - 1 x 20ft FCL',
                ports: 'Hamburg, Antwerp, Gothenburg',
                certs: ['EU Organic', 'USDA Organic (NOP)', 'NPOP India', 'Non-GMO', 'Fair Trade'],
                items: ['Organic Moringa Powder', 'Virgin Coconut Oil', 'Chia & Flax Seeds', 'Herbal Teas', 'Organic Turmeric'],
                prompt: '50 Germany organic food buyers venum'
              },
              {
                id: 'textiles',
                title: 'Apparel, Garments & Textiles',
                badge: 'Contract Mfg',
                moq: '1,000 pcs / 1x20ft FCL',
                ports: 'Southampton, Le Havre, Savannah, Dubai',
                certs: ['OEKO-TEX 100', 'GOTS Organic', 'Sedex SMETA', 'WRAP Certified'],
                items: ['Combed Cotton T-Shirts', 'Hotel Bath Towels', '400TC Bed Linen', 'Hospital Scrubs', 'Workwear'],
                prompt: '50 UK garment importers venum'
              },
              {
                id: 'engineering',
                title: 'Engineering & Auto Components',
                badge: 'Industrial B2B',
                moq: '2 - 5 Metric Tons',
                ports: 'Hamburg, Chicago, Melbourne, Jebel Ali',
                certs: ['ISO 9001:2015', 'IATF 16949', 'CE Marking', 'RoHS', 'MTC 3.1'],
                items: ['Precision CNC Parts', 'Iron Castings', 'Brass Fittings', 'Centrifugal Pumps', 'Industrial Fasteners'],
                prompt: '50 USA auto component buyers venum'
              },
              {
                id: 'ceramics',
                title: 'Ceramics, Tiles & Sanitaryware',
                badge: 'Infrastructure Export',
                moq: '1 x 20ft FCL (1,200 sq.m)',
                ports: 'Jeddah, Dammam, Shuwaikh, Sohar',
                certs: ['SASO Saber (Saudi)', 'CE Certified', 'ISO 13006', 'Soncap'],
                items: ['Vitrified Tiles (600x1200)', 'Porcelain Pavers', 'Wall Tiles', 'Sanitaryware', 'Vitrified Slabs'],
                prompt: '50 Saudi Arabia ceramic tile buyers venum'
              }
            ].map(cat => (
              <div key={cat.id} className="chatgpt-card p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10a37f]/15 text-[#0e906f] dark:text-[#34d399] font-semibold">
                      {cat.badge}
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-[#8e8e8e]">MOQ: {cat.moq}</span>
                  </div>

                  <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">{cat.title}</h3>

                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-500 dark:text-[#8e8e8e] block uppercase tracking-wider font-semibold">
                        Key Products:
                      </span>
                      <ul className="mt-1 space-y-0.5 text-neutral-700 dark:text-[#d4d4d4] text-[11px]">
                        {cat.items.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10a37f] shrink-0" />
                            <span className="truncate">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-neutral-200 dark:border-white/10">
                      <span className="text-[10px] text-neutral-500 dark:text-[#8e8e8e] block uppercase tracking-wider font-semibold">
                        Certifications:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cat.certs.map((c, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-[#212121] text-neutral-700 dark:text-[#d4d4d4] border border-neutral-200 dark:border-white/10"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-white/10 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-neutral-500 dark:text-[#8e8e8e] truncate">
                    Port: {cat.ports.split(',')[0]}
                  </span>
                  <button
                    onClick={() => {
                      setProductCategory(cat.title);
                      setActiveTab('agent');
                      handleSendChatMessage(cat.prompt);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#0d0d0d] dark:bg-white text-white dark:text-[#212121] text-xs font-semibold flex items-center gap-1 hover:opacity-85 transition-opacity shrink-0"
                  >
                    <span>Source Buyers</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 6: EXPORT SETTINGS & SENDER PROFILE
         ======================================================== */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <SettingsPage mode="mode_b" />
        </div>
      )}
    </div>
  );
};
