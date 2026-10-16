import React, { useState } from 'react';
import {
  ShieldCheck,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  User,
  Building,
  Edit3,
  Clock,
  PauseCircle,
  PlayCircle
} from 'lucide-react';
import { EmailDraft, Lead } from '../types';
import { Modal } from '../components/Modal';

interface SendingApprovalProps {
  drafts: EmailDraft[];
  leads: Lead[];
  onApproveAndSend: (draftId: string) => Promise<boolean>;
  onRejectDraft: (draftId: string) => void;
  onUpdateDraft: (draft: EmailDraft) => void;
}

export const SendingApproval: React.FC<SendingApprovalProps> = ({
  drafts,
  leads,
  onApproveAndSend,
  onRejectDraft,
  onUpdateDraft
}) => {
  const [inspectingDraft, setInspectingDraft] = useState<EmailDraft | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [batchPaused, setBatchPaused] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const pendingDrafts = drafts.filter(d => d.status === 'Awaiting Approval');
  const completedDrafts = drafts.filter(d => d.status === 'Sent');

  const handleSendSingle = async (draft: EmailDraft) => {
    setIsSending(true);
    setStatusMessage(`Sending user-approved email to ${draft.recipientEmail}...`);

    try {
      const success = await onApproveAndSend(draft.id);
      if (success) {
        setStatusMessage(`Successfully sent email to ${draft.recipientEmail} with verified transmission ID!`);
        setInspectingDraft(null);
      } else {
        setStatusMessage(`Delivery failed: Provider rejected transmission.`);
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsSending(false);
      setTimeout(() => setStatusMessage(''), 4000);
    }
  };

  const handleBatchApproveAll = async () => {
    setIsSending(true);
    for (const draft of pendingDrafts) {
      if (batchPaused) break;
      await onApproveAndSend(draft.id);
      // Brief rate-limit pause
      await new Promise(r => setTimeout(r, 600));
    }
    setIsSending(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Email Sending Approval Safety Gate</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Strict human-in-the-loop compliance: Every email must be individually or batch-approved by you before dispatch.
          </p>
        </div>

        {pendingDrafts.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBatchPaused(!batchPaused)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              {batchPaused ? <PlayCircle className="w-4 h-4 text-emerald-400" /> : <PauseCircle className="w-4 h-4 text-amber-400" />}
              <span>{batchPaused ? 'Resume Sending' : 'Pause Batch'}</span>
            </button>

            <button
              onClick={handleBatchApproveAll}
              disabled={isSending || batchPaused}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Approve & Send All ({pendingDrafts.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-xs text-indigo-200 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400 animate-spin" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Pending Approval List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Awaiting Your Explicit Approval</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs border border-amber-500/30">
              {pendingDrafts.length}
            </span>
          </h3>
        </div>

        {pendingDrafts.length === 0 ? (
          <div className="galaxy-card p-12 text-center rounded-2xl border border-slate-800">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No Emails Awaiting Approval</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              All prepared email campaigns have been reviewed. Generate new drafts in the AI Personalized Email Writer.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingDrafts.map((draft) => (
              <div
                key={draft.id}
                className="galaxy-card p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Draft Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-white text-sm">{draft.companyName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/20">
                        {draft.tone} Tone
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Pitch: {draft.recommendedService}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <span className="flex items-center gap-1 font-medium text-slate-200">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {draft.recipientName} ({draft.jobTitle})
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400 font-mono text-[11px]">{draft.recipientEmail}</span>
                    </div>

                    <p className="text-xs font-semibold text-indigo-200 pt-1">
                      Subject: <span className="font-normal text-slate-300">{draft.subject}</span>
                    </p>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setInspectingDraft(draft)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Inspect & Edit</span>
                    </button>

                    <button
                      onClick={() => onRejectDraft(draft.id)}
                      className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/20 transition-colors"
                      title="Reject Draft"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleSendSingle(draft)}
                      disabled={isSending}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Approve & Send</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmed Sent Log */}
      {completedDrafts.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-slate-800">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Confirmed Successfully Sent Emails ({completedDrafts.length})</span>
          </h3>

          <div className="galaxy-card rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Recipient</th>
                  <th className="py-2.5 px-4 font-semibold">Company</th>
                  <th className="py-2.5 px-4 font-semibold">Subject</th>
                  <th className="py-2.5 px-4 font-semibold">Message ID</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Sent Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {completedDrafts.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-4 font-medium text-white">{d.recipientName} ({d.recipientEmail})</td>
                    <td className="py-2.5 px-4 text-slate-300">{d.companyName}</td>
                    <td className="py-2.5 px-4 text-slate-400 truncate max-w-[200px]">{d.subject}</td>
                    <td className="py-2.5 px-4 font-mono text-[10px] text-indigo-400">{d.messageId || 'msg-authorized'}</td>
                    <td className="py-2.5 px-4 text-right text-slate-400 text-[11px]">{new Date(d.sentAt || d.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect & Edit Full Modal */}
      {inspectingDraft && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingDraft(null)}
          title="Inspect & Edit Email Before Approval"
          subtitle={`To: ${inspectingDraft.recipientName} <${inspectingDraft.recipientEmail}>`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Recipient Email:
              </label>
              <input
                type="text"
                value={inspectingDraft.recipientEmail}
                onChange={(e) => setInspectingDraft({ ...inspectingDraft, recipientEmail: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Subject Line:
              </label>
              <input
                type="text"
                value={inspectingDraft.subject}
                onChange={(e) => setInspectingDraft({ ...inspectingDraft, subject: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Message Body:
              </label>
              <textarea
                rows={10}
                value={inspectingDraft.body}
                onChange={(e) => setInspectingDraft({ ...inspectingDraft, body: e.target.value })}
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-sans leading-relaxed focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  onUpdateDraft(inspectingDraft);
                  setInspectingDraft(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Save Changes Only
              </button>

              <button
                onClick={() => {
                  onUpdateDraft(inspectingDraft);
                  handleSendSingle(inspectingDraft);
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm Approval & Send Now</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
