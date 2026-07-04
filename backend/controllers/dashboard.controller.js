const Employee = require('../models/Employee');
const Department = require('../models/Department');
const LeaveRequest = require('../models/LeaveRequest');
const Attendance = require('../models/Attendance');

// Get YYYY-MM-DD string for current local time
const getTodayDateString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * @desc    Get dashboard metrics and graphs data based on user role
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    if (req.user.role === 'Admin') {
      // 1. Core counters
      const totalEmployees = await Employee.countDocuments();
      const totalDepartments = await Department.countDocuments();
      const pendingLeaves = await LeaveRequest.countDocuments({ status: 'Pending' });
      const presentToday = await Attendance.countDocuments({
        date: { $gte: todayStart, $lte: todayEnd },
        status: { $in: ['Present', 'Late', 'Half Day'] },
      });

      // 2. Department wise stats (budget & headcount aggregation)
      const deptStatsAgg = await Employee.aggregate([
        {
          $group: {
            _id: '$department_id',
            headcount: { $sum: 1 },
            monthlyPayroll: { $sum: '$salary' },
          },
        },
      ]);
      const populatedDeptStats = await Department.populate(deptStatsAgg, {
        path: '_id',
        select: 'department_name',
      });

      const departmentGraphData = populatedDeptStats.map((item) => ({
        name: item._id ? item._id.department_name : 'Unassigned',
        headcount: item.headcount,
        budget: item.monthlyPayroll,
      }));

      // 3. Attendance Status distribution (last 30 days)
      const lastMonth = new Date();
      lastMonth.setDate(lastMonth.getDate() - 30);

      const attendanceAgg = await Attendance.aggregate([
        {
          $match: {
            createdAt: { $gte: lastMonth },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);

      const attendanceGraphData = attendanceAgg.map((item) => ({
        status: item._id,
        count: item.count,
      }));

      // 4. Recent Actions List
      const recentLeaves = await LeaveRequest.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({
          path: 'employee_id',
          populate: { path: 'user_id', select: 'name email' },
        });

      const recentAttendance = await Attendance.find({ date: { $gte: todayStart, $lte: todayEnd } })
        .sort({ check_in: -1 })
        .limit(5)
        .populate({
          path: 'employee_id',
          populate: { path: 'user_id', select: 'name email' },
        });

      return res.status(200).json({
        role: 'Admin',
        stats: {
          totalEmployees,
          totalDepartments,
          pendingLeaves,
          presentToday,
        },
        graphs: {
          departmentGraphData,
          attendanceGraphData,
        },
        recent: {
          recentLeaves,
          recentAttendance,
        },
      });
    }

    if (req.user.role === 'Manager') {
      // Find the department managed by this user
      const managedDept = await Department.findOne({ manager_id: req.user._id });
      if (!managedDept) {
        return res.status(200).json({
          role: 'Manager',
          stats: { totalEmployees: 0, pendingLeaves: 0, presentToday: 0 },
          graphs: { departmentGraphData: [], attendanceGraphData: [] },
          recent: { recentLeaves: [], recentAttendance: [] },
        });
      }

      // Department employees
      const deptEmployees = await Employee.find({ department_id: managedDept._id }).select('_id');
      const employeeIds = deptEmployees.map((e) => e._id);

      const totalEmployees = employeeIds.length;
      const pendingLeaves = await LeaveRequest.countDocuments({
        employee_id: { $in: employeeIds },
        status: 'Pending',
      });
      const presentToday = await Attendance.countDocuments({
        employee_id: { $in: employeeIds },
        date: { $gte: todayStart, $lte: todayEnd },
        status: { $in: ['Present', 'Late', 'Half Day'] },
      });

      // Recent department logs
      const recentLeaves = await LeaveRequest.find({ employee_id: { $in: employeeIds } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({
          path: 'employee_id',
          populate: { path: 'user_id', select: 'name email' },
        });

      const recentAttendance = await Attendance.find({ employee_id: { $in: employeeIds }, date: { $gte: todayStart, $lte: todayEnd } })
        .sort({ check_in: -1 })
        .limit(5)
        .populate({
          path: 'employee_id',
          populate: { path: 'user_id', select: 'name email' },
        });

      return res.status(200).json({
        role: 'Manager',
        department_name: managedDept.department_name,
        stats: {
          totalEmployees,
          pendingLeaves,
          presentToday,
        },
        recent: {
          recentLeaves,
          recentAttendance,
        },
      });
    }

    if (req.user.role === 'Employee') {
      // Find current employee profile
      const employee = await Employee.findOne({ user_id: req.user._id }).populate('department_id');
      if (!employee) {
        return res.status(404).json({ error: 'Employee profile not found' });
      }

      // Today's Clock details
      const todayAttendance = await Attendance.findOne({
        employee_id: employee._id,
        date: { $gte: todayStart, $lte: todayEnd },
      });

      // Attendance records summary (current calendar month)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthlyAttendance = await Attendance.find({
        employee_id: employee._id,
        createdAt: { $gte: startOfMonth },
      });

      const attendanceCounts = {
        Present: 0,
        Late: 0,
        Absent: 0,
        'Half Day': 0,
      };
      monthlyAttendance.forEach((log) => {
        if (attendanceCounts[log.status] !== undefined) {
          attendanceCounts[log.status]++;
        }
      });

      // Leaves balance computation (for stats cards display)
      const currentYear = new Date().getFullYear();
      const approvedLeaves = await LeaveRequest.find({
        employee_id: employee._id,
        status: 'Approved',
        start_date: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`),
        },
      });

      const leaveTakenCounts = {
        Casual: 0,
        Sick: 0,
        Maternity: 0,
        Paternity: 0,
      };

      approvedLeaves.forEach((leave) => {
        const diffTime = Math.abs(new Date(leave.end_date) - new Date(leave.start_date));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        if (leaveTakenCounts[leave.type] !== undefined) {
          leaveTakenCounts[leave.type] += diffDays;
        }
      });

      const quotas = { Casual: 15, Sick: 10, Maternity: 90, Paternity: 15 };
      const totalLeavesRemaining = Object.keys(quotas).reduce((sum, type) => {
        return sum + Math.max(0, quotas[type] - leaveTakenCounts[type]);
      }, 0);

      return res.status(200).json({
        role: 'Employee',
        basic_salary: employee.salary,
        stats: {
          remainingLeaves: totalLeavesRemaining,
          presentDays: attendanceCounts.Present + attendanceCounts.Late,
          lateDays: attendanceCounts.Late,
          halfDays: attendanceCounts['Half Day'],
        },
        clockStatus: todayAttendance
          ? {
              status: 'clocked_out',
              clocked_in: todayAttendance.check_in,
              clocked_out: todayAttendance.check_out,
              canClockIn: false,
              canClockOut: todayAttendance.check_out === null,
            }
          : {
              status: 'not_clocked_in',
              canClockIn: true,
              canClockOut: false,
            },
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
