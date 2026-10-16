import React from 'react';
import { LeadStatus } from '../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'cosmic';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-xs font-medium leading-normal' : 'px-3 py-1.5 text-xs font-semibold leading-normal';
  
  const variantClasses = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60',
    success: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/35',
    warning: 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/35',
    danger: 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/35',
    info: 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/35',
    purple: 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/35',
    cosmic: 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-400/35 shadow-sm'
  }[variant];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${sizeClasses} ${variantClasses} tracking-normal whitespace-nowrap`}>
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: LeadStatus }> = ({ status }) => {
  switch (status) {
    case 'New':
      return <Badge variant="info">New</Badge>;
    case 'Qualified':
      return <Badge variant="success">Qualified</Badge>;
    case 'Draft Ready':
      return <Badge variant="purple">Draft Ready</Badge>;
    case 'Awaiting Approval':
      return <Badge variant="warning">Awaiting Approval</Badge>;
    case 'Approved':
      return <Badge variant="cosmic">Approved</Badge>;
    case 'Sent':
      return <Badge variant="info">Sent</Badge>;
    case 'Replied':
      return <Badge variant="success">Replied</Badge>;
    case 'Follow-up Due':
      return <Badge variant="warning">Follow-up Due</Badge>;
    case 'Converted':
      return <Badge variant="success">★ Converted</Badge>;
    case 'Not Interested':
      return <Badge variant="default">Not Interested</Badge>;
    case 'Bounced':
      return <Badge variant="danger">Bounced</Badge>;
    case 'Unsubscribed':
      return <Badge variant="danger">Unsubscribed</Badge>;
    case 'Do Not Contact':
      return <Badge variant="danger">⛔ Do Not Contact</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};
