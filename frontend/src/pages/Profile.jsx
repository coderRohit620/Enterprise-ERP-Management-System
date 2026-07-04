import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { toast } from 'react-toastify';
import { User, Phone, MapPin, Calendar, CreditCard, Shield, Key, Loader2, FolderTree } from 'lucide-react';

const Profile = () => {
  const { user, updatePassword, setUser } = useAuth();
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [updatingContact, setUpdatingContact] = useState(false);
  const [contactMode, setContactMode] = useState(false);

  // Forms setup
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm();

  const {
    register: registerContact,
    handleSubmit: handleSubmitContact,
    formState: { errors: contactErrors },
  } = useForm({
    defaultValues: {
      phone: user?.employee_profile?.phone || '',
      address: user?.employee_profile?.address || '',
    },
  });

  if (!user) return null;

  // Handle password updates
  const onPasswordSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSubmittingPassword(true);
    const result = await updatePassword(data.currentPassword, data.newPassword);
    setSubmittingPassword(false);

    if (result.success) {
      toast.success('Password changed successfully');
      resetPassword();
    } else {
      toast.error(result.error);
    }
  };

  // Handle contact details updates (Employees/Managers can modify phone and address)
  const onContactSubmit = async (data) => {
    if (!user.employee_profile) {
      toast.error('Administrator accounts do not have editable contact profiles');
      return;
    }

    setUpdatingContact(true);
    try {
      const res = await api.put(`/employees/${user.employee_profile._id}`, {
        phone: data.phone,
        address: data.address,
      });

      // Sync active state in context
      setUser({
        ...user,
        employee_profile: {
          ...user.employee_profile,
          phone: res.data.employee.phone,
          address: res.data.employee.address,
        },
      });

      toast.success('Contact info updated successfully');
      setContactMode(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update contact info');
    } finally {
      setUpdatingContact(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3 text-left">
      {/* LEFT: Quick Summary Card */}
      <div className="space-y-6 md:col-span-1">
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm p-6 flex flex-col items-center text-center">
          {/* Avatar Profile */}
          <div className="w-20 h-20 bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 dark:border-blue-400/10 rounded-3xl flex items-center justify-center font-bold text-3xl mb-4">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{user.name}</h2>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-1">
            {user.role}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{user.email}</p>

          {/* Verification Badge */}
          <div className="mt-6 flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-950/20 text-[10px] font-bold text-green-600 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-900/30">
            <Shield className="w-3.5 h-3.5" />
            Verified ERP Account
          </div>
        </div>
      </div>

      {/* RIGHT: Profile Details & Password Form */}
      <div className="space-y-6 md:col-span-2">
        {/* Profile info block */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-4 mb-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Profile details
            </h3>
            {user.employee_profile && (
              <button
                onClick={() => setContactMode(!contactMode)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {contactMode ? 'Cancel Edit' : 'Edit Contact'}
              </button>
            )}
          </div>

          {contactMode ? (
            /* CONTACT INFO EDIT FORM */
            <form onSubmit={handleSubmitContact(onContactSubmit)} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  {...registerContact('phone', { required: 'Phone number is required' })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                />
                {contactErrors.phone && <p className="text-xs text-red-500 mt-1">{contactErrors.phone.message}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  {...registerContact('address', { required: 'Address is required' })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                />
                {contactErrors.address && (
                  <p className="text-xs text-red-500 mt-1">{contactErrors.address.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={updatingContact}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-blue-500/10 flex items-center gap-1.5"
              >
                {updatingContact && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </form>
          ) : (
            /* STATIC DETAILS DISPLAY */
            <div className="grid gap-6 sm:grid-cols-2 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-400 dark:text-slate-500 font-medium">Role System</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{user.role}</p>
                </div>
              </div>

              {user.employee_profile ? (
                <>
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-400 dark:text-slate-500 font-medium">Employee Code</p>
                      <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                        {user.employee_profile.employee_code}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-400 dark:text-slate-500 font-medium">Designation</p>
                      <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                        {user.employee_profile.designation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FolderTree className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-400 dark:text-slate-500 font-medium">Department</p>
                      <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                        {user.employee_profile.department_id
                          ? user.employee_profile.department_id.department_name
                          : 'Unassigned'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-400 dark:text-slate-500 font-medium">Joining Date</p>
                      <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                        {new Date(user.employee_profile.joining_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-400 dark:text-slate-500 font-medium">Monthly Basic Salary</p>
                      <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                        ${user.employee_profile.salary.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-400 dark:text-slate-500 font-medium">Phone</p>
                      <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                        {user.employee_profile.phone || 'Not configured'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-400 dark:text-slate-500 font-medium">Address</p>
                      <p className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                        {user.employee_profile.address || 'Not configured'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2 text-xs text-slate-400 dark:text-slate-500">
                  Account has no linked ERP corporate Employee details.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Change password card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/50 pb-4 mb-5">
            <Key className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Change Account Password
            </h3>
          </div>

          <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4 max-w-md">
            <div>
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
                Current Password
              </label>
              <input
                type="password"
                {...registerPassword('currentPassword', { required: 'Current password is required' })}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
              />
              {passwordErrors.currentPassword && (
                <p className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
                New Password
              </label>
              <input
                type="password"
                {...registerPassword('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters long' },
                })}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
              />
              {passwordErrors.newPassword && (
                <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                {...registerPassword('confirmPassword', { required: 'Please confirm your new password' })}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
              />
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submittingPassword}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-500/10 flex items-center gap-1.5 active:scale-95 disabled:opacity-40"
            >
              {submittingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Credentials
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
