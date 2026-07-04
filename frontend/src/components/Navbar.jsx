import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, Menu, User } from 'lucide-react';

/**
 * Top navigation header component.
 * @param {function} onToggleSidebar - Callback to trigger mobile sidebar collapse/expansion.
 */
const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  // Sync theme changes with CSS dark class and localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 transition-colors duration-200 shadow-sm">
      {/* Mobile Toggle & Brand */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 lg:hidden focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="font-bold text-lg text-slate-800 dark:text-white hidden sm:block">
          Enterprise <span className="text-blue-600 dark:text-blue-400">ERP</span>
        </div>
      </div>

      {/* Right Side Options: Theme, Profile, and Logout */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-150 active:scale-95"
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Vertical Divider */}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>

        {/* User Quick Info */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold uppercase text-sm border border-blue-600/20 dark:border-blue-400/10">
              {user.name.charAt(0)}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                {user.name}
              </span>
              <span className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase leading-tight">
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* Logout Trigger */}
        <button
          onClick={logout}
          className="p-2 ml-1 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-150 active:scale-95"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
