import React, { useState } from 'react';
import {
  UserX,
  ShieldCheck,
  Plus,
  Trash2,
  AlertTriangle,
  Lock,
  FileCheck
} from 'lucide-react';

export const PrivacyControls: React.FC = () => {
  const [suppressedEntries, setSuppressedEntries] = useState<string[]>([
    'spam-trap@competitor.com',
    'blocked-domain.com',
    'optout@uklogistics-sample.co.uk',
    'dnc@regulatory.gov'
  ]);

  const [newEntry, setNewEntry] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleAddSuppression = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEntry.trim() && !suppressedEntries.includes(newEntry.trim())) {
      setSuppressedEntries([...suppressedEntries, newEntry.trim()]);
      setNewEntry('');
    }
  };

  const handleRemoveSuppression = (entry: string) => {
    setSuppressedEntries(suppressedEntries.filter(e => e !== entry));
  };

  const handleVerifyCompliance = () => {
    const isBlocked = suppressedEntries.some(s => testEmail.toLowerCase().includes(s.toLowerCase()));
    if (isBlocked) {
      setTestResult(`⛔ BLOCKED: ${testEmail} matches an active suppression / opt-out rule. Outbound email is strictly disallowed.`);
    } else {
      setTestResult(`✓ CLEAR: ${testEmail} is not on the suppression list and is permitted for user-approved outreach.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <UserX className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Privacy, Suppression & Data Controls</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Comply with international privacy regulations (GDPR, CAN-SPAM, UK Data Protection). Suppressed contacts are permanently blocked from outreach.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Do Not Contact List */}
        <div className="galaxy-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Do-Not-Contact (DNC) & Opt-Out Registry</h3>
            <span className="text-xs text-slate-400">{suppressedEntries.length} Suppressed</span>
          </div>

          <form onSubmit={handleAddSuppression} className="flex gap-2">
            <input
              type="text"
              value={newEntry}
              onChange={(e) => setNewEntry(e.target.value)}
              placeholder="Enter email or domain (e.g. acme.com)..."
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Add to DNC
            </button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {suppressedEntries.map((entry) => (
              <div
                key={entry}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs"
              >
                <span className="font-mono text-slate-300">{entry}</span>
                <button
                  onClick={() => handleRemoveSuppression(entry)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Compliance Checker */}
        <div className="galaxy-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Instant Outreach Suppression Test</span>
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            Verify whether an email or domain is safe for outreach before generating or queuing drafts.
          </p>

          <div className="space-y-2">
            <input
              type="text"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="e.g. contact@blocked-domain.com"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
            />
            <button
              onClick={handleVerifyCompliance}
              className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
            >
              Test Compliance Status
            </button>
          </div>

          {testResult && (
            <div className={`p-3.5 rounded-xl text-xs ${
              testResult.includes('BLOCKED')
                ? 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
            }`}>
              {testResult}
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Data Retention Standards:</div>
            <div>• All records store retrieval timestamps and authorized source provenance.</div>
            <div>• Deletion requests completely wipe records from persistent CRM tables.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
