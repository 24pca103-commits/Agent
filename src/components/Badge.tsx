import React from 'react';
import { LeadStatus } from '../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'cosmic';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'sm' }) => {
  const sizeClasses = size === 'sm'
    ? 'px-2.5 py-0.5 text-[11px] font-medium leading-normal'
    : 'px-3 py-1 text-xs font-semibold leading-normal';

  const variantClasses = {
    default: 'bg-neutral-100 dark:bg-[#2f2f2f] text-neutral-700 dark:text-[#d4d4d4] border border-neutral-200 dark:border-white/10',
    success: 'bg-emerald-50 dark:bg-[#10a37f]/15 text-emerald-700 dark:text-[#34d399] border border-emerald-200 dark:border-[#10a37f]/30',
    warning: 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30',
    danger: 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30',
    info: 'bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-[#ececec] border border-neutral-200 dark:border-white/15',
    purple: 'bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-[#ececec] border border-neutral-200 dark:border-white/15',
    cosmic: 'bg-neutral-900 dark:bg-white/15 text-white dark:text-white border border-neutral-900 dark:border-white/20'
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
      return <Badge variant="default">Draft Ready</Badge>;
    case 'Awaiting Approval':
      return <Badge variant="warning">Awaiting Approval</Badge>;
    case 'Approved':
      return <Badge variant="success">Approved</Badge>;
    case 'Sent':
      return <Badge variant="success">Sent</Badge>;
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
      return <Badge variant="danger">Do Not Contact</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};
