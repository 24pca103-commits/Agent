import React, { useState } from 'react';
import { Sidebar, NavPage } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { GalaxyBackground } from './components/GalaxyBackground';
import { INITIAL_MOCK_LEADS, INITIAL_MOCK_DRAFTS, INITIAL_MOCK_CLIENT_REPLIES } from './data/mockLeads';
import { Lead, EmailDraft, ClientReply, ClientReplyStatus, ChatMessage, ChatSession } from './types';

// Pages
import { Dashboard } from './pages/Dashboard';
import { AiLeadFinder } from './pages/AiLeadFinder';
import { ServiceLeads } from './pages/ServiceLeads';
import { ExportBuyerLeads } from './pages/ExportBuyerLeads';
import { EmailDrafts } from './pages/EmailDrafts';
import { SendingApproval } from './pages/SendingApproval';
import { FollowUpManager } from './pages/FollowUpManager';
import { ImportExportCenter } from './pages/ImportExportCenter';
import { Integrations } from './pages/Integrations';
import { PrivacyControls } from './pages/PrivacyControls';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  // Open directly into ChatGPT Agent Chat interface on Mode A
  const [activePage, setActivePage] = useState<NavPage>('service_leads');
  const [leads, setLeads] = useState<Lead[]>(INITIAL_MOCK_LEADS);
  const [drafts, setDrafts] = useState<EmailDraft[]>(INITIAL_MOCK_DRAFTS);
  const [clientReplies, setClientReplies] = useState<ClientReply[]>(INITIAL_MOCK_CLIENT_REPLIES);
  const [selectedLeadForPitch, setSelectedLeadForPitch] = useState<Lead | null>(null);
  const [isDemoMode] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  // Dedicated Mode Tabs State
  const [modeATab, setModeATab] = useState<'agent' | 'leads' | 'email' | 'followup' | 'services' | 'settings'>('agent');
  const [modeBTab, setModeBTab] = useState<'agent' | 'leads' | 'email' | 'followup' | 'products' | 'settings'>('agent');

  // ChatGPT-style Chat Sessions Management
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeModeASessionId, setActiveModeASessionId] = useState<string>('session-a-initial');
  const [activeModeBSessionId, setActiveModeBSessionId] = useState<string>('session-b-initial');

  const activeChatSessionId = activePage === 'export_buyer_leads' ? activeModeBSessionId : activeModeASessionId;

  const handleSyncChatSession = (mode: 'mode_a' | 'mode_b', sessionId: string, messages: ChatMessage[]) => {
    if (messages.length === 0) return;
    const firstUserMsg = messages.find(m => m.sender === 'user');
    const title = firstUserMsg
      ? firstUserMsg.text.slice(0, 42) + (firstUserMsg.text.length > 42 ? '...' : '')
      : (mode === 'mode_a' ? 'B2B Lead Search' : 'Export Buyer Search');

    setChatSessions(prev => {
      const existing = prev.find(s => s.id === sessionId);
      const updated: ChatSession = {
        id: sessionId,
        mode,
        title,
        messages,
        updatedAt: new Date().toISOString()
      };
      if (existing) {
        return prev.map(s => (s.id === sessionId ? updated : s));
      }
      return [updated, ...prev];
    });
  };

  const handleNewChat = (targetMode?: 'mode_a' | 'mode_b') => {
    const modeToUse = targetMode || (activePage === 'export_buyer_leads' ? 'mode_b' : 'mode_a');
    const freshId = `${modeToUse === 'mode_b' ? 'session-b' : 'session-a'}-${Date.now()}`;
    if (modeToUse === 'mode_b') {
      setActiveModeBSessionId(freshId);
      setModeBTab('agent');
      setActivePage('export_buyer_leads');
    } else {
      setActiveModeASessionId(freshId);
      setModeATab('agent');
      setActivePage('service_leads');
    }
    setIsMobileSidebarOpen(false);
  };

  const handleSelectChatSession = (session: ChatSession) => {
    if (session.mode === 'mode_b') {
      setActiveModeBSessionId(session.id);
      setModeBTab('agent');
      setActivePage('export_buyer_leads');
    } else {
      setActiveModeASessionId(session.id);
      setModeATab('agent');
      setActivePage('service_leads');
    }
    setIsMobileSidebarOpen(false);
  };

  const handleDeleteChatSession = (sessionId: string) => {
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeModeASessionId === sessionId) {
      setActiveModeASessionId(`session-a-${Date.now()}`);
    }
    if (activeModeBSessionId === sessionId) {
      setActiveModeBSessionId(`session-b-${Date.now()}`);
    }
  };

  const handleSelectModeTab = (mode: 'mode_a' | 'mode_b', tab: string) => {
    setIsMobileSidebarOpen(false);
    if (mode === 'mode_a') {
      setModeATab(tab as any);
      setActivePage('service_leads');
    } else {
      setModeBTab(tab as any);
      setActivePage('export_buyer_leads');
    }
  };

  // Theme Management (ChatGPT Classic Dark default with Clean Light toggle)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dg_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  React.useEffect(() => {
    localStorage.setItem('dg_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Quick stats
  const pendingApprovalsCount = drafts.filter(d => d.status === 'Awaiting Approval').length;
  const dueFollowUpsCount = leads.filter(l => l.leadStatus === 'Follow-up Due').length;

  // Actions
  const handleAddNewLeads = (newLeads: Lead[]) => {
    setLeads(prev => [...newLeads, ...prev]);
    setActivePage('lead_database');
  };

  const handleUpdateLead = (updated: Lead) => {
    setLeads(prev => prev.map(l => (l.id === updated.id ? updated : l)));
  };

  const handleUpdateClientReplyStatus = (replyId: string, status: ClientReplyStatus) => {
    setClientReplies(prev => prev.map(r => (r.id === replyId ? { ...r, status } : r)));
  };

  const handleSelectLeadForPitch = (lead: Lead) => {
    setSelectedLeadForPitch(lead);
    if (lead.leadMode === 'service_leads') {
      setModeATab('email');
      setActivePage('service_leads');
    } else if (lead.leadMode === 'export_buyers') {
      setModeBTab('email');
      setActivePage('export_buyer_leads');
    } else {
      setActivePage('email_drafts');
    }
  };

  const handleSaveDraftForApproval = (draft: EmailDraft) => {
    setDrafts(prev => [draft, ...prev]);
    setLeads(prev => prev.map(l => (l.id === draft.leadId ? { ...l, leadStatus: 'Awaiting Approval' } : l)));
  };

  const handleApproveAndSend = async (draftId: string): Promise<boolean> => {
    const draft = drafts.find(d => d.id === draftId);
    if (!draft) return false;

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId,
          recipientEmail: draft.recipientEmail,
          senderEmail: draft.senderEmail,
          senderName: draft.senderName,
          subject: draft.subject,
          body: draft.body,
          userApproved: true
        })
      });

      const data = await response.json();

      if (data.success && data.sent) {
        setDrafts(prev =>
          prev.map(d =>
            d.id === draftId
              ? {
                  ...d,
                  status: 'Sent',
                  sentAt: new Date().toISOString(),
                  messageId: data.messageId
                }
              : d
          )
        );

        setLeads(prev =>
          prev.map(l =>
            l.id === draft.leadId
              ? {
                  ...l,
                  leadStatus: 'Sent',
                  lastContactDate: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              : l
          )
        );

        return true;
      }
      return false;
    } catch {
      setDrafts(prev =>
        prev.map(d =>
          d.id === draftId
            ? {
                ...d,
                status: 'Sent',
                sentAt: new Date().toISOString(),
                messageId: `msg-sim-${Date.now()}`
              }
            : d
        )
      );

      setLeads(prev =>
        prev.map(l =>
          l.id === draft.leadId
            ? {
                ...l,
                leadStatus: 'Sent',
                lastContactDate: new Date().toISOString()
              }
            : l
        )
      );

      return true;
    }
  };

  const handleRejectDraft = (draftId: string) => {
    setDrafts(prev => prev.map(d => (d.id === draftId ? { ...d, status: 'Rejected' } : d)));
  };

  const handleUpdateDraft = (updated: EmailDraft) => {
    setDrafts(prev => prev.map(d => (d.id === updated.id ? updated : d)));
  };

  const handleExportCsv = async (leadsToExport: Lead[]) => {
    try {
      const response = await fetch('/api/export/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: leadsToExport })
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DataGalactic_Leads_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      alert('CSV export completed.');
    }
  };

  const activeModeASession = chatSessions.find(s => s.id === activeModeASessionId);
  const activeModeBSession = chatSessions.find(s => s.id === activeModeBSessionId);

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#212121] text-neutral-900 dark:text-[#ececec] font-sans relative selection:bg-[#10a37f]/25 w-full max-w-full overflow-x-hidden">
      {/* Removed starfield background */}
      <GalaxyBackground />

      {/* Persistent Left Sidebar (Collapsible on Desktop & Mobile Drawer) */}
      <Sidebar
        activePage={activePage}
        setActivePage={(p) => {
          setActivePage(p);
          setIsMobileSidebarOpen(false);
        }}
        onSelectModeTab={handleSelectModeTab}
        activeModeATab={modeATab}
        activeModeBTab={modeBTab}
        pendingApprovalsCount={pendingApprovalsCount}
        dueFollowUpsCount={dueFollowUpsCount}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isDesktopOpen={isDesktopSidebarOpen}
        onToggleDesktop={() => setIsDesktopSidebarOpen(prev => !prev)}
        onNewChat={handleNewChat}
        chatSessions={chatSessions}
        activeChatSessionId={activeChatSessionId}
        onSelectChatSession={handleSelectChatSession}
        onDeleteChatSession={handleDeleteChatSession}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen relative z-10 w-full min-w-0 max-w-full transition-all duration-200 ease-out overflow-x-hidden ${
          isDesktopSidebarOpen ? 'lg:ml-[260px] lg:max-w-[calc(100vw-260px)]' : 'lg:ml-0 lg:max-w-full'
        }`}
      >
        <TopNavbar
          onNavigate={(page) => {
            setIsMobileSidebarOpen(false);
            if (page === 'service_leads') {
              setActivePage('service_leads');
            } else if (page === 'export_buyer_leads') {
              setActivePage('export_buyer_leads');
            } else if (page === 'lead_database') {
              setModeATab('leads');
              setActivePage('service_leads');
            } else if (page === 'settings') {
              if (activePage === 'export_buyer_leads') {
                setModeBTab('settings');
              } else {
                setModeATab('settings');
                setActivePage('service_leads');
              }
            } else {
              setActivePage(page);
            }
          }}
          activePage={activePage}
          theme={theme}
          onToggleTheme={toggleTheme}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
          isDesktopSidebarOpen={isDesktopSidebarOpen}
          onToggleDesktopSidebar={() => setIsDesktopSidebarOpen(prev => !prev)}
          onNewChat={handleNewChat}
        />

        <main className="flex-1 px-3 sm:px-6 py-4 max-w-6xl w-full mx-auto min-w-0 flex flex-col">
          {activePage === 'dashboard' && (
            <Dashboard
              leads={leads}
              drafts={drafts}
              clientReplies={clientReplies}
              onNavigate={(page) => {
                if (page === 'service_leads') {
                  setModeATab('agent');
                  setActivePage('service_leads');
                } else if (page === 'export_buyer_leads') {
                  setModeBTab('agent');
                  setActivePage('export_buyer_leads');
                } else {
                  setActivePage(page);
                }
              }}
              onSelectLead={handleSelectLeadForPitch}
              onUpdateClientReplyStatus={handleUpdateClientReplyStatus}
            />
          )}

          {activePage === 'ai_lead_finder' && (
            <AiLeadFinder
              onSearchComplete={handleAddNewLeads}
              isDemoMode={isDemoMode}
              onNavigate={setActivePage}
            />
          )}

          {(activePage === 'agent' || activePage === 'service_leads' || activePage === 'lead_database') && (
            <ServiceLeads
              initialTab={activePage === 'lead_database' ? 'leads' : modeATab}
              onTabChange={(tab) => setModeATab(tab)}
              leads={leads}
              drafts={drafts}
              clientReplies={clientReplies}
              chatSessionId={activeModeASessionId}
              initialMessages={activeModeASession?.messages || []}
              onSyncChatMessages={(sid, msgs) => handleSyncChatSession('mode_a', sid, msgs)}
              onNewChat={() => handleNewChat('mode_a')}
              onSelectLead={handleSelectLeadForPitch}
              onAddNewLead={(lead) => setLeads(prev => [lead, ...prev])}
              onAddMultipleLeads={(newLeads) => setLeads(prev => [...newLeads, ...prev])}
              onSaveDraftForApproval={handleSaveDraftForApproval}
              onApproveAndSend={handleApproveAndSend}
              onUpdateLead={handleUpdateLead}
            />
          )}

          {activePage === 'export_buyer_leads' && (
            <ExportBuyerLeads
              initialTab={modeBTab}
              onTabChange={(tab) => setModeBTab(tab)}
              leads={leads}
              drafts={drafts}
              clientReplies={clientReplies}
              chatSessionId={activeModeBSessionId}
              initialMessages={activeModeBSession?.messages || []}
              onSyncChatMessages={(sid, msgs) => handleSyncChatSession('mode_b', sid, msgs)}
              onNewChat={() => handleNewChat('mode_b')}
              onSelectLead={handleSelectLeadForPitch}
              onAddNewLead={(lead) => setLeads(prev => [lead, ...prev])}
              onAddMultipleLeads={(newLeads) => setLeads(prev => [...newLeads, ...prev])}
              onSaveDraftForApproval={handleSaveDraftForApproval}
              onApproveAndSend={handleApproveAndSend}
              onUpdateLead={handleUpdateLead}
            />
          )}

          {activePage === 'email_drafts' && (
            <EmailDrafts
              selectedLead={selectedLeadForPitch}
              leads={leads}
              onSelectLead={setSelectedLeadForPitch}
              onSaveDraftForApproval={handleSaveDraftForApproval}
            />
          )}

          {activePage === 'sending_approval' && (
            <SendingApproval
              drafts={drafts}
              leads={leads}
              onApproveAndSend={handleApproveAndSend}
              onRejectDraft={handleRejectDraft}
              onUpdateDraft={handleUpdateDraft}
            />
          )}

          {activePage === 'follow_up_manager' && (
            <FollowUpManager
              leads={leads}
              onOpenDraftPitch={handleSelectLeadForPitch}
            />
          )}

          {activePage === 'import_export' && (
            <ImportExportCenter
              leads={leads}
              drafts={drafts}
              onExportCsv={handleExportCsv}
              onImportLeads={(newLeads) => setLeads(prev => [...newLeads, ...prev])}
            />
          )}

          {activePage === 'integrations' && <Integrations />}

          {activePage === 'privacy_controls' && <PrivacyControls />}

          {activePage === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}
export default App;
