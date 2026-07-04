import React from 'react';

const Employees = () => {
  return (
    <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm text-left">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Employees Directory</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Manage employee records, assign department rosters, adjust base salaries, or manage roles.
      </p>
    </div>
  );
};

export default Employees;
