import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

/**
 * Enterprise Portal Sign In component.
 */
const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Redirect authenticated user immediately
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (formData) => {
    setSubmitting(true);
    const result = await login(formData.email, formData.password);
    setSubmitting(false);

    if (result.success) {
      toast.success('Session started successfully');
      navigate('/dashboard', { replace: true });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 p-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-2xl">
        {/* Core Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-2xl border border-blue-600/20 dark:border-blue-400/10">
            ERP
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Portal Sign In</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Enterprise ERP Management System</p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-left">
          {/* Email input field */}
          <div>
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
              Corporate Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                {...register('email', { required: 'Corporate Email is required' })}
                placeholder="email@erp.com"
                className={`w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900/50 border rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password input field */}
          <div>
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
              Account Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', { required: 'Password is required' })}
                placeholder="••••••••"
                className={`w-full pl-9 pr-10 py-2.5 text-sm bg-white dark:bg-slate-900/50 border rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.password
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          {/* Submit Trigger */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 mt-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl transition-all duration-150 shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-40"
          >
            {submitting ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        {/* Help Info Seeder parameters */}
        <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl text-[11px] text-slate-400 dark:text-slate-500 leading-normal text-left">
          <p className="font-bold text-slate-500 dark:text-slate-400 mb-1">💡 Default Admin Login Credentials:</p>
          <p>
            Email: <span className="font-semibold text-slate-700 dark:text-slate-300">admin@erp.com</span>
          </p>
          <p>
            Password: <span className="font-semibold text-slate-700 dark:text-slate-300">adminpassword</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
