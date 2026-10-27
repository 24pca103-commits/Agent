import React, { useState } from 'react';
import {
  Globe2,
  Package,
  Search,
  CheckCircle2,
  Ship,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Bot,
  Send,
  CalendarClock,
  Clock,
  AlertCircle,
  RefreshCw,
  FileText,
  BadgeCheck,
  Building2,
  ArrowRight,
  Filter,
  Mail,
  Printer,
  Download,
  Table as TableIcon,
  LayoutGrid,
  ChevronLeft,
  User,
  Copy,
  Check,
  Settings as SettingsIcon
} from 'lucide-react';
import { Lead, EmailDraft, EmailTone, FollowUpTask, ClientReply } from '../types';
import { TARGET_COUNTRIES, DATAGALACTIC_COMPANY } from '../data/catalog';
import { StatusBadge } from '../components/Badge';
import { exportLeadsToPdf, openPrintPdfView, downloadLeadsPdfDirectly } from '../utils/exportPdf';
import { SettingsPage } from './SettingsPage';

interface ExportBuyerLeadsProps {
  initialTab?: 'agent' | 'leads' | 'email' | 'followup' | 'products' | 'settings';
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
    type: 'source_buyer' | 'draft_pitch' | 'download_pdf';
    buyerCategory?: string;
    targetCountry?: string;
    leadCount?: number;
  };
}

