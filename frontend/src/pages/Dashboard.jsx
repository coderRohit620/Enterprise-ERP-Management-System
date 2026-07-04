import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';
import {
  Users,
  FolderTree,
  CalendarDays,
  Clock,
  CreditCard,
  CheckCircle,
  Play,
  Square,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);

  // Fetch dashboard stats from backend
  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setData(res.data);
    } catch (error) {
      toast.error('Failed to retrieve dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Clock In Action
  const handleClockIn = async () => {
    setClockLoading(true);
    try {
      const res = await api.post('/attendance/checkin');
      toast.success(res.data.message || 'Clocked in successfully');
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Clock-in failed');
    } finally {
      setClockLoading(false);
    }
  };

  // Clock Out Action
  const handleClockOut = async () => {
    setClockLoading(true);
    try {
      const res = await api.post('/attendance/checkout');
      toast.success(res.data.message || 'Clocked out successfully');
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Clock-out failed');
    } finally {
      setClockLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!data) {
    return (
      <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Unable to Load Dashboard</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please try again later.</p>
      </div>
    );
  }

  // Styles for leaves status badges
  const statusStyles = {
    Pending: 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 border border-orange-200 dark:border-orange-900/30',
    Approved: 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/30',
    Rejected: 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30',
    Cancelled: 'bg-slate-50 text-slate-500 dark:bg-slate-950/20 dark:text-slate-400 border border-slate-200 dark:border-slate-850/30',
  };

  // Styles for attendance status badges
  const attendanceStyles = {
    Present: 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/30',
    Late: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/30',
    Absent: 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30',
    'Half Day': 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 border border-orange-200 dark:border-orange-900/30',
  };

  const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Welcome Message Banner */}
      <div className="text-left bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 p-6 rounded-2xl text-white shadow-md shadow-blue-500/10">
        <h1 className="text-xl sm:text-2xl font-bold">Welcome back, {user.name}!</h1>
        <p className="text-xs sm:text-sm text-blue-100 mt-1">
          {data.role === 'Admin' && 'System Admin Controls Activated. Monitor operations, headcounts, and payroll budgets.'}
          {data.role === 'Manager' && `Department Manager Controls Activated. Overseeing ${data.department_name || 'Department'}.`}
          {data.role === 'Employee' && 'Self-service panel. Clock in attendance, track remaining leaves, or download payslips.'}
        </p>
      </div>

      {/* RENDER STATS AND CARD GROUPS */}
      {data.role === 'Admin' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Employees" value={data.stats.totalEmployees} icon={Users} color="blue" />
          <StatCard title="Total Departments" value={data.stats.totalDepartments} icon={FolderTree} color="purple" />
          <StatCard title="Pending Leaves" value={data.stats.pendingLeaves} icon={CalendarDays} color="orange" />
          <StatCard title="Present Today" value={data.stats.presentToday} icon={Clock} color="green" />
        </div>
      )}

      {data.role === 'Manager' && (
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard title="Department Members" value={data.stats.totalEmployees} icon={Users} color="blue" />
          <StatCard title="Pending Leave Requests" value={data.stats.pendingLeaves} icon={CalendarDays} color="orange" />
          <StatCard title="Members Present Today" value={data.stats.presentToday} icon={Clock} color="green" />
        </div>
      )}

      {data.role === 'Employee' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Basic Salary" value={`$${data.basic_salary.toLocaleString()}`} icon={CreditCard} color="green" />
          <StatCard title="Remaining Leaves" value={data.stats.remainingLeaves} icon={CalendarDays} color="purple" />
          <StatCard title="Present Days (Month)" value={data.stats.presentDays} icon={CheckCircle} color="blue" />
          <StatCard title="Late Checkins (Month)" value={data.stats.lateDays} icon={Clock} color="orange" />
        </div>
      )}

      {/* INTERACTIVE COMPONENT GRID */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Admin Dashboard: Graphs */}
        {data.role === 'Admin' && (
          <>
            {/* Department headcount & budget graph */}
            <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm lg:col-span-2 text-left flex flex-col">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">
                Department Headcount & Monthly Payroll
              </h3>
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.graphs.departmentGraphData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.04)' }} />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Bar yAxisId="left" dataKey="headcount" fill="#3b82f6" name="Headcount" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="budget" fill="#a855f7" name="Monthly Payroll ($)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Attendance Status Pie Chart */}
            <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm text-left flex flex-col">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">
                Attendance Distribution (30 Days)
              </h3>
              <div className="flex-1 min-h-[260px] flex items-center justify-center">
                {data.graphs.attendanceGraphData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.graphs.attendanceGraphData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="count"
                        nameKey="status"
                      >
                        {data.graphs.attendanceGraphData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500">No attendance logs in the last 30 days.</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Manager Dashboard: Team details placeholder / grids */}
        {data.role === 'Manager' && (
          <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm lg:col-span-3 text-left">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Manager Operations Overview</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Select <span className="font-semibold">Employees</span> to manage headcount or assign new members. Under <span className="font-semibold">Leaves</span>, you can approve or reject pending leave requests submitted by your team.
            </p>
          </div>
        )}

        {/* Employee Dashboard: Clock In/Out Actions */}
        {data.role === 'Employee' && (
          <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm lg:col-span-3 text-left">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2">Attendance Shift Actions</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
              Track your shift today. Check-in must be completed by <span className="font-semibold text-slate-500">09:30 AM</span> to prevent being flagged as Late.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl">
              <div className="flex-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Today's Status
                </span>
                <span className="text-lg font-bold text-slate-800 dark:text-white mt-1 block">
                  {data.clockStatus.status === 'not_clocked_in' && 'Not Checked In'}
                  {data.clockStatus.status === 'clocked_out' && data.clockStatus.canClockOut && 'Currently Clocked In'}
                  {data.clockStatus.status === 'clocked_out' && !data.clockStatus.canClockOut && 'Shift Finished'}
                </span>
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  {data.clockStatus.clocked_in && (
                    <p>
                      Clocked In: <span className="font-medium text-slate-700 dark:text-slate-200">{new Date(data.clockStatus.clocked_in).toLocaleTimeString()}</span>
                    </p>
                  )}
                  {data.clockStatus.clocked_out && (
                    <p>
                      Clocked Out: <span className="font-medium text-slate-700 dark:text-slate-200">{new Date(data.clockStatus.clocked_out).toLocaleTimeString()}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  disabled={!data.clockStatus.canClockIn || clockLoading}
                  onClick={handleClockIn}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-150 shadow-md shadow-green-500/10 disabled:opacity-40 active:scale-95"
                >
                  <Play className="w-4 h-4" />
                  Clock In
                </button>
                <button
                  disabled={!data.clockStatus.canClockOut || clockLoading}
                  onClick={handleClockOut}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-150 shadow-md shadow-red-500/10 disabled:opacity-40 active:scale-95"
                >
                  <Square className="w-4 h-4" />
                  Clock Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RECENT logs logs for Admins & Managers */}
      {(data.role === 'Admin' || data.role === 'Manager') && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent leave requests */}
          <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm text-left">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Recent Leave Requests</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-medium">
                    <th className="pb-3 text-left font-semibold">Employee</th>
                    <th className="pb-3 text-left font-semibold">Type</th>
                    <th className="pb-3 text-left font-semibold">Days</th>
                    <th className="pb-3 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {data.recent.recentLeaves.length > 0 ? (
                    data.recent.recentLeaves.map((leave) => {
                      const diffTime = Math.abs(new Date(leave.end_date) - new Date(leave.start_date));
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                      return (
                        <tr key={leave._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                          <td className="py-3.5">
                            <p className="font-semibold text-slate-700 dark:text-slate-200">
                              {leave.employee_id?.user_id?.name || 'Unknown'}
                            </p>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                              {leave.employee_id?.employee_code}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-600 dark:text-slate-400 font-medium">{leave.type}</td>
                          <td className="py-3.5 text-slate-600 dark:text-slate-400 font-medium">{diffDays} Days</td>
                          <td className="py-3.5 text-right">
                            <span className={`px-2 py-1 text-[10px] font-bold rounded-lg ${statusStyles[leave.status] || ''}`}>
                              {leave.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 dark:text-slate-500">
                        No recent leave requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent check ins */}
          <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm text-left">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Today's Checkins</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-medium">
                    <th className="pb-3 text-left font-semibold">Employee</th>
                    <th className="pb-3 text-left font-semibold">Time</th>
                    <th className="pb-3 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {data.recent.recentAttendance.length > 0 ? (
                    data.recent.recentAttendance.map((attendance) => (
                      <tr key={attendance._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                        <td className="py-3.5">
                          <p className="font-semibold text-slate-700 dark:text-slate-200">
                            {attendance.employee_id?.user_id?.name || 'Unknown'}
                          </p>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                            {attendance.employee_id?.employee_code}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-600 dark:text-slate-400 font-medium">
                          {new Date(attendance.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5 text-right">
                          <span className={`px-2 py-1 text-[10px] font-bold rounded-lg ${attendanceStyles[attendance.status] || ''}`}>
                            {attendance.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400 dark:text-slate-500">
                        No employees checked in today yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
