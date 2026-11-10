import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '2xl'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl'
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full ${maxWidthClass} bg-white dark:bg-[#1e1e1e] border border-neutral-200 dark:border-white/15 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] max-h-[90dvh] overflow-hidden`}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-200 dark:border-white/10">
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white break-words">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-neutral-500 dark:text-[#9e9e9e] mt-0.5 break-words">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 dark:text-[#9e9e9e] hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#2f2f2f] rounded-lg transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
