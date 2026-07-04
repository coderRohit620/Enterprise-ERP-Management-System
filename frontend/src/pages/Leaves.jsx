import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { CalendarDays, Plus, Check, X, Ban, Loader2 } from 'lucide-react';

const Leaves = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const isEmployee = user?.role === 'Employee';
  const showApprovals = user?.role === 'Admin' || user?.role === 'Manager';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Load leave list and balances
  const loadData = async () => {
    setLoading(true);
    try {
      const listRes = await api.get('/leaves');
      setLeaves(listRes.data);

      if (isEmployee) {
        const balRes = await api.get('/leaves/balance');
        setBalances(balRes.data.balances);
      }
    } catch (error) {
      toast.error('Failed to load leave records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle leave application submit (Employee)
  const onApplySubmit = async (data) => {
    setActionLoading(true);
    try {
      await api.post('/leaves', {
        type: data.type,
        start_date: data.start_date,
        end_date: data.end_date,
        reason: data.reason,
      });
      toast.success('Leave application submitted successfully');
      setApplyModalOpen(false);
      reset();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to apply for leave');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle leave cancellation (Employee on pending leaves)
  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
    setActionLoading(true);
    try {
      await api.put(`/leaves/${id}/cancel`);
      toast.success('Leave request cancelled');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel request');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle leave approval (Admin & Manager)
  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await api.put(`/leaves/${id}/approve`);
      toast.success('Leave request approved');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve request');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle leave rejection (Admin & Manager)
  const handleReject = async (id) => {
    const reasonPrompt = window.prompt('Provide rejection comment (optional):');
    if (reasonPrompt === null) return; // user cancelled prompt

    setActionLoading(true);
    try {
      await api.put(`/leaves/${id}/reject`, { comment: reasonPrompt });
      toast.success('Leave request rejected');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  // Styles for badges
  const statusStyles = {
    Pending: 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 border border-orange-200 dark:border-orange-900/30',
    Approved: 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/30',
    Rejected: 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30',
    Cancelled: 'bg-slate-50 text-slate-500 dark:bg-slate-900/10 dark:text-slate-400 border border-slate-200 dark:border-slate-800',
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header and buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
            Leave Management Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isEmployee ? 'Track your leave balances, submit new requests, or cancel applications.' : 'Review and approve leave request applications submitted by staff.'}
          </p>
        </div>

        {isEmployee && (
          <button
            onClick={() => setApplyModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl transition shadow-md shadow-blue-500/10 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Apply For Leave
          </button>
        )}
      </div>

      {/* BALANCES BREAKDOWN CARDS (EMPLOYEE ONLY) */}
      {isEmployee && balances && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Object.keys(balances).map((key) => (
            <div key={key} className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {key} Leave Remaining
              </span>
              <p className="text-2xl font-bold text-slate-700 dark:text-white mt-1">
                {balances[key].remaining} <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">/ {balances[key].limit} Days</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* LEAVES LOG LISTING */}
      <DataTable
        headers={
          showApprovals
            ? ['Employee Details', 'Leave Type', 'Start/End Date', 'Days', 'Reason', 'Status', 'Actions']
            : ['Leave Type', 'Start/End Date', 'Days', 'Reason', 'Status', 'Actions']
        }
      >
        {leaves.length > 0 ? (
          leaves.map((leave) => {
            const diffTime = Math.abs(new Date(leave.end_date) - new Date(leave.start_date));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            return (
              <tr key={leave._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 text-xs sm:text-sm">
                {showApprovals && (
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {leave.employee_id?.user_id?.name || 'Unknown'}
                    </p>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {leave.employee_id?.employee_code || 'N/A'}
                    </span>
                  </td>
                )}
                <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-450">{leave.type}</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                  {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-bold">{diffDays} Days</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-450 max-w-[200px] truncate" title={leave.reason}>
                  {leave.reason}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-lg border ${statusStyles[leave.status] || ''}`}>
                    {leave.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {isEmployee && leave.status === 'Pending' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleCancel(leave._id)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                      title="Cancel Request"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                  {showApprovals && leave.status === 'Pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        disabled={actionLoading}
                        onClick={() => handleApprove(leave._id)}
                        className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg transition"
                        title="Approve Request"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleReject(leave._id)}
                        className="p-1 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                        title="Reject Request"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {leave.status !== 'Pending' && <span className="text-xs text-slate-400 italic">None</span>}
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan={showApprovals ? 7 : 6} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">
              No leave requests found.
            </td>
          </tr>
        )}
      </DataTable>

      {/* APPLY LEAVE MODAL (EMPLOYEE ONLY) */}
      <Modal isOpen={applyModalOpen} onClose={() => setApplyModalOpen(false)} title="Apply For Leave">
        <form onSubmit={handleSubmit(onApplySubmit)} className="space-y-4 text-left">
          <div>
            <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase block mb-1">
              Leave Type
            </label>
            <select
              {...register('type', { required: 'Leave type is required' })}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
            >
              <option value="Casual">Casual Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Maternity">Maternity Leave</option>
              <option value="Paternity">Paternity Leave</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase block mb-1">
                Start Date
              </label>
              <input
                type="date"
                {...register('start_date', { required: 'Start date is required' })}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase block mb-1">
                End Date
              </label>
              <input
                type="date"
                {...register('end_date', { required: 'End date is required' })}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-455 dark:text-slate-500 uppercase block mb-1">
              Detailed Reason
            </label>
            <textarea
              {...register('reason', { required: 'Reason is required' })}
              rows="3"
              placeholder="Provide a detailed explanation for your leave application..."
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
            ></textarea>
            {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason.message}</p>}
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-40"
          >
            {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit Application
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Leaves;
