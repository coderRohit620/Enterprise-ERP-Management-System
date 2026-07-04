import React, { useState } from 'react';
import { Search } from 'lucide-react';

/**
 * Reusable SearchBar form component.
 * @param {function} onSearch - Callback triggered on search submit.
 * @param {string} placeholder - Placeholder text.
 */
const SearchBar = ({ onSearch, placeholder = 'Search...' }) => {
  const [keyword, setKeyword] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSearch(keyword.trim());
  };

  return (
    <form onSubmit={handleFormSubmit} className="flex items-center w-full max-w-sm gap-2">
      <div className="relative flex-1">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-slate-500">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl transition-all duration-150 shadow-md shadow-blue-500/10 active:scale-95"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
