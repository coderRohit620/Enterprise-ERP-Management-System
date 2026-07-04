const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const User = require('../models/User');

const QUOTAS = {
  Casual: 15,
  Sick: 10,
  Maternity: 90,
  Paternity: 15,
  Unpaid: 0, // Unpaid has no quota limit (tracked as used)
};

/**
 * Helper to calculate leave balance dynamically for a given employee
 * @param {string} employeeId - MongoDB Employee ID
 * @param {number} year - The target calendar year
 * @returns {object} The quota, used, and remaining balance details
 */
const calculateLeaveBalanceHelper = async (employeeId, year = new Date().getFullYear()) => {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

  // Fetch approved leaves falling within the calendar year
  const approvedLeaves = await LeaveRequest.find({
    employee_id: employeeId,
    status: 'Approved',
    start_date: { $gte: startOfYear },
    end_date: { $lte: endOfYear },
  });

  const used = {
    Casual: 0,
    Sick: 0,
    Maternity: 0,
    Paternity: 0,
    Unpaid: 0,
  };

  approvedLeaves.forEach((leave) => {
    const diffTime = Math.abs(leave.end_date - leave.start_date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive of start/end days
    if (used[leave.leave_type] !== undefined) {
      used[leave.leave_type] += diffDays;
    }
  });

  const balance = {
    Casual: Math.max(0, QUOTAS.Casual - used.Casual),
    Sick: Math.max(0, QUOTAS.Sick - used.Sick),
    Maternity: Math.max(0, QUOTAS.Maternity - used.Maternity),
    Paternity: Math.max(0, QUOTAS.Paternity - used.Paternity),
    Unpaid: used.Unpaid, // Unpaid is just tracked as used
  };

  return {
    quota: QUOTAS,
    used,
    balance,
  };
};

/**
 * @desc    Apply for leave
 * @route   POST /api/leaves
 * @access  Private (Employee, Manager, Admin)
 */
const applyLeave = async (req, res, next) => {
  const { leave_type, start_date, end_date, reason } = req.body;

  try {
    const employee = await Employee.findOne({ user_id: req.user._id });
    if (!employee) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    if (employee.status !== 'Active') {
      return res.status(400).json({ error: 'Leave application is restricted for inactive/terminated profiles' });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);

    if (end < start) {
      return res.status(400).json({ error: 'End date must be greater than or equal to start date' });
    }

    // Calculate requested duration
    const diffTime = Math.abs(end - start);
    const requestedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Validate balance for quota-based leaves
    if (leave_type !== 'Unpaid') {
      const balanceDetails = await calculateLeaveBalanceHelper(employee._id, start.getFullYear());
      const remainingBalance = balanceDetails.balance[leave_type];

      if (requestedDays > remainingBalance) {
        return res.status(400).json({
          error: `Insufficient leave balance. You requested ${requestedDays} day(s) of ${leave_type} leave, but only have ${remainingBalance} day(s) remaining.`,
        });
      }
    }

    const leaveRequest = new LeaveRequest({
      employee_id: employee._id,
      leave_type,
      start_date: start,
      end_date: end,
      reason,
      status: 'Pending',
    });

    await leaveRequest.save();

    return res.status(201).json({
      message: 'Leave applied successfully',
      leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get leave applications (Filtered by role permissions)
 * @route   GET /api/leaves
 * @access  Private
 */
const getLeaves = async (req, res, next) => {
  const { page = 1, limit = 10, status, leave_type, employee_id, search } = req.query;

  try {
    const skipIndex = (parseInt(page) - 1) * parseInt(limit);
    let filters = {};

    // Role Enforcement
    if (req.user.role === 'Employee') {
      const employee = await Employee.findOne({ user_id: req.user._id });
      if (!employee) {
        return res.status(404).json({ error: 'Employee profile not found' });
      }
      filters.employee_id = employee._id;
    } else if (req.user.role === 'Manager') {
      // Managers can see their department employees' leaves + their own
      const managerDept = await Department.findOne({ manager_id: req.user._id });
      
      if (managerDept) {
        const deptEmployees = await Employee.find({ department_id: managerDept._id }).select('_id');
        const deptEmployeeIds = deptEmployees.map((e) => e._id);
        
        // Fetch manager's own employee ID to list their own requests too
        const managerEmp = await Employee.findOne({ user_id: req.user._id });
        if (managerEmp) {
          deptEmployeeIds.push(managerEmp._id);
        }
        
        filters.employee_id = { $in: deptEmployeeIds };
      } else {
        // Fallback: if manager manages no department, only list their own leave
        const managerEmp = await Employee.findOne({ user_id: req.user._id });
        filters.employee_id = managerEmp ? managerEmp._id : null;
      }
    }

    // Admins and Managers (if not overridden by department limits) can search/filter by employee
    if (req.user.role === 'Admin') {
      if (employee_id) {
        filters.employee_id = employee_id;
      } else if (search) {
        const matchedUsers = await User.find({ name: { $regex: search, $options: 'i' } }).select('_id');
        const userIds = matchedUsers.map((u) => u._id);

        const matchedEmployees = await Employee.find({
          $or: [
            { user_id: { $in: userIds } },
            { employee_code: { $regex: search, $options: 'i' } },
          ],
        }).select('_id');

        filters.employee_id = { $in: matchedEmployees.map((e) => e._id) };
      }
    }

    if (status) {
      filters.status = status;
    }

    if (leave_type) {
      filters.leave_type = leave_type;
    }

    const total = await LeaveRequest.countDocuments(filters);
    const leaves = await LeaveRequest.find(filters)
      .populate({
        path: 'employee_id',
        populate: [
          { path: 'user_id', select: 'name email role' },
          { path: 'department_id', select: 'department_name' },
        ],
      })
      .populate('approved_by', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skipIndex)
      .limit(parseInt(limit));

    return res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
      leaves,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get leave balances
 * @route   GET /api/leaves/balance
 * @access  Private
 */
const getLeaveBalance = async (req, res, next) => {
  const { employee_id, year = new Date().getFullYear() } = req.query;

  try {
    let targetEmployeeId;

    if (req.user.role === 'Employee') {
      // Employees can only fetch their own leave balance
      const employee = await Employee.findOne({ user_id: req.user._id });
      if (!employee) {
        return res.status(404).json({ error: 'Employee profile not found' });
      }
      targetEmployeeId = employee._id;
    } else {
      // Admins and Managers can check balance of any employee
      if (employee_id) {
        targetEmployeeId = employee_id;
      } else {
        // Fallback to checking their own balance if not specified
        const employee = await Employee.findOne({ user_id: req.user._id });
        if (!employee) {
          return res.status(404).json({ error: 'Employee profile not found' });
        }
        targetEmployeeId = employee._id;
      }
    }

    const balances = await calculateLeaveBalanceHelper(targetEmployeeId, parseInt(year));
    return res.status(200).json(balances);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a pending leave request
 * @route   PUT /api/leaves/:id/cancel
 * @access  Private (Employee owner only)
 */
const cancelLeave = async (req, res, next) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    // Verify requesting user is the owner of this request
    const employee = await Employee.findOne({ user_id: req.user._id });
    if (!employee || leaveRequest.employee_id.toString() !== employee._id.toString()) {
      return res.status(403).json({ error: 'Access Denied: You cannot cancel another employee’s leave request' });
    }

    // Only pending requests can be cancelled
    if (leaveRequest.status !== 'Pending') {
      return res.status(400).json({ error: `Cannot cancel leave request that is already ${leaveRequest.status}` });
    }

    leaveRequest.status = 'Cancelled';
    await leaveRequest.save();

    return res.status(200).json({
      message: 'Leave request cancelled successfully',
      leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve a pending leave request
 * @route   PUT /api/leaves/:id/approve
 * @access  Private (Admin, Manager)
 */
const approveLeave = async (req, res, next) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (leaveRequest.status !== 'Pending') {
      return res.status(400).json({ error: `Leave request has already been ${leaveRequest.status}` });
    }

    // Manage role approval permission check
    if (req.user.role === 'Manager') {
      // Managers can only approve leave for employees in their managed departments
      const managerDept = await Department.findOne({ manager_id: req.user._id });
      if (!managerDept) {
        return res.status(403).json({ error: 'Access Denied: You do not manage any department.' });
      }

      const applicantEmployee = await Employee.findById(leaveRequest.employee_id);
      if (!applicantEmployee || applicantEmployee.department_id.toString() !== managerDept._id.toString()) {
        return res.status(403).json({ error: 'Access Denied: You can only approve leave requests for employees in your department.' });
      }
    }

    leaveRequest.status = 'Approved';
    leaveRequest.approved_by = req.user._id;
    await leaveRequest.save();

    return res.status(200).json({
      message: 'Leave request approved successfully',
      leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a pending leave request
 * @route   PUT /api/leaves/:id/reject
 * @access  Private (Admin, Manager)
 */
const rejectLeave = async (req, res, next) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (leaveRequest.status !== 'Pending') {
      return res.status(400).json({ error: `Leave request has already been ${leaveRequest.status}` });
    }

    // Manage role rejection permission check
    if (req.user.role === 'Manager') {
      // Managers can only reject leave for employees in their managed departments
      const managerDept = await Department.findOne({ manager_id: req.user._id });
      if (!managerDept) {
        return res.status(403).json({ error: 'Access Denied: You do not manage any department.' });
      }

      const applicantEmployee = await Employee.findById(leaveRequest.employee_id);
      if (!applicantEmployee || applicantEmployee.department_id.toString() !== managerDept._id.toString()) {
        return res.status(403).json({ error: 'Access Denied: You can only reject leave requests for employees in your department.' });
      }
    }

    leaveRequest.status = 'Rejected';
    leaveRequest.approved_by = req.user._id;
    await leaveRequest.save();

    return res.status(200).json({
      message: 'Leave request rejected successfully',
      leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyLeave,
  getLeaves,
  getLeaveBalance,
  cancelLeave,
  approveLeave,
  rejectLeave,
};
