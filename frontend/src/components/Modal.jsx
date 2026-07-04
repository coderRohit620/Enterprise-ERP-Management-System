import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable dialog modal box component.
 * @param {boolean} isOpen - Determines whether the modal is visible.
 * @param {function} onClose - Callback triggered to close the modal.
 * @param {string} title - Header text.
 * @param {React.ReactNode} children - Contents.
 */
const Modal = ({ isOpen, onClose, title, children }) => {
  // Capture escape keys and lock body scrollbars while open
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-200">
      {/* Modal Dialog Card */}
      <div className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden transform transition-all max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex-shrink-0">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content body (Scrollable if overflowing) */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
