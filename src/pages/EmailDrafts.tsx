import React, { useState, useEffect } from 'react';
import {
  MailOpen,
  Sparkles,
  Send,
  Copy,
  Check,
  RefreshCw,
  Building,
  User,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { Lead, EmailDraft, EmailTone } from '../types';
import { DATAGALACTIC_SERVICES, DATAGALACTIC_COMPANY } from '../data/catalog';

interface EmailDraftsProps {
  selectedLead: Lead | null;
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onSaveDraftForApproval: (draft: EmailDraft) => void;
}

export const EmailDrafts: React.FC<EmailDraftsProps> = ({
  selectedLead,
  leads,
  onSelectLead,
  onSaveDraftForApproval
}) => {
  const [activeLead, setActiveLead] = useState<Lead | null>(selectedLead || leads[0] || null);
  const [tone, setTone] = useState<EmailTone>('Professional');
  const [service, setService] = useState<string>(activeLead?.recommendedService || 'Data Cleaning & Formatting');
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (selectedLead) {
      setActiveLead(selectedLead);
      setService(selectedLead.recommendedService || 'Data Cleaning & Formatting');
    }
  }, [selectedLead]);

  // Generate Email Draft via API or grounded fallback
  const handleGenerate = async () => {
    if (!activeLead) return;
    setIsGenerating(true);
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: activeLead,
          tone,
          customService: service
        }),
      });
      const data = await response.json();
      if (data.success && data.draft) {
        setSubject(data.draft.subject);
        setBody(data.draft.body);
      }
    } catch (e) {
      // Fallback generator
      const greeting = tone === 'Friendly' ? `Hi ${activeLead.contactFirstName},` : `Dear ${activeLead.contactFirstName},`;
      setSubject(`High-precision ${service.toLowerCase()} for ${activeLead.companyName}`);
      setBody(`${greeting}

I noticed ${activeLead.companyName}'s active operations in the ${activeLead.industry} sector in ${activeLead.country}.

At DataGalactic, we provide specialized B2B ${service} and back-office support with guaranteed 99.8% precision. Our remote team assists operations leaders like yourself in streamlining high-volume paperwork, CRM data hygiene, and day-to-day administrative burdens while reducing overhead by up to 60%.

Given your role as ${activeLead.jobTitle}, would you be open to a brief 5-minute conversation next week to see how DataGalactic could support ${activeLead.companyName}?

Best regards,

Risona
Founder, DataGalactic
"Precision Beyond Limits"
https://datagalactic.com`);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (activeLead && !body) {
      handleGenerate();
    }
  }, [activeLead, tone, service]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQueueForApproval = () => {
    if (!activeLead) return;

    const newDraft: EmailDraft = {
      id: `draft-${Date.now()}`,
      leadId: activeLead.id,
      recipientEmail: activeLead.businessEmail,
      recipientName: activeLead.contactFullName,
      companyName: activeLead.companyName,
      jobTitle: activeLead.jobTitle,
      subject,
      body,
      tone,
      recommendedService: service,
      status: 'Awaiting Approval',
      createdAt: new Date().toISOString()
    };

    onSaveDraftForApproval(newDraft);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <MailOpen className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">AI Personalized Email Writer</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Generate grounded, ethical outreach emails tailored to the prospect's verified industry and role. No fabricated relationships.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lead Context & Controls */}
        <div className="space-y-4">
          {/* Lead Selector Card */}
          <div className="galaxy-card p-5 rounded-2xl border border-slate-800">
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Select Target Prospect:
            </label>
            <select
              value={activeLead?.id || ''}
              onChange={(e) => {
                const target = leads.find(l => l.id === e.target.value);
                if (target) {
                  setActiveLead(target);
                  onSelectLead(target);
                  setService(target.recommendedService || 'Data Cleaning & Formatting');
                }
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
            >
              {leads.map(l => (
                <option key={l.id} value={l.id}>
                  {l.companyName} ({l.contactFullName} - {l.country})
                </option>
              ))}
            </select>

            {activeLead && (
              <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Company:</span>
                  <span className="text-white font-medium">{activeLead.companyName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Contact Person:</span>
                  <span className="text-indigo-300 font-semibold">{activeLead.contactFullName}</span>
                  <span className="text-slate-400 text-[11px] block">({activeLead.jobTitle})</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Verified Email:</span>
                  <span className="text-slate-300 font-mono text-[11px]">{activeLead.businessEmail}</span>
                </div>
              </div>
            )}
          </div>

          {/* Tone & Service Tuning */}
          <div className="galaxy-card p-5 rounded-2xl border border-slate-800 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Outreach Tone:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Professional', 'Friendly', 'Concise', 'Formal'] as EmailTone[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                      tone === t
                        ? 'bg-indigo-600 text-white border-indigo-400/50 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                DataGalactic Service to Pitch:
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              >
                {DATAGALACTIC_SERVICES.map(s => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate with Tone</span>
            </button>
          </div>
        </div>

        {/* Right Column: Email Editor & Action Buttons */}
        <div className="lg:col-span-2 galaxy-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-white">Email Draft Preview</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/20">
                  Sender: {DATAGALACTIC_COMPANY.founder} (Founder)
                </span>
              </div>
            </div>

            {/* Subject Input */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Subject Line:
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-medium"
              />
            </div>

            {/* Body Textarea */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Personalized Body Message:
              </label>
              <textarea
                rows={13}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white leading-relaxed font-sans focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleCopyToClipboard}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Draft'}</span>
            </button>

            <div className="flex items-center gap-3">
              {saveSuccess && (
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Queued for Approval!
                </span>
              )}

              <button
                onClick={handleQueueForApproval}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Save to Sending Approval Queue</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
