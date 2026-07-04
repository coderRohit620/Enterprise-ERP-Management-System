import React from 'react';

/**
 * Reusable statistics metric card component.
 * @param {string} title - Label.
 * @param {string|number} value - Stat value.
 * @param {React.Component} icon - Lucide React Icon.
 * @param {string} color - The theme color ('blue', 'green', 'purple', 'orange', 'red').
 */
const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const themeMap = {
    blue: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30',
    green: 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30',
    purple: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30',
    orange: 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/30',
    red: 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30',
  };

  const selectedTheme = themeMap[color] || themeMap.blue;
  const classes = selectedTheme.split(' ');

  return (
    <div className="flex items-center p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.01]">
      <div className={`p-3.5 mr-4 rounded-xl border ${classes[0]} ${classes[1]} ${classes[2]} ${classes[3]}`}>
        <Icon className="w-6 h-6 flex-shrink-0" />
      </div>
      <div className="text-left">
        <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
          {title}
        </p>
        <p className="text-2xl font-bold text-slate-800 dark:text-white leading-none">
          {value}
        </p>
      </div>
    </div>
  );
};

export default StatCard;
