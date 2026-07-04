import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable list pagination component.
 * @param {number} currentPage - Active page index.
 * @param {number} totalPages - Total pages.
 * @param {function} onPageChange - Callback when switching pages.
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700/50 sm:px-6 rounded-xl shadow-sm mt-4">
      {/* Mobile view simple buttons */}
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-all duration-150"
        >
          Previous
        </button>
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50 disabled:opacity-40 transition-all duration-150"
        >
          Next
        </button>
      </div>

      {/* Desktop view paginator */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Page <span className="text-slate-800 dark:text-white">{currentPage}</span> of{' '}
            <span className="text-slate-800 dark:text-white">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px" aria-label="Pagination">
            {/* Prev Trigger */}
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="relative inline-flex items-center px-2 py-2 rounded-l-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-30 transition-all duration-150"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Page number buttons */}
            {pageNumbers.map((num) => (
              <button
                key={num}
                onClick={() => onPageChange(num)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all duration-150 ${
                  currentPage === num
                    ? 'z-10 bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                {num}
              </button>
            ))}

            {/* Next Trigger */}
            <button
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="relative inline-flex items-center px-2 py-2 rounded-r-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-30 transition-all duration-150"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
