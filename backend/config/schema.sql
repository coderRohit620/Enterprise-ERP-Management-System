-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Manager', 'Employee')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    department_name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    designation VARCHAR(100) NOT NULL,
    joining_date DATE NOT NULL,
    salary NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (salary >= 0),
    phone VARCHAR(20),
    address TEXT,
    profile_image VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Terminated'))
);

-- Create Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in TIMESTAMP WITH TIME ZONE,
    check_out TIMESTAMP WITH TIME ZONE,
    working_hours NUMERIC(4, 2) DEFAULT 0.00 CHECK (working_hours >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'Present' CHECK (status IN ('Present', 'Absent', 'Late', 'Half Day')),
    CONSTRAINT unique_employee_date UNIQUE (employee_id, date)
);

-- Create Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('Casual', 'Sick', 'Maternity', 'Paternity', 'Unpaid')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Cancelled')),
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates CHECK (end_date >= start_date)
);

-- Create Payroll Table
CREATE TABLE IF NOT EXISTS payroll (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL,
    basic_salary NUMERIC(12, 2) NOT NULL CHECK (basic_salary >= 0),
    bonus NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (bonus >= 0),
    deduction NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (deduction >= 0),
    tax NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax >= 0),
    net_salary NUMERIC(12, 2) NOT NULL CHECK (net_salary >= 0),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_payroll_month UNIQUE (employee_id, month, year)
);

-- CREATE INDEXES for optimization
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_employees_user ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_attendance_emp_date ON attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_leave_emp ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_payroll_emp_month ON payroll(employee_id, month, year);
