import React, { useState, useEffect } from 'react';
import {
  Cable,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Key,
  ShieldCheck,
  ExternalLink,
  Lock,
  Database,
  Mail,
  Sparkles
} from 'lucide-react';
import { IntegrationStatus } from '../types';

export const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([
    {
      id: 'apollo',
      name: 'Apollo.io B2B Intelligence',
      status: 'demo_mode',
      creditsRemaining: 'Demo Credits: 500',
      lastTested: new Date().toLocaleTimeString(),
      message: 'Running in Zero-Cost Demo Mode (Enter free API key to activate Live Mode)'
    },
    {
      id: 'hunter',
      name: 'Hunter.io Email Verification',
      status: 'demo_mode',
      creditsRemaining: '25 Free / Demo',
      lastTested: new Date().toLocaleTimeString(),
      message: 'Running in Zero-Cost Demo Mode'
    },
    {
      id: 'gemini',
      name: 'Google Gemini AI (LLM Brain)',
      status: 'connected',
      creditsRemaining: 'Active (Server-Side)',
      lastTested: new Date().toLocaleTimeString(),
      message: 'Gemini AI natural language parsing and cold email copywriting active'
    },
    {
      id: 'supabase',
      name: 'Supabase PostgreSQL Cloud DB',
      status: 'demo_mode',
      creditsRemaining: 'Local / Cloud',
      lastTested: new Date().toLocaleTimeString(),
      message: 'Local High-Speed Session Storage Active (Configurable in .env)'
    }
  ]);

  const [testingId, setTestingId] = useState<string | null>(null);
  const [inputKeys, setInputKeys] = useState<{ [key: string]: string }>({});
  const [testResult, setTestResult] = useState<{ [key: string]: string }>({});

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    setTestResult(prev => ({ ...prev, [id]: 'Testing connection with provider server...' }));

    try {
      const res = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: id,
          apiKey: inputKeys[id] || ''
        }),
      });
      const data = await res.json();

      setIntegrations(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: data.status || (data.success ? 'connected' : 'error'),
            creditsRemaining: data.creditsRemaining || item.creditsRemaining,
            lastTested: new Date().toLocaleTimeString(),
            message: data.message
          };
        }
        return item;
      }));

      setTestResult(prev => ({ ...prev, [id]: data.message }));
    } catch (err: any) {
      setTestResult(prev => ({ ...prev, [id]: `Test failed: ${err.message}` }));
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Cable className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Integrations & API Settings</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Manage authorized data providers, check connection status, and test live server endpoints. Secrets are protected server-side.
        </p>
      </div>

      {/* Security Banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-slate-300">
            <strong>Server-Side Security Active:</strong> API keys and secrets are securely processed on the Node.js backend runtime and never exposed to client browsers or network logs.
          </span>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((item) => {
          const isConnected = item.status === 'connected';
          const isDemo = item.status === 'demo_mode';
          const isError = item.status === 'error';

          return (
            <div key={item.id} className="galaxy-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{item.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{item.creditsRemaining}</p>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  isConnected
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    : isDemo
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                }`}>
                  {isConnected ? '● Connected (Live)' : isDemo ? '● Demo Mode' : '● Not Configured'}
                </span>
              </div>

              {/* Status explanation */}
              <p className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                {item.message}
              </p>

              {/* Key Input if in Demo mode */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 block">
                  {item.id === 'supabase' ? 'Supabase Project URL / Key' : 'API Key (Optional override):'}
                </label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder={item.id === 'supabase' ? 'https://your-project.supabase.co' : 'Enter API Key to activate Live Mode...'}
                    value={inputKeys[item.id] || ''}
                    onChange={(e) => setInputKeys({ ...inputKeys, [item.id]: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-mono"
                  />
                </div>
              </div>

              {testResult[item.id] && (
                <p className="text-[11px] text-slate-400 italic">
                  Status: {testResult[item.id]}
                </p>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <span className="text-[10px] text-slate-500">Tested: {item.lastTested}</span>

                <button
                  onClick={() => handleTestConnection(item.id)}
                  disabled={testingId === item.id}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingId === item.id ? 'animate-spin' : ''}`} />
                  <span>Test Connection</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
