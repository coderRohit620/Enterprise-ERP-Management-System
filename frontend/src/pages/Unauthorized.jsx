import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

/**
 * Access Denied screen layout.
 */
const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 p-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-2xl text-center">
        <ShieldAlert className="w-14 h-14 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Access Denied</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">
          Your account role does not have the required permissions to access this page.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center justify-center gap-2 mx-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-xl transition-all duration-150 active:scale-95 shadow-md shadow-blue-500/10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
