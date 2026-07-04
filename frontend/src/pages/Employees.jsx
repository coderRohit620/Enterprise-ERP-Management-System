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
import { Plus, Edit2, Trash2, UserCheck, ShieldAlert, Loader2 } from 'lucide-react';

const Employees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Pagination & filter states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const isAdmin = user?.role === 'Admin';

  // Forms setup
  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm();

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm();

  // Load employee and department lists
  const loadData = async () => {
    setLoading(true);
    try {
      let query = `?page=${page}&limit=10`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (deptFilter) query += `&department_id=${deptFilter}`;
      if (statusFilter) query += `&status=${statusFilter}`;

      const [empRes, deptRes] = await Promise.all([
        api.get(`/employees${query}`),
        api.get('/departments'),
      ]);

      setEmployees(empRes.data.employees);
      setTotalPages(empRes.data.pages || 1);
      setDepartments(deptRes.data);
    } catch (error) {
      toast.error('Failed to load employee directory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, deptFilter, statusFilter]);

  // Handle keyword searching
  const handleSearchSubmit = (keyword) => {
    setSearch(keyword);
    setPage(1);
    loadData();
  };

  // Open Edit Modal and pre-populate fields
  const openEditModal = (emp) => {
    setSelectedEmployee(emp);
    resetEdit({
      designation: emp.designation,
      department_id: emp.department_id?._id || '',
      salary: emp.salary,
      status: emp.status,
      phone: emp.phone,
      address: emp.address,
    });
    setEditModalOpen(true);
  };

  // Create Employee Submit
  const onCreateSubmit = async (data) => {
    setActionLoading(true);
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        employee_code: data.employee_code,
        designation: data.designation,
        department_id: data.department_id || null,
        salary: parseFloat(data.salary),
        phone: data.phone,
        address: data.address,
        joining_date: data.joining_date,
      };

      await api.post('/employees', payload);
      toast.success('Employee credentials and profile created successfully');
      setCreateModalOpen(false);
      resetCreate();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create employee profile');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit Employee Submit
  const onEditSubmit = async (data) => {
    if (!selectedEmployee) return;
    setActionLoading(true);
    try {
      const payload = {
        designation: data.designation,
        department_id: data.department_id || null,
        salary: parseFloat(data.salary),
        status: data.status,
        phone: data.phone,
        address: data.address,
      };

      await api.put(`/employees/${selectedEmployee._id}`, payload);
      toast.success('Employee profile updated successfully');
      setEditModalOpen(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update employee profile');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Employee Submit
  const handleDelete = async (id) => {
    if (!window.confirm('WARNING: Deleting this profile will cascade delete the user credentials. Are you sure?')) {
      return;
    }
    setActionLoading(true);
    try {
      await api.delete(`/employees/${id}`);
      toast.success('Employee profile and credentials deleted');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete employee');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header section with Create triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
            Employees Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse and manage organizational employees, roles, and profiles.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl transition shadow-md shadow-blue-500/10 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        )}
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex-1 max-w-sm">
          <SearchBar onSearch={handleSearchSubmit} placeholder="Search name, code, designation..." />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter Selector */}
          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none cursor-pointer"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.department_name}
              </option>
            ))}
          </select>

          {/* Status Filter Selector */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* DATA GRID TABLE */}
      <DataTable headers={['Employee Code', 'Full Name', 'Department / Role', 'Designation', 'Basic Salary', 'Status', 'Actions']}>
        {employees.length > 0 ? (
          employees.map((emp) => (
            <tr key={emp._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 text-xs sm:text-sm">
              <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                {emp.employee_code}
              </td>
              <td className="px-6 py-4">
                <p className="font-semibold text-slate-700 dark:text-slate-200">{emp.user_id?.name || 'Deleted User'}</p>
                <span className="text-[11px] text-slate-400">{emp.user_id?.email || 'N/A'}</span>
              </td>
              <td className="px-6 py-4">
                <p className="text-slate-600 dark:text-slate-400 font-semibold">
                  {emp.department_id?.department_name || 'Unassigned'}
                </p>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  {emp.user_id?.role || 'User'}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{emp.designation}</td>
              <td className="px-6 py-4 text-slate-650 dark:text-slate-300 font-semibold">
                ${emp.salary.toLocaleString()}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg border ${
                    emp.status === 'Active'
                      ? 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400 border-green-200 dark:border-green-900/30'
                      : 'bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400 border-red-200 dark:border-red-900/30'
                  }`}
                >
                  {emp.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    disabled={actionLoading}
                    onClick={() => openEditModal(emp)}
                    className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition"
                    title="Edit Employee"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {isAdmin && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleDelete(emp._id)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                      title="Delete Employee"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={7} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">
              No employee profiles found.
            </td>
          </tr>
        )}
      </DataTable>

      {/* Pagination component */}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />

      {/* CREATE MODAL (ADMIN ONLY) */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Add New Employee Profile">
        <form onSubmit={handleCreateSubmit(onCreateSubmit)} className="space-y-4 text-left max-h-[70vh] overflow-y-auto pr-1">
          {/* Section: Account Login */}
          <div className="border-b border-slate-100 dark:border-slate-700/50 pb-2">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account Credentials</h4>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-slate-450 uppercase block mb-1">Full Name</label>
              <input
                type="text"
                {...registerCreate('name', { required: 'Name is required' })}
                placeholder="John Doe"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
              {createErrors.name && <p className="text-xs text-red-500 mt-1">{createErrors.name.message}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-455 uppercase block mb-1">Corporate Email</label>
              <input
                type="email"
                {...registerCreate('email', { required: 'Email is required' })}
                placeholder="john@erp.com"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
              {createErrors.email && <p className="text-xs text-red-500 mt-1">{createErrors.email.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-slate-455 uppercase block mb-1">Password</label>
              <input
                type="password"
                {...registerCreate('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be >= 6 chars' } })}
                placeholder="••••••"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
              {createErrors.password && <p className="text-xs text-red-500 mt-1">{createErrors.password.message}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-455 uppercase block mb-1">System Role</label>
              <select
                {...registerCreate('role', { required: 'Role is required' })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Section: Employee details */}
          <div className="border-b border-slate-100 dark:border-slate-700/50 pt-2 pb-2">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Corporate ERP Info</h4>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-xs font-bold text-slate-455 uppercase block mb-1">Employee Code</label>
              <input
                type="text"
                {...registerCreate('employee_code', { required: 'Employee Code is required' })}
                placeholder="EMP-100"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
              {createErrors.employee_code && <p className="text-xs text-red-500 mt-1">{createErrors.employee_code.message}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-455 uppercase block mb-1">Designation</label>
              <input
                type="text"
                {...registerCreate('designation', { required: 'Designation is required' })}
                placeholder="Software Analyst"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
              {createErrors.designation && <p className="text-xs text-red-500 mt-1">{createErrors.designation.message}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-455 uppercase block mb-1">Department</label>
              <select
                {...registerCreate('department_id')}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              >
                <option value="">-- Unassigned --</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-slate-455 uppercase block mb-1">Monthly Salary (USD)</label>
              <input
                type="number"
                {...registerCreate('salary', { required: 'Salary is required' })}
                placeholder="4500"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
              {createErrors.salary && <p className="text-xs text-red-500 mt-1">{createErrors.salary.message}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-455 uppercase block mb-1">Joining Date</label>
              <input
                type="date"
                {...registerCreate('joining_date', { required: 'Joining date is required' })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-350"
              />
              {createErrors.joining_date && <p className="text-xs text-red-500 mt-1">{createErrors.joining_date.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-slate-455 uppercase block mb-1">Phone</label>
              <input
                type="text"
                {...registerCreate('phone')}
                placeholder="+1 555 0199"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-455 uppercase block mb-1">Address</label>
              <input
                type="text"
                {...registerCreate('address')}
                placeholder="123 Corporate Blvd"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10 active:scale-95"
          >
            {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Employee
          </button>
        </form>
      </Modal>

      {/* EDIT MODAL (ADMIN / MANAGER) */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Update Employee Profile">
        <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-4 text-left max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <label className="text-xs font-bold text-slate-455 uppercase block mb-1">Designation</label>
            <input
              type="text"
              {...registerEdit('designation', { required: 'Designation is required' })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
            />
            {editErrors.designation && <p className="text-xs text-red-500 mt-1">{editErrors.designation.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-slate-455 uppercase block mb-1">Department</label>
              <select
                {...registerEdit('department_id')}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              >
                <option value="">-- Unassigned --</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-455 uppercase block mb-1">Status</label>
              <select
                {...registerEdit('status', { required: 'Status is required' })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-455 uppercase block mb-1">Salary (USD)</label>
            <input
              type="number"
              {...registerEdit('salary', { required: 'Salary is required' })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
            />
            {editErrors.salary && <p className="text-xs text-red-500 mt-1">{editErrors.salary.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-slate-455 uppercase block mb-1">Phone</label>
              <input
                type="text"
                {...registerEdit('phone')}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-455 uppercase block mb-1">Address</label>
              <input
                type="text"
                {...registerEdit('address')}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10 active:scale-95"
          >
            {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
