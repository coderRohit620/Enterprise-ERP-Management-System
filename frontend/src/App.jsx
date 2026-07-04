import React from 'react';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4">
      <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md border border-slate-100 dark:border-slate-700">
        <div className="w-16 h-16 bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-5 font-bold text-2xl">
          ERP
        </div>
        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
          Enterprise ERP
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
          React, Vite, and Tailwind CSS frontend dependencies and base templates compiled successfully. Ready for full dashboard module implementation.
        </p>
        <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-xl transition-all duration-150 shadow-lg shadow-blue-600/20 dark:shadow-blue-500/10 active:scale-95">
          Get Started
        </button>
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}

export default App;
// For future routing updates, we will wrap this with Router DOM components.
