import React, { useState } from 'react';
import {
  CalendarClock,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  MoreVertical,
  Search,
  Check
} from 'lucide-react';
import { FollowUpTask, Lead } from '../types';
import { Modal } from '../components/Modal';

interface FollowUpManagerProps {
  leads: Lead[];
  onOpenDraftPitch: (lead: Lead) => void;
}

export const FollowUpManager: React.FC<FollowUpManagerProps> = ({
  leads,
  onOpenDraftPitch
}) => {
  const [tasks, setTasks] = useState<FollowUpTask[]>([
    {
      id: 'task-001',
      leadId: 'lead-dg-001',
      leadName: 'Alistair Vance',
      companyName: 'Apex Freight Global UK Ltd',
      email: 'alistair.vance@apexfreightglobal.co.uk',
      lastEmailSentDate: '2026-10-11T10:00:00Z',
      dueDate: new Date().toISOString().split('T')[0], // Due Today
      status: 'Due Today',
      cadenceDay: 3,
      suggestedDraftSubject: 'Quick check-in regarding freight manifest processing for Apex Freight',
      suggestedDraftBody: `Hi Alistair,\n\nFollowing up on my note earlier this week regarding how DataGalactic helps UK logistics teams manage shipping documentation with 99.8% precision.\n\nDid you have a brief moment to review? Happy to share a quick 1-page overview of our operations workflow.\n\nBest regards,\nRisona - DataGalactic`
    },
    {
      id: 'task-002',
      leadId: 'lead-dg-002',
      leadName: 'Sarah Jenkins',
      companyName: 'CloudSphere Analytics Inc',
      email: 's.jenkins@cloudsphereanalytics.io',
      lastEmailSentDate: '2026-10-06T10:00:00Z',
      dueDate: '2026-10-13', // Overdue
      status: 'Overdue',
      cadenceDay: 7,
      suggestedDraftSubject: 'Resource for CloudSphere Analytics CRM cleaning',
      suggestedDraftBody: `Hi Sarah,\n\nI know scaling SaaS ops keeps schedules packed. Just wanted to see if reducing CRM duplicate records was still on your radar for this quarter.\n\nBest regards,\nRisona - DataGalactic`
    },
    {
      id: 'task-003',
      leadId: 'lead-dg-004',
      leadName: 'Charlotte Hemsworth',
      companyName: 'Veritas Talent Partners Ltd',
      email: 'charlotte@veritastalent.co.uk',
      lastEmailSentDate: '2026-10-14T12:00:00Z',
      dueDate: '2026-10-17', // Upcoming
      status: 'Upcoming',
      cadenceDay: 3
    }
  ]);

  const [activeTab, setActiveTab] = useState<'All' | 'Due Today' | 'Overdue' | 'Upcoming'>('All');
  const [inspectingTask, setInspectingTask] = useState<FollowUpTask | null>(null);

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'All') return true;
    return t.status === activeTab;
  });

  const handleMarkCompleted = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'Completed' } : t));
  };

  const handleSnooze = (taskId: string, days: number) => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + days);
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t,
      status: 'Upcoming',
      dueDate: nextDate.toISOString().split('T')[0]
    } : t));
    setInspectingTask(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Sales Follow-up Manager & Cadence</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Track follow-up intervals (Day 3 & Day 7), generate context-aware follow-up drafts, and keep prospects engaged.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {(['All', 'Due Today', 'Overdue', 'Upcoming'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => {
          const isOverdue = task.status === 'Overdue';
          const isDueToday = task.status === 'Due Today';

          return (
            <div
              key={task.id}
              className={`galaxy-card p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                isOverdue
                  ? 'border-rose-500/30 bg-rose-950/10'
                  : isDueToday
                  ? 'border-amber-500/30 bg-amber-950/10'
                  : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isOverdue
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : isDueToday
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {task.status} (Day {task.cadenceDay})
                  </span>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due: {task.dueDate}
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className="text-sm font-bold text-white">{task.leadName}</h4>
                  <p className="text-xs text-indigo-300">{task.companyName}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{task.email}</p>
                </div>

                {task.suggestedDraftSubject && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-semibold">Suggested Subject:</span>
                    <p className="text-[11px] text-slate-200 truncate">{task.suggestedDraftSubject}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleMarkCompleted(task.id)}
                  className="p-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/20 text-xs flex items-center gap-1"
                  title="Mark Completed"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Done</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleSnooze(task.id, 3)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                  >
                    Snooze +3d
                  </button>

                  <button
                    onClick={() => setInspectingTask(task)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                  >
                    Draft Mail
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Follow-up Mail Draft Preview Modal */}
      {inspectingTask && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingTask(null)}
          title={`Follow-up Outreach: ${inspectingTask.companyName}`}
          subtitle={`To: ${inspectingTask.leadName} (${inspectingTask.email})`}
        >
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Subject:</label>
              <input
                type="text"
                defaultValue={inspectingTask.suggestedDraftSubject}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Message:</label>
              <textarea
                rows={8}
                defaultValue={inspectingTask.suggestedDraftBody}
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-sans leading-relaxed"
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <button
                onClick={() => handleSnooze(inspectingTask.id, 7)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Reschedule to Next Week
              </button>

              <button
                onClick={() => {
                  handleMarkCompleted(inspectingTask.id);
                  setInspectingTask(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Queue Follow-up for Approval
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
