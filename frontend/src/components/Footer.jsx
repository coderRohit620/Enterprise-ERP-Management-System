import React from 'react';

/**
 * Standard page footer component.
 */
const Footer = () => {
  return (
    <footer className="w-full py-5 px-6 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-700/30 transition-colors duration-200">
      &copy; {new Date().getFullYear()} Enterprise ERP Management System. All rights reserved.
    </footer>
  );
};

export default Footer;
