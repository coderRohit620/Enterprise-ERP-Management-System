import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import MainLayout from './layouts/MainLayout';
import Index from './pages/Index';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Payroll from './pages/Payroll';
import Profile from './pages/Profile';
import { ToastContainer } from 'react-toastify';

/**
 * Root Application Router Container.
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Client Session Layout Route */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard (All Authenticated roles) */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Employee Management (Admin and Manager only) */}
            <Route
              path="/employees"
              element={
                <RoleRoute allowedRoles={['Admin', 'Manager']}>
                  <Employees />
                </RoleRoute>
              }
            />

            {/* Department logs (All authenticated) */}
            <Route path="/departments" element={<Departments />} />

            {/* Attendance checks (All authenticated) */}
            <Route path="/attendance" element={<Attendance />} />

            {/* Leaves allocations (All authenticated) */}
            <Route path="/leaves" element={<Leaves />} />

            {/* Payroll lists (All authenticated) */}
            <Route path="/payroll" element={<Payroll />} />

            {/* User profile (All authenticated) */}
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Global Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </AuthProvider>
  );
}

export default App;
