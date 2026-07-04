import React from 'react';

/**
 * Reusable DataTable container component.
 * @param {Array<string>} headers - Column titles.
 * @param {boolean} loading - Displays inline table spinner when active.
 * @param {React.ReactNode} children - Table row items.
 */
const DataTable = ({ headers, loading, children }) => {
  return (
    <div className="w-full overflow-hidden bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm transition-colors duration-200">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {loading ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="text-xs font-semibold uppercase tracking-wider animate-pulse">
                      Fetching Records
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
