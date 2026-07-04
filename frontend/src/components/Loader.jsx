import React from 'react';

/**
 * Reusable animated spinner loader component.
 * @param {boolean} fullScreen - Centers the spinner to take up the full browser screen.
 */
const Loader = ({ fullScreen = false }) => {
  const containerClass = fullScreen
    ? 'flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200'
    : 'flex items-center justify-center p-6';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 animate-pulse uppercase">
          Loading ERP
        </p>
      </div>
    </div>
  );
};

export default Loader;
