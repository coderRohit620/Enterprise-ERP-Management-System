import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { Clock, Filter } from 'lucide-react';

const Attendance = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');

  const isEmployee = user?.role === 'Employee';
  const showFilters = user?.role === 'Admin' || user?.role === 'Manager';

  // Load attendance logs
  const loadLogs = async () => {
    setLoading(true);
    try {
      let query = `?page=${page}&limit=10`;
      if (search && showFilters) query += `&search=${encodeURIComponent(search)}`;
      if (status) query += `&status=${status}`;
      if (date) query += `&date=${date}`;

      const res = await api.get(`/attendance${query}`);
      setLogs(res.data.logs);
      setTotalPages(res.data.pages || 1);
    } catch (error) {
      toast.error('Failed to load attendance logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, status, date]);

  // Handle keyword searching trigger
  const handleSearchSubmit = (keyword) => {
    setSearch(keyword);
    setPage(1);
    loadLogs();
  };

  // Styles for status badges
  const statusStyles = {
    Present: 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/30',
    Late: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/30',
    Absent: 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30',
    'Half Day': 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 border border-orange-200 dark:border-orange-900/30',
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header section */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Attendance Logs
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {isEmployee ? 'Review your personal checkin history logs.' : 'Monitor organization attendance checkins and late records.'}
        </p>
      </div>

      {/* FILTERS TOOLBAR (ADMIN/MANAGER ONLY) */}
      {showFilters && (
        <div className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <SearchBar onSearch={handleSearchSubmit} placeholder="Search by name or code..." />

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent focus:outline-none text-slate-750 dark:text-slate-350 cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Half Day">Half Day</option>
                <option value="Absent">Absent</option>
              </select>
            </div>

            {/* Date Picker Filter */}
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* DATA LOGS TABLE */}
      {loading ? (
        <Loader />
      ) : (
        <>
          <DataTable
            headers={
              showFilters
                ? ['Employee Details', 'Date', 'Clock In', 'Clock Out', 'Duration (Hrs)', 'Status']
                : ['Date', 'Clock In', 'Clock Out', 'Duration (Hrs)', 'Status']
            }
          >
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 text-xs sm:text-sm">
                  {showFilters && (
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {log.employee_id?.user_id?.name || 'Unknown'}
                      </p>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        {log.employee_id?.employee_code || 'N/A'}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">
                    {new Date(log.date + 'T00:00:00').toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {log.clocked_in ? new Date(log.clocked_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {log.clocked_out ? new Date(log.clocked_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="px-6 py-4 text-slate-650 dark:text-slate-300 font-bold">
                    {log.work_hours !== undefined ? `${log.work_hours.toFixed(1)} Hrs` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-lg border ${statusStyles[log.status] || ''}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={showFilters ? 6 : 5} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">
                  No attendance logs found.
                </td>
              </tr>
            )}
          </DataTable>

          {/* List pagination controls */}
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </>
      )}
    </div>
  );
};

export default Attendance;