export const ExportBuyerLeads: React.FC<ExportBuyerLeadsProps> = ({
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
  // Mode B Active Tab
  const [activeTab, setActiveTab] = useState<'agent' | 'leads' | 'email' | 'followup' | 'products' | 'settings'>(initialTab);
  const [downloadedFileNotice, setDownloadedFileNotice] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Filter only export_buyers leads
  const buyerLeads = leads.filter(l => l.leadMode === 'export_buyers');
  const exportDrafts = drafts.filter(d => {
    const parentLead = leads.find(l => l.id === d.leadId);
    return d.leadMode === 'export_buyers' || (parentLead && parentLead.leadMode === 'export_buyers');
  });

  // Export Sourcing Form State
  const [productCategory, setProductCategory] = useState('Agro-Commodities & Spices');
  const [productDescription, setProductDescription] = useState('Premium export-quality whole black pepper, cardamom, and organic spices.');
  const [originCountry, setOriginCountry] = useState('India');
  const [targetCountry, setTargetCountry] = useState('United Arab Emirates (UAE)');
  const [buyerType, setBuyerType] = useState<'importer' | 'distributor' | 'wholesaler' | 'retailer'>('distributor');
  const [minOrderQty, setMinOrderQty] = useState('1 x 20ft Full Container Load (FCL)');
  const [certifications, setCertifications] = useState('ISO 22000, HACCP, Halal Certified');
  const [sourcingLimit, setSourcingLimit] = useState<number>(100);
  const [isSearching, setIsSearching] = useState(false);
  const [sourcingSuccess, setSourcingSuccess] = useState<string | null>(null);

  // View & Pagination States
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // AI Agent Chat State
  const [chatInput, setChatInput] = useState<string>('');
  const [chatSelectedCountry, setChatSelectedCountry] = useState<string>('United Arab Emirates (UAE)');
  const [countrySelectError, setCountrySelectError] = useState<boolean>(false);
  const [agentSourcedResults, setAgentSourcedResults] = useState<Lead[]>([]);
  const [agentTableSearch, setAgentTableSearch] = useState<string>('');
  const [agentTablePageSize, setAgentTablePageSize] = useState<number>(25);
  const [agentTablePage, setAgentTablePage] = useState<number>(1);
  const [agentTableViewMode, setAgentTableViewMode] = useState<'table' | 'grid'>('table');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-exp-1',
      sender: 'agent',
      text: `Welcome to Mode B: International Export Buyer Hub! I am your AI Global Trade & Sourcing Consultant.\n\n⚠️ **Please select a Target Country next to the Send button** before sending your buyer search prompt (e.g. "100 UAE buyer venum").\nOnce selected, all 100 verified buyer details will be displayed live below with 1-click executive PDF export!`,
      timestamp: 'Just now'
    }
  ]);
  const [isAgentThinking, setIsAgentThinking] = useState(false);

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
  const paginatedLeads = pageSize === 0 
    ? buyerLeads 
    : buyerLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Live Agent Sourced Results (Mode B)
  const currentLiveBuyers = agentSourcedResults.length > 0 ? agentSourcedResults : buyerLeads;
  const filteredLiveBuyers = currentLiveBuyers.filter(lead => {
    if (!agentTableSearch.trim()) return true;
    const q = agentTableSearch.toLowerCase();
    return (lead.companyName && lead.companyName.toLowerCase().includes(q)) ||
      (lead.contactFullName && lead.contactFullName.toLowerCase().includes(q)) ||
      (lead.businessEmail && lead.businessEmail.toLowerCase().includes(q)) ||
      (lead.country && lead.country.toLowerCase().includes(q)) ||
      (lead.regionCity && lead.regionCity.toLowerCase().includes(q)) ||
      (lead.buyerType && lead.buyerType.toLowerCase().includes(q)) ||
      (lead.targetProductCategory && lead.targetProductCategory.toLowerCase().includes(q));
  });

  const effectiveBuyerPageSize = agentTablePageSize === 0 ? (filteredLiveBuyers.length || 1) : agentTablePageSize;
  const totalBuyerPages = Math.ceil(filteredLiveBuyers.length / effectiveBuyerPageSize) || 1;
  const paginatedLiveBuyers = agentTablePageSize === 0
    ? filteredLiveBuyers
    : filteredLiveBuyers.slice((agentTablePage - 1) * agentTablePageSize, agentTablePage * agentTablePageSize);

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
    link.setAttribute('download', `export_buyers_${(chatSelectedCountry || targetCountry || 'all').toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Sourcing Search with 100 limit support
  const handleSourcingSearch = async (overrideCount?: number) => {
    const targetCount = overrideCount || sourcingLimit || 100;
    const countryToUse = chatSelectedCountry || targetCountry || 'United Arab Emirates (UAE)';
    setIsSearching(true);
    setSourcingSuccess(null);

    try {
      const response = await fetch('/api/leads/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: {
            requestedCount: targetCount,
            leadMode: 'export_buyers',
            country: countryToUse,
            industry: 'Export & Import Trade',
            targetProductCategory: productCategory
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

        // Save into live results state
        setAgentSourcedResults(data.leads);
        setAgentTablePage(1);

        setSourcingSuccess(`Successfully sourced ${data.leads.length} verified overseas buyers in ${countryToUse}!`);
        
        const agentMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'agent',
          text: `🎉 Sourced **${data.leads.length} verified international buyers** in **${countryToUse}** matching your export parameters!\n\n• **Count:** ${data.leads.length} Verified Buyers\n• **Country:** ${countryToUse}\n• **Product Category:** ${productCategory}\n• **Container MOQs:** 1x20ft / 2x40ft FCL\n\nAll ${data.leads.length} buyers are listed directly below in the live table. You can inspect all contact info or download the complete executive PDF dossier below.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedAction: {
            type: 'download_pdf',
            leadCount: data.leads.length
          }
        };

        setChatMessages(prev => [...prev, agentMsg]);
        return data.leads;
      }
    } catch (err) {
      console.error('Error sourcing export buyers:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Agent Chat Handler
  const handleSendChatMessage = async (textToSend?: string) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    const lower = query.toLowerCase();

    // Check if query is asking about overseas buyer replies
    const isReplyQuery = lower.includes('reply') ||
      lower.includes('replied') ||
      lower.includes('response') ||
      lower.includes('inbound') ||
      lower.includes('vanthucha') ||
      lower.includes('vandhucha');

    // Enforce country selection before allowing prompt to send (except for general reply inquiries)
    if (!chatSelectedCountry && !isReplyQuery) {
      setCountrySelectError(true);
      return;
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

    // Handle Overseas Buyer Replies Query
    if (isReplyQuery) {
      setIsAgentThinking(true);
      setTimeout(() => {
        const modeBReplies = clientReplies.filter(r => r.leadMode === 'export_buyers');
        let replyText = '';
        if (modeBReplies.length > 0) {
          replyText = `📬 **Yes! All overseas buyer replies are captured directly inside the Agent and the system.**\n\nWe have **${modeBReplies.length} active trade buyer replies** for Mode B Export Buyers:\n\n` +
            modeBReplies.map((r, idx) => 
              `**${idx + 1}. ${r.leadName}** — *${r.companyName}* (${r.replyDate})\n` +
              `• **Subject:** ${r.replySubject}\n` +
              `• **Buyer Message:** "${r.replySnippet}"\n` +
              `• **Sentiment:** [${r.sentiment}] • **Status:** [${r.status}]`
            ).join('\n\n') +
            `\n\n✨ **Where you can view and manage overseas buyer replies:**\n` +
            `1. **Here in Mode B AI Agent:** Reported live whenever you ask ("Overseas buyer replies status").\n` +
            `2. **Dashboard > Inbound Communications Tracker:** Full buyer response cards with 1-click status updates.\n` +
            `3. **Step 4: Trade Follow-ups:** Unreplied buyers automatically trigger Day 3 and Day 7 trade follow-ups.`;
        } else {
          replyText = `📬 **No new overseas buyer replies received yet for Mode B.**\n\nWhen foreign importers reply to your export catalog & proposals:\n1. Their reply arrives directly inside this Agent.\n2. It appears on the Dashboard Inbound Tracker.\n3. If they don't reply in 3 days, Step 4 (Trade Follow-ups) automatically schedules follow-up messages!`;
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

    // Check if user requested 100 buyers or searching
    let requestedCount = 100;
    const matchCount = query.match(/\b(\d+)\b/);
    if (matchCount && parseInt(matchCount[1]) > 0) {
      requestedCount = Math.min(100, parseInt(matchCount[1]));
    }

    if (lower.includes('100') || lower.includes('buyer') || lower.includes('importer') || lower.includes('search') || lower.includes('source') || lower.includes('find') || lower.includes('venum') || lower.includes('kudu')) {
      await handleSourcingSearch(requestedCount);
      return;
    }

    setIsAgentThinking(true);

    setTimeout(() => {
      let replyText = '';
      let action: ChatMessage['suggestedAction'];
      const lower = query.toLowerCase();

      if (lower.includes('uae') || lower.includes('dubai') || lower.includes('halal')) {
        replyText = `For the UAE & GCC markets (like Dubai / Jebel Ali Port delivery):\n\n• **Mandatory Certifications:** Halal Certification by an ESMA-recognized body, HACCP, and ISO 22000.\n• **Trade Terms:** Most Gulf wholesalers & distributors require CIF Jebel Ali terms with 30% advance, balance against Bill of Lading (B/L) copy.\n• **Key Sourcing Hubs:** Dubai Central Fruit & Vegetable Market (Al Aweer), Dubai Investment Park cold stores.\n\nWould you like me to run an AI sourcing scan for UAE distributors?`;
      } else if (lower.includes('sweden') || lower.includes('europe') || lower.includes('eu')) {
        replyText = `For European Union & Nordic buyers (like Biofood-Biolivs in Sweden):\n\n• **Mandatory Compliance:** EU Organic Certification (for bio items), EC Regulation 852/2004 hygiene, Maximum Residue Limit (MRL) lab test compliance.\n• **Preferred Logistics:** Container delivery to Gothenburg or Stockholm Port.\n• **High-Demand Products:** Organic whole spices, cold-pressed oils, and non-GMO grains.`;
      } else if (lower.includes('moq') || lower.includes('container') || lower.includes('fcl')) {
        replyText = `Standard International Trade MOQ benchmarks:\n\n• **Spices & High-Value Agro:** 1 x 20ft Full Container Load (approx. 14-16 Metric Tons).\n• **Grains & Bulk Commodities:** 1 x 40ft FCL or 25-50 MT breakbulk.\n• **Samples:** Usually 250g - 500g courier packs sent via DHL/FedEx with Certificate of Analysis (COA).`;
      } else {
        replyText = `In Mode B, I specialize in finding verified overseas importers, distributors, and wholesalers for physical product exports.\n\nYou can specify your Product Category, Target Country, and required Certifications (Halal, ISO, FDA) in the Sourcing Form, and I will source direct procurement decision-makers for you.`;
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
    }, 800);
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
      const subject = tone === 'Concise'
        ? `Direct Export Supply: Container-load ${targetBuyer.targetProductCategory || 'Agro-Commodities'} for ${targetBuyer.companyName}`
        : `Export Trade Inquiry: Certified ${targetBuyer.targetProductCategory || 'Commodity Products'} for ${targetBuyer.companyName} (${targetBuyer.country})`;

      let greeting = `Dear Mr./Ms. ${targetBuyer.contactLastName || targetBuyer.contactFirstName},`;
      if (tone === 'Friendly') greeting = `Hi ${targetBuyer.contactFirstName},`;

      const certText = targetBuyer.productCertifications && targetBuyer.productCertifications.length > 0
        ? `We maintain certified compliance with ${targetBuyer.productCertifications.join(', ')}.`
        : `We maintain certified compliance with ISO 22000, HACCP, and international export safety standards.`;

      const body = `${greeting}

I hope this message finds you well at ${targetBuyer.companyName}.

We are direct international suppliers specializing in export-grade ${targetBuyer.targetProductCategory || 'food and agro commodities'}. We noticed ${targetBuyer.companyName}'s prominent position as a trusted ${targetBuyer.buyerType || 'importer & distributor'} across ${targetBuyer.country}.

${certText} We have immediate container allocations available for ${targetBuyer.regionCity || targetBuyer.country} port delivery, supported by full third-party laboratory inspection reports and Phytosanitary certificates.

We would be pleased to forward our 2026 Export Product Catalog along with current CIF port price schedules. Furthermore, we are happy to dispatch complimentary courier sample packets to your procurement office for quality appraisal.

Could you let us know if your procurement committee is currently accepting supplier quotations for upcoming container shipments?

Respectfully yours,

${DATAGALACTIC_COMPANY.founder}
Global Trade Operations
${DATAGALACTIC_COMPANY.website}
Email: ${DATAGALACTIC_COMPANY.email}`;

      setComposedSubject(subject);
      setComposedBody(body);
      setIsDrafting(false);
    }, 600);
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
      recommendedService: 'Export Sourcing',
      leadMode: 'export_buyers',
      status: 'Awaiting Approval',
      createdAt: new Date().toISOString()
    };

    onSaveDraftForApproval(newDraft);
    setSendSuccessMsg('Export inquiry draft saved and queued for Approval Gate inspection.');
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
      recommendedService: 'Export Sourcing',
      leadMode: 'export_buyers',
      status: 'Awaiting Approval',
      createdAt: new Date().toISOString()
    };

    onSaveDraftForApproval(newDraft);
    const sent = await onApproveAndSend(tempDraftId);
    if (sent) {
      setSendSuccessMsg(`Export inquiry successfully dispatched to ${targetLead.businessEmail}!`);
    } else {
      setSendSuccessMsg(`Export inquiry approved and dispatched in Demo Mode simulation.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Download Notification Banner */}
      {downloadedFileNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadedFileNotice}</span>
          </div>
          <button
            onClick={() => setDownloadedFileNotice(null)}
            className="text-emerald-400 hover:text-white text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Workspace Header */}
      <div className="galaxy-card p-6 rounded-2xl border border-sky-500/30 bg-gradient-to-r from-galaxy-900 via-sky-950/40 to-galaxy-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 text-xs font-bold mb-2">
            <Globe2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Agent: Mode B Dedicated Workspace</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>International Export Sourcing Agent Hub</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Source overseas importers, distributors, and wholesalers for international physical product exports. Filter by container MOQ, certifications (FDA, ISO, Halal), and trade category.
          </p>
        </div>

        {/* Quick KPI Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Overseas Buyers</span>
            <span className="text-lg font-bold text-white">{buyerLeads.length}</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="text-[10px] uppercase tracking-wider text-amber-400 block font-semibold">Approvals</span>
            <span className="text-lg font-bold text-amber-400">{awaitingApprovalCount}</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="text-[10px] uppercase tracking-wider text-cyan-400 block font-semibold">Inquiries Sent</span>
            <span className="text-lg font-bold text-cyan-400">{sentCount}</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 block font-semibold">Follow-ups</span>
            <span className="text-lg font-bold text-emerald-400">{followUpsDueCount}</span>
          </div>
        </div>
      </div>

      {/* Mode B Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 flex-wrap">
        <button
          onClick={() => setActiveTab('agent')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'agent'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Bot className="w-4 h-4 text-sky-300" />
          <span>1. Find Buyers & PDF</span>
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'leads'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4 text-sky-300" />
          <span>2. Saved Buyers List ({buyerLeads.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'email'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Mail className="w-4 h-4 text-sky-300" />
          <span>3. Send Export Proposals ({exportDrafts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('followup')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'followup'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <CalendarClock className="w-4 h-4 text-sky-300" />
          <span>4. Trade Follow-ups ({followUpTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Package className="w-4 h-4 text-sky-300" />
          <span>5. Products, MOQ & Certs</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <SettingsIcon className="w-4 h-4 text-sky-300" />
          <span>6. Export Company Profile</span>
        </button>
      </div>

            {/* TAB 1: EXPORT AI AGENT & SOURCING ENGINE (SIDE-BY-SIDE SPLIT VIEW) */}
      {activeTab === 'agent' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start min-w-0 max-w-full">
          {/* Left Column: AI Export Agent Assistant & Quick Parameters (xl:col-span-5) */}
          <div className="xl:col-span-5 space-y-4 min-w-0 max-w-full overflow-hidden">
            {/* Quick Sourcing Parameters Bar (Compact) */}
            <div className="galaxy-card p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Ship className="w-3.5 h-3.5 text-sky-400" />
                  <span>Export Sourcing Config</span>
                </span>
                <span className="text-[10px] text-sky-300 font-semibold px-2 py-0.5 rounded bg-sky-500/20 border border-sky-500/30">
                  {buyerType.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Product Category:</span>
                  <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-950 border border-slate-700/80 rounded-lg text-white text-xs truncate"
                  >
                    <option value="Agro-Commodities & Spices">Agro-Commodities & Spices</option>
                    <option value="Processed Food & Beverages">Processed Food & Beverages</option>
                    <option value="Organic Foods & Health Products">Organic Foods & Health Products</option>
                    <option value="Apparel, Garments & Textiles">Apparel, Garments & Textiles</option>
                    <option value="Industrial Chemicals & Minerals">Industrial Chemicals & Minerals</option>
                    <option value="Engineering & Auto Components">Engineering & Auto Components</option>
                    <option value="Ceramics, Tiles & Sanitaryware">Ceramics, Tiles & Sanitaryware</option>
                  </select>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Container MOQ:</span>
                  <select
                    value={minOrderQty}
                    onChange={(e) => setMinOrderQty(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-950 border border-slate-700/80 rounded-lg text-white text-xs truncate"
                  >
                    <option value="1 x 20ft Full Container Load (FCL)">1 x 20ft FCL (15-18 MT)</option>
                    <option value="1 x 40ft High Cube FCL">1 x 40ft HQ FCL (26 MT)</option>
                    <option value="LCL / Air Cargo Pallet">LCL / Air Pallet (500kg)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI Global Trade Consultant Chat Stream */}
            <div className="galaxy-card p-4 rounded-2xl border border-slate-800 flex flex-col h-[650px]">
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                      <span>Export AI Consultant</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    </h3>
                    <p className="text-[10px] text-slate-400 truncate">Trade Intelligence & Buyer Sourcing</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold">
                    Mode B
                  </span>
                  <button
                    onClick={() => setActiveTab('products')}
                    title="Open Export Categories"
                    className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Categories
                  </button>
                </div>
              </div>

              {/* Quick Prompts */}
              <div className="py-2 flex items-center gap-1.5 flex-wrap border-b border-slate-800/60">
                {[
                  'Buyer replies status venum',
                  '50 UAE buyers venum',
                  '100 UAE buyers venum',
                  '50 Saudi buyers venum',
                  '50 UK export buyers venum',
                  'Agro-Commodities MOQ'
                ].map((pill, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (!chatSelectedCountry) {
                        if (pill.toLowerCase().includes('uae')) setChatSelectedCountry('United Arab Emirates (UAE)');
                        else if (pill.toLowerCase().includes('saudi')) setChatSelectedCountry('Saudi Arabia');
                        else if (pill.toLowerCase().includes('uk')) setChatSelectedCountry('United Kingdom');
                        else if (pill.toLowerCase().includes('reply')) setChatSelectedCountry('United Arab Emirates (UAE)');
                        else {
                          setCountrySelectError(true);
                          return;
                        }
                      }
                      handleSendChatMessage(pill);
                    }}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors ${
                      pill.toLowerCase().includes('reply')
                        ? 'bg-sky-900/40 hover:bg-sky-900/70 text-sky-200 border-sky-500/40 font-semibold'
                        : 'bg-slate-900 hover:bg-sky-950/60 text-slate-300 hover:text-sky-200 border-slate-800 hover:border-sky-500/40'
                    }`}
                  >
                    {pill}
                  </button>
                ))}
              </div>

              {/* Messages Stream */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'agent' && (
                      <div className="w-6 h-6 rounded bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-300 shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-sky-600 text-white rounded-br-none'
                        : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none'
                    }`}>
                      <p>{msg.text}</p>

                      {/* Download PDF to PC Action inside Chat */}
                      {msg.suggestedAction && msg.suggestedAction.type === 'download_pdf' && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => {
                              const listToExport = agentSourcedResults.length > 0 ? agentSourcedResults : buyerLeads;
                              const savedName = exportLeadsToPdf(listToExport, {
                                title: `Mode B International Export Buyer Intelligence Dossier (${chatSelectedCountry || targetCountry})`,
                                leadMode: 'export_buyers'
                              });
                              setDownloadedFileNotice(`✓ Downloaded ${listToExport.length} overseas buyers to This PC > Downloads (${savedName})`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02]"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Save {msg.suggestedAction.leadCount || agentSourcedResults.length || 50} Buyers PDF to PC</span>
                          </button>

                          <button
                            onClick={() => {
                              const listToExport = agentSourcedResults.length > 0 ? agentSourcedResults : buyerLeads;
                              openPrintPdfView(listToExport, {
                                title: `Mode B International Export Buyer Intelligence Dossier (${chatSelectedCountry || targetCountry})`,
                                leadMode: 'export_buyers'
                              });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-all"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Print View</span>
                          </button>
                        </div>
                      )}

                      <div className={`text-[9px] mt-1 text-right ${msg.sender === 'user' ? 'text-sky-200' : 'text-slate-400'}`}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))}

                {isAgentThinking && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
                    <span>Agent is sourcing verified buyers in {chatSelectedCountry || 'selected market'}...</span>
                  </div>
                )}
              </div>

              {/* Chat Input with Country Selector next to Send button */}
              <div className="pt-2.5 border-t border-slate-800 space-y-2">
                {countrySelectError && !chatSelectedCountry && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-300 bg-rose-500/15 border border-rose-500/40 px-3 py-1.5 rounded-xl animate-bounce">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Please select target country next to Send button first!</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (!chatSelectedCountry) {
                          setCountrySelectError(true);
                        } else {
                          handleSendChatMessage();
                        }
                      }
                    }}
                    placeholder={
                      chatSelectedCountry
                        ? `Ask for ${chatSelectedCountry} buyers (e.g. "50 ${chatSelectedCountry} buyers venum")...`
                        : "⚠️ Select target country on right before sending prompt..."
                    }
                    className={`flex-1 px-3 py-2 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none transition-all ${
                      countrySelectError && !chatSelectedCountry
                        ? 'border-rose-500 focus:border-rose-500 ring-2 ring-rose-500/30'
                        : 'border-slate-700/80 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                    }`}
                  />

                  {/* Country Selector next to Send button */}
                  <div className="relative shrink-0">
                    <select
                      value={chatSelectedCountry}
                      onChange={(e) => {
                        setChatSelectedCountry(e.target.value);
                        setTargetCountry(e.target.value);
                        if (e.target.value) setCountrySelectError(false);
                      }}
                      className={`px-2.5 py-2 bg-slate-950 border rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        countrySelectError && !chatSelectedCountry
                          ? 'border-rose-500 text-rose-300 ring-2 ring-rose-500/40 bg-rose-950/30'
                          : chatSelectedCountry
                          ? 'border-sky-500 text-sky-200 bg-sky-950/50'
                          : 'border-amber-500/80 text-amber-300 bg-amber-950/20'
                      } focus:outline-none focus:border-sky-500`}
                    >
                      <option value="">🌍 Country *</option>
                      <option value="United Arab Emirates (UAE)">🇦🇪 UAE (Dubai)</option>
                      <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
                      <option value="Germany">🇩🇪 Germany</option>
                      <option value="United Kingdom">🇬🇧 UK</option>
                      <option value="United States">🇺🇸 USA</option>
                      <option value="Canada">🇨🇦 Canada</option>
                      <option value="Singapore">🇸🇬 Singapore</option>
                      <option value="Australia">🇦🇺 Australia</option>
                    </select>
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={() => {
                      if (!chatSelectedCountry) {
                        setCountrySelectError(true);
                      } else {
                        handleSendChatMessage();
                      }
                    }}
                    disabled={!chatSelectedCountry || isAgentThinking}
                    title={!chatSelectedCountry ? "Please select a target country next to this button first" : "Send prompt"}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all shrink-0 ${
                      chatSelectedCountry && !isAgentThinking
                        ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/30 cursor-pointer hover:scale-[1.02]'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/60 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: LIVE SOURCED OVERSEAS BUYERS LEAD DETAILS (SIDE VIEW!) (xl:col-span-7) */}
          <div className="xl:col-span-7 galaxy-card p-4 sm:p-5 rounded-2xl border border-sky-500/30 flex flex-col h-[740px] shadow-2xl min-w-0 max-w-full overflow-hidden">
            {/* Header with Title, Stats & PDF Export Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-300 shrink-0">
                  <Ship className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                    <span className="truncate">Live Sourced Overseas Buyer Details</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold shrink-0">
                      {filteredLiveBuyers.length} Buyers
                    </span>
                    {chatSelectedCountry && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold shrink-0">
                        📍 {chatSelectedCountry}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    Side View: Verified overseas importers & wholesale distributors
                  </p>
                </div>
              </div>

              {/* Action Buttons: Save PDF to PC, CSV, Print */}
              <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                <button
                  onClick={() => {
                    const exportList = filteredLiveBuyers.length > 0 ? filteredLiveBuyers : buyerLeads;
                    const savedName = exportLeadsToPdf(exportList, {
                      title: `International Export Buyer Intelligence Dossier (${chatSelectedCountry || targetCountry})`,
                      leadMode: 'export_buyers'
                    });
                    setDownloadedFileNotice(`✓ Downloaded ${exportList.length} overseas buyers to This PC > Downloads (${savedName})`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save PDF to PC</span>
                </button>

                <button
                  onClick={() => {
                    const exportList = filteredLiveBuyers.length > 0 ? filteredLiveBuyers : buyerLeads;
                    openPrintPdfView(exportList, {
                      title: `International Export Buyer Intelligence Dossier (${chatSelectedCountry || targetCountry})`,
                      leadMode: 'export_buyers'
                    });
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-all"
                  title="Open Print Dialog"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                <button
                  onClick={() => handleExportCsv(filteredLiveBuyers.length > 0 ? filteredLiveBuyers : buyerLeads)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-all"
                  title="Export CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Filter and View Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-2.5 border-b border-slate-800/80 min-w-0">
              <div className="relative flex-1 min-w-0">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={agentTableSearch}
                  onChange={(e) => {
                    setAgentTableSearch(e.target.value);
                    setAgentTablePage(1);
                  }}
                  placeholder="Filter company, contact, email, city..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 truncate"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span>Show:</span>
                  <select
                    value={agentTablePageSize}
                    onChange={(e) => {
                      setAgentTablePageSize(Number(e.target.value));
                      setAgentTablePage(1);
                    }}
                    className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100 (All)</option>
                    <option value={0}>All Records</option>
                  </select>
                </div>

                <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setAgentTableViewMode('table')}
                    className={`p-1 rounded text-xs transition-colors ${
                      agentTableViewMode === 'table' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Table View"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setAgentTableViewMode('grid')}
                    className={`p-1 rounded text-xs transition-colors ${
                      agentTableViewMode === 'grid' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Card View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* LIVE TABLE VIEW (SCROLLABLE) */}
            <div className="flex-1 overflow-y-auto overflow-x-auto min-w-0 max-w-full mt-2 rounded-xl border border-slate-800/80">
              {agentTableViewMode === 'table' ? (
                <table className="w-full text-left text-xs min-w-[600px]">
                  <thead className="sticky top-0 bg-slate-950 z-10 border-b border-slate-800">
                    <tr className="text-slate-400 text-[10px] uppercase tracking-wider">
                      <th className="py-2 px-2 text-center w-8">#</th>
                      <th className="py-2 px-3 font-semibold min-w-[130px]">Buyer Company</th>
                      <th className="py-2 px-3 font-semibold min-w-[110px]">Procurement Lead</th>
                      <th className="py-2 px-3 font-semibold min-w-[140px]">Email</th>
                      <th className="py-2 px-2 font-semibold min-w-[80px]">Port / City</th>
                      <th className="py-2 px-2 font-semibold min-w-[70px]">Country</th>
                      <th className="py-2 px-2 font-semibold min-w-[110px]">Product / MOQ</th>
                      <th className="py-2 px-2 font-semibold text-center w-14">Score</th>
                      <th className="py-2 px-2 font-semibold text-center w-16">Status</th>
                      <th className="py-2 px-2 font-semibold text-right w-14">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {paginatedLiveBuyers.length > 0 ? (
                      paginatedLiveBuyers.map((lead, idx) => (
                        <tr key={lead.id} className="hover:bg-slate-850/60 transition-colors">
                          <td className="py-2 px-2 text-center text-slate-400 text-[10px]">
                            {(agentTablePage - 1) * (agentTablePageSize || 1) + idx + 1}
                          </td>
                          <td className="py-2 px-3">
                            <div className="font-semibold text-white truncate max-w-[170px]" title={lead.companyName}>
                              {lead.companyName}
                            </div>
                            <div className="text-[10px] text-sky-400 truncate max-w-[170px]">
                              {lead.companyDomain || 'trade-portal.com'}
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="font-medium text-slate-200 truncate max-w-[150px]">
                              {lead.contactFullName}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                              {lead.jobTitle}
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1 max-w-[190px]">
                              <span className="font-mono text-[11px] text-slate-300 truncate" title={lead.businessEmail}>
                                {lead.businessEmail}
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(lead.businessEmail);
                                  setCopiedEmail(lead.businessEmail);
                                  setTimeout(() => setCopiedEmail(null), 2000);
                                }}
                                className="text-slate-400 hover:text-white shrink-0"
                                title="Copy email"
                              >
                                {copiedEmail === lead.businessEmail ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-slate-300">
                            {lead.regionCity || 'Jebel Ali / Dubai'}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 text-sky-300 border border-slate-700 whitespace-nowrap">
                              {lead.country}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="text-slate-200 text-[11px] truncate max-w-[140px]" title={lead.targetProductCategory || productCategory}>
                              {lead.targetProductCategory || productCategory}
                            </div>
                            <div className="text-[10px] text-sky-400">
                              MOQ: {lead.minOrderQuantity || '1 FCL'}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="font-bold text-emerald-400 text-xs">
                              {lead.leadScore}/100
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <StatusBadge status={lead.leadStatus} />
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => handleGeneratePitchForBuyer(lead)}
                              className="px-2 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-semibold transition-colors whitespace-nowrap"
                            >
                              Write Email
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-slate-400">
                          No overseas buyers match your filter criteria. Ask the agent on the left or select a country to source buyers!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
                  {paginatedLiveBuyers.map((lead) => (
                    <div key={lead.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-white text-xs">{lead.companyName}</h4>
                            <span className="text-[10px] text-sky-300 capitalize">{lead.buyerType || 'Importer'} • {lead.country}</span>
                          </div>
                          <span className="font-bold text-emerald-400 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                            {lead.leadScore}/100
                          </span>
                        </div>

                        <div className="mt-2 space-y-1 text-[11px] text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3 text-slate-400" />
                            <span><strong>{lead.contactFullName}</strong> ({lead.jobTitle})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-sky-400" />
                            <span className="font-mono text-[10px] text-slate-200 truncate">{lead.businessEmail}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Package className="w-3 h-3 text-sky-400" />
                            <span className="truncate">Category: <strong>{lead.targetProductCategory || productCategory}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <StatusBadge status={lead.leadStatus} />
                        <button
                          onClick={() => handleGeneratePitchForBuyer(lead)}
                          className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-semibold"
                        >
                          Write Pitch
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {filteredLiveBuyers.length > 0 && agentTablePageSize !== 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400">
                <div>
                  Showing{' '}
                  <span className="font-semibold text-white">
                    {(agentTablePage - 1) * agentTablePageSize + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-white">
                    {Math.min(agentTablePage * agentTablePageSize, filteredLiveBuyers.length)}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-white">{filteredLiveBuyers.length}</span> buyers
                </div>

                <div className="flex items-center gap-1">
                  <button
                    disabled={agentTablePage <= 1}
                    onClick={() => setAgentTablePage(prev => Math.max(1, prev - 1))}
                    className="p-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: Math.min(5, totalBuyerPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalBuyerPages > 5 && agentTablePage > 3) {
                        pageNum = agentTablePage - 3 + i;
                        if (pageNum > totalBuyerPages) pageNum = totalBuyerPages - (4 - i);
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setAgentTablePage(pageNum)}
                          className={`w-6 h-6 rounded-lg text-[10px] font-semibold transition-colors ${
                            agentTablePage === pageNum
                              ? 'bg-sky-600 text-white'
                              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    disabled={agentTablePage >= totalBuyerPages}
                    onClick={() => setAgentTablePage(prev => Math.min(totalBuyerPages, prev + 1))}
                    className="p-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: OVERSEAS BUYER LEADS */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          {/* Action Toolbar: Sourcing, 100-limit, and PDF Download */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                Overseas Buyer Directory ({buyerLeads.length})
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-medium">
                Verified Importers
              </span>
              {sourcingSuccess && (
                <span className="text-[11px] text-emerald-400 font-semibold animate-pulse">
                  ✓ {sourcingSuccess}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Source 100 Buyers Button */}
              <button
                onClick={() => handleSourcingSearch(100)}
                disabled={isSearching}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-sky-600/30 transition-all"
              >
                {isSearching ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Source 100 Buyers</span>
              </button>

              {/* Download PDF Button */}
              <button
                onClick={() => exportLeadsToPdf(buyerLeads, { title: 'International Export Buyer Intelligence Dossier', leadMode: 'export_buyers' })}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Download PDF ({buyerLeads.length})</span>
              </button>

              {/* View Mode Switcher */}
              <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setViewMode('table')}
                  title="Table View"
                  className={`p-1.5 rounded-md text-xs transition-colors ${
                    viewMode === 'table' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  title="Cards View"
                  className={`p-1.5 rounded-md text-xs transition-colors ${
                    viewMode === 'grid' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
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
                <option value={0}>Show All ({buyerLeads.length})</option>
              </select>
            </div>
          </div>

          {/* TABLE VIEW (Optimal for 100 Buyers) */}
          {viewMode === 'table' && buyerLeads.length > 0 && (
            <div className="galaxy-card rounded-2xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                      <th className="py-3 px-3 text-center w-10">#</th>
                      <th className="py-3 px-4 font-semibold min-w-[200px]">Buyer Enterprise & Web</th>
                      <th className="py-3 px-4 font-semibold min-w-[170px]">Procurement Lead</th>
                      <th className="py-3 px-4 font-semibold min-w-[210px]">Direct Email / Phone</th>
                      <th className="py-3 px-4 font-semibold min-w-[150px]">Port & Destination</th>
                      <th className="py-3 px-4 font-semibold min-w-[200px]">Target Products & MOQ</th>
                      <th className="py-3 px-4 font-semibold text-center w-20">Trade Score</th>
                      <th className="py-3 px-4 font-semibold text-center w-28">Status</th>
                      <th className="py-3 px-4 font-semibold text-right w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {paginatedLeads.map((buyer, idx) => (
                      <tr key={buyer.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3 text-center font-mono text-slate-500 text-[11px]">
                          {(currentPage - 1) * (pageSize || 1) + idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white text-xs flex items-center gap-1.5">
                            <span>{buyer.companyName}</span>
                            <a
                              href={buyer.companyWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-sky-400"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <div className="text-[10px] text-sky-300/80 mt-0.5">
                            {buyer.buyerType?.toUpperCase() || 'IMPORTER & DISTRIBUTOR'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-200">{buyer.contactFullName}</div>
                          <div className="text-[10px] text-slate-400">{buyer.jobTitle}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-slate-200 text-xs flex items-center gap-1">
                            <span>{buyer.businessEmail}</span>
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          </div>
                          {buyer.publicBusinessPhone && (
                            <div className="text-[10px] text-slate-400 mt-0.5">{buyer.publicBusinessPhone}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-xs">
                          {buyer.regionCity || buyer.country}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-xs font-semibold text-sky-300">
                            {buyer.targetProductCategory || 'Agro-Commodities'}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            MOQ: {buyer.minOrderQuantity || '1 x 20ft FCL'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-emerald-400 text-xs">
                            {buyer.leadScore}/100
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge status={buyer.leadStatus} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleGeneratePitchForBuyer(buyer)}
                            className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-semibold transition-colors whitespace-nowrap"
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

          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedLeads.map((buyer) => (
                <div key={buyer.id} className="galaxy-card p-5 rounded-2xl border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">{buyer.companyName}</h3>
                          <a
                            href={buyer.companyWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-sky-400"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <p className="text-xs text-sky-300 font-medium">
                          {buyer.regionCity || buyer.country} • {buyer.buyerType?.toUpperCase() || 'IMPORTER'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-400">{buyer.leadScore}/100</div>
                        <span className="text-[10px] text-slate-400">Trade Score</span>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">{buyer.contactFullName}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-md bg-sky-950/50 text-sky-300 border border-sky-500/30 font-medium">
                          {buyer.jobTitle}
                        </span>
                      </div>
                      
                      <div className="mt-2.5 flex items-center justify-between text-xs pt-2.5 border-t border-slate-800/80">
                        <span className="text-slate-300 font-mono text-xs">{buyer.businessEmail}</span>
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {buyer.emailVerificationStatus} ({buyer.emailConfidenceScore}%)
                        </span>
                      </div>
                    </div>

                    {/* Trade Specs */}
                    <div className="mt-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Product Category:</span>
                        <span className="font-semibold text-sky-300">{buyer.targetProductCategory || 'Food & Commodities'}</span>
                      </div>

                      {buyer.productCertifications && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-slate-400 text-[11px]">Required:</span>
                          {buyer.productCertifications.map(c => (
                            <span key={c} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-slate-300 bg-sky-950/30 p-3 rounded-xl border border-sky-500/20 leading-relaxed mt-2">
                        <strong className="text-sky-200">Trade Sourcing Evidence:</strong> {buyer.leadScoreReason}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <StatusBadge status={buyer.leadStatus} />
                    
                    <button
                      onClick={() => handleGeneratePitchForBuyer(buyer)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Draft Export Inquiry</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Toolbar */}
          {buyerLeads.length > 0 && pageSize > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
              <span>
                Showing {Math.min((currentPage - 1) * pageSize + 1, buyerLeads.length)} to {Math.min(currentPage * pageSize, buyerLeads.length)} of {buyerLeads.length} overseas buyers
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

          {buyerLeads.length === 0 && (
            <div className="galaxy-card p-12 text-center rounded-2xl border border-slate-800">
              <p className="text-sm text-slate-400">No overseas buyers sourced yet. Use the Sourcing Engine in Tab 1 to scan trade directories.</p>
              <button
                onClick={() => handleSourcingSearch(100)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
              >
                <Sparkles className="w-4 h-4" />
                <span>Source 100 Verified Overseas Buyers</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EXPORT MAIL PROCESSING */}
      {activeTab === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Email Composer */}
          <div className="lg:col-span-2 galaxy-card p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-sky-400" />
                  <span>Mode B Export Inquiry Generator</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Compose formal international buyer pitches and container specifications
                </p>
              </div>

              {sendSuccessMsg && (
                <span className="text-xs px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold animate-in fade-in">
                  {sendSuccessMsg}
                </span>
              )}
            </div>

            {/* Controls Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Target Overseas Buyer</label>
                <select
                  value={composerLeadId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setComposerLeadId(id);
                    const found = leads.find(l => l.id === id);
                    if (found) generateExportEmailContent(found, composerTone);
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                >
                  {buyerLeads.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.companyName} – {b.country} ({b.contactFullName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Email Tone</label>
                <select
                  value={composerTone}
                  onChange={(e) => {
                    const tone = e.target.value as EmailTone;
                    setComposerTone(tone);
                    const found = leads.find(l => l.id === composerLeadId);
                    if (found) generateExportEmailContent(found, tone);
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="Formal">Formal (Standard International Trade)</option>
                  <option value="Professional">Professional (Consultative)</option>
                  <option value="Concise">Concise (Direct Specifications & CIF)</option>
                  <option value="Friendly">Friendly</option>
                </select>
              </div>
            </div>

            {/* Subject Line */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Subject Line</label>
              <input
                type="text"
                value={composedSubject}
                onChange={(e) => setComposedSubject(e.target.value)}
                placeholder="Export subject line..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-medium"
              />
            </div>

            {/* Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-400">Trade Letter Content</label>
                {isDrafting && (
                  <span className="text-[11px] text-sky-400 flex items-center gap-1 font-semibold">
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
                className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white leading-relaxed font-sans focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <button
                onClick={() => {
                  const found = leads.find(l => l.id === composerLeadId);
                  if (found) generateExportEmailContent(found, composerTone);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Regenerate Export Pitch</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveCurrentDraft}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Save as Draft
                </button>
                <button
                  onClick={handleSendDirect}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/30 flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Approve & Send Now</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Outbound Export Inquiries */}
          <div className="galaxy-card p-5 rounded-2xl border border-slate-800 flex flex-col h-[600px]">
            <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Mode B Export Outbox</h3>
                <p className="text-[11px] text-slate-400">Trade inquiries & approvals</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
                {exportDrafts.length} Total
              </span>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
              {exportDrafts.map((d) => (
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

                  <p className="text-[11px] text-sky-300 font-medium truncate">
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
                      className="text-sky-400 hover:text-sky-300 font-semibold"
                    >
                      Load in Editor
                    </button>
                  </div>
                </div>
              ))}

              {exportDrafts.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No export outreach drafts generated yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EXPORT FOLLOW-UP CADENCE */}
      {activeTab === 'followup' && (
        <div className="space-y-4">
          <div className="galaxy-card p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-sky-400" />
                  <span>Mode B Trade Cadence & Sample Follow-ups</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Track catalog review, sample shipment delivery, and quotation discussions
                </p>
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['All', 'Due Today', 'Overdue', 'Upcoming'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFollowUpTab(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      followUpTab === tab
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode B Buyer Inbound Replies Section */}
            {clientReplies.filter(r => r.leadMode === 'export_buyers').length > 0 && (
              <div className="pt-4 pb-2 border-b border-slate-800">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Inbound Buyer Replies Received ({clientReplies.filter(r => r.leadMode === 'export_buyers').length})</span>
                  </span>
                  <span className="text-[10px] text-slate-400">These buyers replied — trade negotiation in progress!</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {clientReplies.filter(r => r.leadMode === 'export_buyers').map(reply => (
                    <div key={reply.id} className="p-3 rounded-xl bg-slate-950/80 border border-sky-500/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{reply.leadName} ({reply.companyName})</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                          {reply.sentiment}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 italic line-clamp-2">"{reply.replySnippet}"</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                        <span>{reply.replyDate}</span>
                        <span className="text-sky-400 font-medium">{reply.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up Tasks */}
            <div className="pt-4 space-y-3">
              {followUpTasks
                .filter(t => followUpTab === 'All' || t.status === followUpTab)
                .map(task => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-white text-sm">{task.leadName}</span>
                        <span className="text-xs text-sky-300">({task.companyName})</span>
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
                      <p className="text-xs text-slate-400">{task.email} • Due: {task.dueDate}</p>
                      {task.suggestedDraftSubject && (
                        <p className="text-xs text-sky-200 mt-1 italic">
                          "{task.suggestedDraftSubject}"
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
                        className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Open Trade Follow-up</span>
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
                  No active export follow-ups currently due.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EXPORT PRODUCT CATEGORIES, MOQ & CERTIFICATIONS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="galaxy-card p-6 rounded-2xl border border-sky-500/30 bg-gradient-to-r from-galaxy-900 via-sky-950/40 to-galaxy-900">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 text-xs font-bold mb-2">
                  <Package className="w-3.5 h-3.5" />
                  <span>Mode B Trade Portfolio</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Export Product Categories, MOQ & Certifications</h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  International commodity catalogs with standard container MOQs, port delivery specifications, and mandatory compliance certifications (ISO 22000, HACCP, Halal, FDA, CE).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('agent')}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-sky-600/30 transition-all"
                >
                  <Bot className="w-4 h-4" />
                  <span>Ask Export AI Agent</span>
                </button>
              </div>
            </div>
          </div>

          {/* Product Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: 'agro',
                title: 'Agro-Commodities & Spices',
                badge: 'High Volume Export',
                moq: '1 x 20ft FCL (15-18 MT)',
                ports: 'Jebel Ali, Rotterdam, London Gateway',
                certs: ['ISO 22000:2018', 'HACCP', 'Halal Certified (ESMA)', 'Spice Board Registration', 'Phytosanitary Cert'],
                items: ['Black Pepper (TGSEB)', 'Green Cardamom (8mm)', 'Turmeric Fingers (Curcumin > 3%)', 'Dry Ginger', 'Cumin & Coriander Seeds'],
                prompt: '50 UAE agro spice buyers venum'
              },
              {
                id: 'food',
                title: 'Processed Foods & Beverages',
                badge: 'FMCG Wholesale',
                moq: '1 x 20ft FCL or Mixed 40ft HQ',
                ports: 'Jebel Ali, Dammam, Singapore, New York',
                certs: ['US FDA Registered', 'FSSAI Export License', 'ISO 22000', 'Halal Certified', 'BRCGS Food Safety'],
                items: ['Aphonso Mango Pulp (Canned)', 'Indian Ready-to-Eat curries', 'Instant Coffee Powder', 'Basmati Rice (1121 Sella)', 'Pickles & Condiments'],
                prompt: '50 UAE food distributors venum'
              },
              {
                id: 'organic',
                title: 'Organic Foods & Superfoods',
                badge: 'Premium Margin',
                moq: '500 kg - 1 x 20ft FCL',
                ports: 'Hamburg, Antwerp, Gothenburg, Felixstowe',
                certs: ['EU Organic (EC 834/2007)', 'USDA Organic (NOP)', 'NPOP India', 'Non-GMO Project', 'Fair Trade'],
                items: ['Organic Moringa Powder', 'Cold-Pressed Virgin Coconut Oil', 'Chia & Flax Seeds', 'Herbal Infusions & Teas', 'Organic Turmeric Powder'],
                prompt: '50 Germany organic food buyers venum'
              },
              {
                id: 'textiles',
                title: 'Apparel, Garments & Home Textiles',
                badge: 'Contract Manufacturing',
                moq: '1,000 pcs per style / 1x20ft FCL',
                ports: 'Southampton, Le Havre, Savannah, Dubai',
                certs: ['OEKO-TEX Standard 100', 'GOTS (Global Organic Textile)', 'Sedex SMETA Audited', 'WRAP Certified'],
                items: ['100% Combed Cotton T-Shirts', 'Hotel Terry Bath Towels & Robes', 'Luxury Bed Linen 400TC', 'Hospital Uniforms & Scrubs', 'Workwear Overalls'],
                prompt: '50 UK garment importers venum'
              },
              {
                id: 'engineering',
                title: 'Engineering & Auto Components',
                badge: 'Industrial B2B',
                moq: '2 - 5 Metric Tons',
                ports: 'Hamburg, Chicago, Melbourne, Jebel Ali',
                certs: ['ISO 9001:2015', 'IATF 16949 (Automotive)', 'CE Marking', 'RoHS Compliance', 'Material Test Cert 3.1'],
                items: ['Precision CNC Turned Components', 'Cast Iron & SG Iron Castings', 'Brass Plumbing Fittings', 'Centrifugal Water Pumps', 'Industrial Fasteners Grade 8.8/10.9'],
                prompt: '50 USA auto component buyers venum'
              },
              {
                id: 'ceramics',
                title: 'Ceramics, Tiles & Sanitaryware',
                badge: 'Infrastructure Export',
                moq: '1 x 20ft FCL (1,200 - 1,400 sq.m)',
                ports: 'Jeddah, Dammam, Shuwaikh, Sohar',
                certs: ['SASO Saber Registered (Saudi)', 'CE Certified (EN 14411)', 'ISO 13006', 'Soncap Certified'],
                items: ['Glazed Vitrified Tiles (600x1200mm)', 'Porcelain Outdoor Pavers', 'Ceramic Wall Tiles', 'Water Closets & Wash Basins', 'Full Body Vitrified Slabs'],
                prompt: '50 Saudi Arabia ceramic tile buyers venum'
              }
            ].map(cat => (
              <div key={cat.id} className="galaxy-card p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between hover:border-sky-500/40 transition-all group">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                      {cat.badge}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      MOQ: {cat.moq}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm group-hover:text-sky-300 transition-colors">
                    {cat.title}
                  </h3>

                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Key Products:</span>
                      <ul className="mt-1 space-y-0.5 text-slate-300 text-[11px]">
                        {cat.items.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                            <span className="truncate">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">Certifications:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cat.certs.map((c, idx) => (
                          <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 truncate">Delivery: {cat.ports.split(',')[0]}</span>
                  <button
                    onClick={() => {
                      setProductCategory(cat.title);
                      setActiveTab('agent');
                      handleSendChatMessage(cat.prompt);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-sky-600/30 transition-all shrink-0"
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

      {/* TAB 6: EXPORT SETTINGS & SENDER PROFILE */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <SettingsPage mode="mode_b" />
        </div>
      )}
    </div>
  );
};
