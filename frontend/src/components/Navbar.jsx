import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, Menu } from 'lucide-react';

/**
 * Top navigation header component with glassmorphism design.
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

  // Determine role-based badge design
  const roleBadges = {
    Admin: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/30',
    Manager: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/30',
    Employee: 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-850 border-slate-200 dark:border-slate-800',
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 transition-all duration-200 shadow-sm">
      {/* Mobile Toggle & Brand logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden focus:outline-none transition active:scale-95"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="font-black text-lg text-slate-800 dark:text-white hidden sm:block tracking-tight">
          Enterprise <span className="bg-gradient-to-r from-blue-600 to-indigo-605 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">ERP</span>
        </div>
      </div>

      {/* Right Side Options: Theme, Profile, and Logout */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* Vertical Divider */}
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-850"></div>

        {/* User Account Info */}
        {user && (
          <div className="flex items-center gap-3">
            {/* Pulsing Avatar Status */}
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold uppercase text-sm shadow-md shadow-blue-500/10">
                {user.name.charAt(0)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white leading-tight">
                {user.name}
              </span>
              <span className={`inline-flex items-center w-fit px-1.5 py-0.5 mt-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-md border ${roleBadges[user.role] || ''}`}>
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* Logout Trigger */}
        <button
          onClick={logout}
          className="p-2.5 ml-1 rounded-xl text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition active:scale-95"
          title="Logout"
        >
          <LogOut className="w-4.5 h-4.5" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
