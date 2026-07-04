import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  ShieldCheck,
  Users,
  FolderTree,
  Clock,
  CalendarDays,
  CreditCard,
  Building2,
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleCTAClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const features = [
    {
      title: 'Employee Registry',
      desc: 'Administrative roster management, designations, salary parameters, and contact attributes.',
      icon: Users,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30',
    },
    {
      title: 'Department Structures',
      desc: 'Organizational division matrices, manager references, headcounts, and aggregate payroll analytics.',
      icon: FolderTree,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/30',
    },
    {
      title: 'Attendance Loggers',
      desc: 'Instant clock-in/out check-in logs, late flags threshold mappings, and shift hours calculators.',
      icon: Clock,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30',
    },
    {
      title: 'Leaves Self-Service',
      desc: 'Annual leaves quota checking, request workflow submissions, and approvals management.',
      icon: CalendarDays,
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30',
    },
    {
      title: 'Payroll Compiler',
      desc: 'Provident Fund (PF) allocations, tax adjustments, net allowances, and dynamic PDF payslips.',
      icon: CreditCard,
      color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/20 border-pink-100 dark:border-pink-900/30',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-200 flex flex-col justify-between relative overflow-hidden">
      {/* GLOW DECORATIONS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* STICKY GLASSMORPHIC NAVBAR */}
      <nav className="sticky top-0 z-40 w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-100 dark:border-slate-850/80 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-605 rounded-xl text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/10">
              ERP
            </div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-blue-600 to-indigo-650 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
              Enterprise ERP
            </span>
          </div>

          {/* Center Navigation Links (Hidden on small mobile) */}
          <div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-450 transition">Modules</a>
            <a href="#security" className="hover:text-blue-600 dark:hover:text-blue-450 transition">Security</a>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></span>
            <span className="text-[10px] text-green-500 flex items-center gap-1 font-extrabold lowercase">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
              sys online
            </span>
          </div>

          {/* Action trigger button */}
          <button
            onClick={handleCTAClick}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl transition shadow-md shadow-blue-500/10 active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            {isAuthenticated ? 'Dashboard' : 'Sign In'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="max-w-5xl mx-auto px-6 pt-24 pb-16 sm:pt-36 sm:pb-24 text-center flex-1 flex flex-col items-center justify-center z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/20 text-[10px] sm:text-xs font-bold text-blue-600 dark:text-blue-400 rounded-full border border-blue-200/50 dark:border-blue-900/30 mb-6">
          <ShieldCheck className="w-4 h-4" />
          Unified HR, Attendance & Payroll Management
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
          Manage Operations{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-450 dark:to-indigo-400">
            Intelligently
          </span>
        </h1>

        <p className="text-sm sm:text-lg text-slate-500 dark:text-slate-400 mt-6 max-w-2xl leading-relaxed">
          The all-in-one resource orchestrator. Keep track of employee records, log check-in shifts, manage leave allocations, and generate secure Payslip PDFs.
        </p>

        {/* Primary Call to Action Button */}
        <div className="mt-10">
          <button
            onClick={handleCTAClick}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition duration-150 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95 text-sm sm:text-base cursor-pointer"
          >
            {isAuthenticated ? 'Open Dashboard Panel' : 'Get Started with Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* FEATURE CARDS LIST */}
        <div id="features" className="mt-20 sm:mt-28 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl w-full text-left">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-3xl shadow-sm hover:shadow-md transition duration-200"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${feat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-450 dark:text-slate-400 mt-2 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full py-6 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-850">
        &copy; {new Date().getFullYear()} Enterprise ERP Management System. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;
