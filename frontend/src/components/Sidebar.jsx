import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FolderTree,
  Clock,
  CalendarDays,
  CreditCard,
  User,
  X,
} from 'lucide-react';

/**
 * Sidebar navigation component showing dynamic links based on user role permissions.
 * @param {boolean} isOpen - Determines whether the sidebar is visible on mobile overlay views.
 * @param {function} onClose - Triggers closing of mobile side navigation.
 */
const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  if (!user) return null;

  // Define general, shared links
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Admin', 'Manager', 'Employee'],
    },
    {
      name: 'Employees',
      path: '/employees',
      icon: Users,
      roles: ['Admin', 'Manager'],
    },
    {
      name: 'Departments',
      path: '/departments',
      icon: FolderTree,
      roles: ['Admin', 'Manager', 'Employee'],
    },
    {
      name: 'Attendance',
      path: '/attendance',
      icon: Clock,
      roles: ['Admin', 'Manager', 'Employee'],
    },
    {
      name: 'Leaves',
      path: '/leaves',
      icon: CalendarDays,
      roles: ['Admin', 'Manager', 'Employee'],
    },
    {
      name: 'Payroll',
      path: '/payroll',
      icon: CreditCard,
      roles: ['Admin', 'Manager', 'Employee'],
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: User,
      roles: ['Admin', 'Manager', 'Employee'],
    },
  ];

  // Filter routes based on user role
  const visibleItems = menuItems.filter((item) => item.roles.includes(user.role));

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150 ${
      isActive
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50'
    }`;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        ></div>
      )}

      {/* Main Navigation Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 transition-all duration-300 transform lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header Close */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700/50 lg:py-6">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-800 dark:text-white">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm">
              E
            </div>
            <span>Enterprise ERP</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 rounded-lg lg:hidden hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={linkClass}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Small Footer metadata */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-700/50">
          <div className="text-left">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              ERP Version
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">v1.0.0 (Production)</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
