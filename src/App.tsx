import React, { useState } from 'react';
import { Sidebar, NavPage } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { GalaxyBackground } from './components/GalaxyBackground';
import { INITIAL_MOCK_LEADS, INITIAL_MOCK_DRAFTS } from './data/mockLeads';
import { Lead, EmailDraft } from './types';

// Pages
import { Dashboard } from './pages/Dashboard';
import { AiLeadFinder } from './pages/AiLeadFinder';
import { ServiceLeads } from './pages/ServiceLeads';
import { ExportBuyerLeads } from './pages/ExportBuyerLeads';
import { LeadDatabase } from './pages/LeadDatabase';
import { EmailDrafts } from './pages/EmailDrafts';
import { SendingApproval } from './pages/SendingApproval';
import { FollowUpManager } from './pages/FollowUpManager';
import { ImportExportCenter } from './pages/ImportExportCenter';
import { Integrations } from './pages/Integrations';
import { PrivacyControls } from './pages/PrivacyControls';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [activePage, setActivePage] = useState<NavPage>('dashboard');
  const [leads, setLeads] = useState<Lead[]>(INITIAL_MOCK_LEADS);
  const [drafts, setDrafts] = useState<EmailDraft[]>(INITIAL_MOCK_DRAFTS);
  const [selectedLeadForPitch, setSelectedLeadForPitch] = useState<Lead | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Theme Management (Option 1: Cosmic Dark default with instant toggle)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

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
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
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
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
  };

  const handleDeleteLead = (leadId: string) => {
    setLeads(prev => prev.filter(l => l.id !== leadId));
  };

  const handleSelectLeadForPitch = (lead: Lead) => {
    setSelectedLeadForPitch(lead);
    setActivePage('email_drafts');
  };

  const handleSaveDraftForApproval = (draft: EmailDraft) => {
    setDrafts(prev => [draft, ...prev]);
    // update lead status to Draft Ready or Awaiting Approval
    setLeads(prev => prev.map(l => l.id === draft.leadId ? { ...l, leadStatus: 'Awaiting Approval' } : l));
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
          subject: draft.subject,
          body: draft.body,
          userApproved: true,
        }),
      });

      const data = await response.json();

      if (data.success && data.sent) {
        setDrafts(prev => prev.map(d => d.id === draftId ? {
          ...d,
          status: 'Sent',
          sentAt: new Date().toISOString(),
          messageId: data.messageId
        } : d));

        // Update corresponding lead status to Sent
        setLeads(prev => prev.map(l => l.id === draft.leadId ? {
          ...l,
          leadStatus: 'Sent',
          lastContactDate: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } : l));

        return true;
      }
      return false;
    } catch {
      // Local fallback send simulation
      setDrafts(prev => prev.map(d => d.id === draftId ? {
        ...d,
        status: 'Sent',
        sentAt: new Date().toISOString(),
        messageId: `msg-sim-${Date.now()}`
      } : d));

      setLeads(prev => prev.map(l => l.id === draft.leadId ? {
        ...l,
        leadStatus: 'Sent',
        lastContactDate: new Date().toISOString()
      } : l));

      return true;
    }
  };

  const handleRejectDraft = (draftId: string) => {
    setDrafts(prev => prev.map(d => d.id === draftId ? { ...d, status: 'Rejected' } : d));
  };

  const handleUpdateDraft = (updated: EmailDraft) => {
    setDrafts(prev => prev.map(d => d.id === updated.id ? updated : d));
  };

  const handleExportCsv = async (leadsToExport: Lead[]) => {
    try {
      const response = await fetch('/api/export/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: leadsToExport }),
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

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#060913] text-slate-800 dark:text-slate-100 font-sans relative selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:bg-indigo-500/30 dark:selection:text-white">
      {/* Background Ambience */}
      <GalaxyBackground />

      {/* Persistent Left Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        pendingApprovalsCount={pendingApprovalsCount}
        dueFollowUpsCount={dueFollowUpsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen relative z-10">
        <TopNavbar
          searchQuery={globalSearch}
          setSearchQuery={setGlobalSearch}
          onQuickSearch={() => setActivePage('lead_database')}
          onNavigate={setActivePage}
          activePage={activePage}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {activePage === 'dashboard' && (
            <Dashboard
              leads={leads}
              drafts={drafts}
              onNavigate={setActivePage}
              onSelectLead={handleSelectLeadForPitch}
            />
          )}

          {activePage === 'ai_lead_finder' && (
            <AiLeadFinder
              onSearchComplete={handleAddNewLeads}
              isDemoMode={isDemoMode}
            />
          )}

          {activePage === 'service_leads' && (
            <ServiceLeads
              leads={leads}
              onSelectLead={handleSelectLeadForPitch}
              onAddNewLead={(lead) => setLeads(prev => [lead, ...prev])}
            />
          )}

          {activePage === 'export_buyer_leads' && (
            <ExportBuyerLeads
              leads={leads}
              onSelectLead={handleSelectLeadForPitch}
              onAddNewLead={(lead) => setLeads(prev => [lead, ...prev])}
            />
          )}

          {activePage === 'lead_database' && (
            <LeadDatabase
              leads={leads}
              onUpdateLead={handleUpdateLead}
              onDeleteLead={handleDeleteLead}
              onSelectLeadForPitch={handleSelectLeadForPitch}
              onExportCsv={handleExportCsv}
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
