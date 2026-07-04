import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { CreditCard, Download, Plus, Loader2 } from 'lucide-react';

const Payroll = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);

  // Pagination & filter states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const isAdmin = user?.role === 'Admin';
  const showFilters = user?.role === 'Admin' || user?.role === 'Manager';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      bonus: 0,
      deduction: 0,
    },
  });

  // Load payroll history and employees list
  const loadData = async () => {
    setLoading(true);
    try {
      let query = `?page=${page}&limit=10`;
      if (search && showFilters) query += `&search=${encodeURIComponent(search)}`;
      if (month) query += `&month=${month}`;
      if (year) query += `&year=${year}`;

      const res = await api.get(`/payroll${query}`);
      setLogs(res.data.logs);
      setTotalPages(res.data.pages || 1);

      if (isAdmin && employees.length === 0) {
        const empRes = await api.get('/employees?limit=100');
        // Only load Active employees for payroll generation
        const activeEmps = empRes.data.employees.filter((emp) => emp.status === 'Active');
        setEmployees(activeEmps);
      }
    } catch (error) {
      toast.error('Failed to load payroll datasets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, month, year]);

  // Handle keyword search
  const handleSearchSubmit = (keyword) => {
    setSearch(keyword);
    setPage(1);
    loadData();
  };

  // Handle payroll generation (Admin)
  const onGenerateSubmit = async (data) => {
    setActionLoading(true);
    try {
      const payload = {
        employee_id: data.employee_id,
        month: parseInt(data.month),
        year: parseInt(data.year),
        bonus: parseFloat(data.bonus || 0),
        deduction: parseFloat(data.deduction || 0),
      };

      // Add tax and pf if specified
      if (data.tax) payload.tax = parseFloat(data.tax);
      if (data.pf) payload.pf = parseFloat(data.pf);

      await api.post('/payroll/generate', payload);
      toast.success('Payroll generated successfully');
      setGenerateModalOpen(false);
      reset();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate payroll');
    } finally {
      setActionLoading(false);
    }
  };

  // Secure download of PDF payslip
  const handleDownloadSlip = async (id, employeeCode, payMonth, payYear) => {
    toast.info('Compiling payslip PDF...');
    try {
      const response = await api.get(`/payroll/${id}/download`, {
        responseType: 'blob', // Force binary blob payload parsing
      });

      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);

      // Create temporary download link element
      const pdfLink = document.createElement('a');
      pdfLink.href = fileURL;
      pdfLink.setAttribute('download', `payslip-${employeeCode}-${payMonth}-${payYear}.pdf`);
      document.body.appendChild(pdfLink);
      pdfLink.click();
      pdfLink.remove();

      toast.success('Payslip downloaded successfully');
    } catch (error) {
      toast.error('Failed to compile or download salary slip PDF');
    }
  };

  if (loading) {
    return <Loader />;
  }

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Header and triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Payroll & Payslips
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAdmin ? 'Generate monthly salary logs, review corporate budgets, or download employee payslips.' : 'Review monthly payslips history logs and download PDF salary slips.'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setGenerateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl transition shadow-md shadow-blue-500/10 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Generate Payroll
          </button>
        )}
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex-1 max-w-sm">
          {showFilters ? (
            <SearchBar onSearch={handleSearchSubmit} placeholder="Search by name or code..." />
          ) : (
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Salary Slips Log</div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month selector */}
          <select
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none cursor-pointer"
          >
            <option value="">All Months</option>
            {monthsList.map((m, idx) => (
              <option key={m} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>

          {/* Year selector */}
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none cursor-pointer"
          >
            <option value="">All Years</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
          </select>
        </div>
      </div>

      {/* PAYROLL DETAILS TABLE */}
      <DataTable
        headers={
          showFilters
            ? ['Employee Details', 'Period', 'Basic Salary', 'Bonus/Allow', 'Deductions', 'Net Salary', 'Actions']
            : ['Period', 'Basic Salary', 'Bonus/Allow', 'Deductions', 'Net Salary', 'Actions']
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
              <td className="px-6 py-4 font-semibold text-slate-650 dark:text-slate-400">
                {monthsList[log.month - 1]} {log.year}
              </td>
              <td className="px-6 py-4 text-slate-500 dark:text-slate-400">${log.basic_salary.toLocaleString()}</td>
              <td className="px-6 py-4 text-slate-500 dark:text-slate-400">${log.bonus.toLocaleString()}</td>
              <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                ${(log.tax + log.pf + log.deduction).toLocaleString()}
              </td>
              <td className="px-6 py-4 text-slate-800 dark:text-white font-bold">${log.net_salary.toLocaleString()}</td>
              <td className="px-6 py-4">
                <button
                  onClick={() =>
                    handleDownloadSlip(
                      log._id,
                      log.employee_id?.employee_code || 'EMP',
                      monthsList[log.month - 1].toLowerCase().substring(0, 3),
                      log.year
                    )
                  }
                  className="p-1.5 text-blue-650 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition flex items-center justify-center"
                  title="Download Slip PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={showFilters ? 7 : 6} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">
              No payroll records found.
            </td>
          </tr>
        )}
      </DataTable>

      {/* List pagination controls */}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />

      {/* GENERATE PAYROLL DIALOG MODAL (ADMIN ONLY) */}
      <Modal isOpen={generateModalOpen} onClose={() => setGenerateModalOpen(false)} title="Generate Monthly Payroll">
        <form onSubmit={handleSubmit(onGenerateSubmit)} className="space-y-4 text-left">
          {/* Employee Picker */}
          <div>
            <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase block mb-1">
              Select Active Employee
            </label>
            <select
              {...register('employee_id', { required: 'Employee selection is required' })}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
            >
              <option value="">-- Choose Employee --</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.user_id.name} ({emp.employee_code} - ${emp.salary.toLocaleString()}/mo)
                </option>
              ))}
            </select>
            {errors.employee_id && <p className="text-xs text-red-500 mt-1">{errors.employee_id.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Month picker */}
            <div>
              <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase block mb-1">
                Month
              </label>
              <select
                {...register('month', { required: 'Month is required' })}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
              >
                {monthsList.map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Year field */}
            <div>
              <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase block mb-1">
                Year
              </label>
              <input
                type="number"
                {...register('year', { required: 'Year is required' })}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Bonus */}
            <div>
              <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase block mb-1">
                Bonus / Allowances
              </label>
              <input
                type="number"
                step="0.01"
                {...register('bonus')}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
              />
            </div>

            {/* Deduction */}
            <div>
              <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase block mb-1">
                Other Deductions
              </label>
              <input
                type="number"
                step="0.01"
                {...register('deduction')}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Tax override (optional) */}
            <div>
              <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase block mb-1">
                Income Tax (USD) <span className="text-[10px] text-slate-400 lowercase">(Optional)</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register('tax')}
                placeholder="Default: 10% of Basic"
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
              />
            </div>

            {/* PF override (optional) */}
            <div>
              <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase block mb-1">
                Provident Fund (USD) <span className="text-[10px] text-slate-400 lowercase">(Optional)</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register('pf')}
                placeholder="Default: 5% of Basic"
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-40"
          >
            {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Generate Payroll Slip
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Payroll;
