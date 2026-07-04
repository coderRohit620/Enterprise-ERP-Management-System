import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import {
  FolderTree,
  Plus,
  Trash2,
  Users,
  CreditCard,
  UserCheck,
  BarChart2,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const Departments = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState(null);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const isAdmin = user?.role === 'Admin';
  const isManager = user?.role === 'Manager';
  const showAnalytics = isAdmin || isManager;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Load departments, stats, and eligible managers
  const loadData = async () => {
    setLoading(true);
    try {
      const deptRes = await api.get('/departments');
      setDepartments(deptRes.data);

      if (showAnalytics) {
        const statsRes = await api.get('/departments/stats');
        setStats(statsRes.data);
      }

      if (isAdmin) {
        // Fetch Admin / Manager users to populate the department manager dropdown
        const empRes = await api.get('/employees?limit=100');
        const eligible = empRes.data.employees.filter(
          (emp) => emp.user_id.role === 'Manager' || emp.user_id.role === 'Admin'
        );
        setManagers(eligible);
      }
    } catch (error) {
      toast.error('Failed to load department records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle department creation (Admin only)
  const onCreateSubmit = async (data) => {
    setActionLoading(true);
    try {
      const payload = {
        department_name: data.department_name,
        manager_id: data.manager_id || null,
      };

      await api.post('/departments', payload);
      toast.success('Department created successfully');
      setCreateModalOpen(false);
      reset();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create department');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle department deletion (Admin only)
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department? Employees inside this department will be reset to Unassigned.')) {
      return;
    }

    setActionLoading(true);
    try {
      await api.delete(`/departments/${id}`);
      toast.success('Department deleted successfully');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete department');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  // Calculate quick summary metrics for stats cards
  const totalDepartments = departments.length;
  const totalHeadcount = departments.reduce((sum, d) => sum + (d.employee_count || 0), 0);
  const totalMonthlyPayroll = stats?.stats?.reduce((sum, s) => sum + (s.totalPayroll || 0), 0) || 0;

  return (
    <div className="space-y-6 text-left">
      {/* Header section with Create triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
            Departments Panel
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isAdmin ? 'Create, monitor, and manage department resources and budgets.' : 'Review organization department listings and members.'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl transition shadow-md shadow-blue-500/10 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Department
          </button>
        )}
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex items-center p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm">
          <div className="p-3 mr-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Departments</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white leading-none mt-1">{totalDepartments}</p>
          </div>
        </div>

        <div className="flex items-center p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm">
          <div className="p-3 mr-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Overall Headcount</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white leading-none mt-1">{totalHeadcount}</p>
          </div>
        </div>

        <div className="flex items-center p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm">
          <div className="p-3 mr-4 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Monthly Budget Cost</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white leading-none mt-1">${totalMonthlyPayroll.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* ANALYTICS GRAPH (ADMIN & MANAGER ONLY) */}
      {showAnalytics && stats?.stats?.length > 0 && (
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Department Payroll Budgets Comparison
            </h3>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.stats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="departmentName" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.03)' }} />
                <Bar dataKey="totalPayroll" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Payroll Cost ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* DEPARTMENTS ROSTER LIST TABLE */}
      <DataTable headers={['Department Name', 'Assigned Manager', 'Headcount Count', 'Actions']}>
        {departments.length > 0 ? (
          departments.map((dept) => (
            <tr key={dept._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 text-xs sm:text-sm">
              <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                {dept.department_name}
              </td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                {dept.manager_id ? (
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>{dept.manager_id.name}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">No Manager Assigned</span>
                )}
              </td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-semibold">
                {dept.employee_count || 0} Members
              </td>
              <td className="px-6 py-4">
                {isAdmin ? (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleDelete(dept._id)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                    title="Delete Department"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 italic">Access Restricted</span>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={4} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">
              No departments found.
            </td>
          </tr>
        )}
      </DataTable>

      {/* CREATE MODAL (ADMIN ONLY) */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Department">
        <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4 text-left">
          <div>
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
              Department Name
            </label>
            <input
              type="text"
              {...register('department_name', { required: 'Department Name is required' })}
              placeholder="e.g. Sales, Marketing, Engineering"
              className={`w-full px-4 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white ${errors.department_name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                }`}
            />
            {errors.department_name && (
              <p className="text-xs text-red-500 mt-1">{errors.department_name.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
              Assign Department Manager
            </label>
            <select
              {...register('manager_id')}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
            >
              <option value="">-- Leave Unassigned --</option>
              {managers.map((mgr) => (
                <option key={mgr._id} value={mgr.user_id._id}>
                  {mgr.user_id.name} ({mgr.employee_code} - {mgr.designation})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5"
          >
            {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Department
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Departments;
