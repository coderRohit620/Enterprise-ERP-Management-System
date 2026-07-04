const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const User = require('../models/User');

/**
 * @desc    Clock-in for the day
 * @route   POST /api/attendance/checkin
 * @access  Private (Employee, Manager, Admin)
 */
const checkIn = async (req, res, next) => {
  try {
    // Find the employee profile associated with the authenticated user
    const employee = await Employee.findOne({ user_id: req.user._id });
    if (!employee) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    if (employee.status !== 'Active') {
      return res.status(400).json({ error: 'Attendance check-in is restricted for inactive/terminated profiles' });
    }

    // Set today's date boundaries (midnight to midnight)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Verify if already checked in today
    const alreadyCheckedIn = await Attendance.findOne({
      employee_id: employee._id,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    if (alreadyCheckedIn) {
      return res.status(400).json({ error: 'You have already checked in for today' });
    }

    // Determine late status based on check-in hour (Grace limit is 09:30 AM)
    const now = new Date();
    const lateThreshold = new Date();
    lateThreshold.setHours(9, 30, 0, 0);

    const status = now > lateThreshold ? 'Late' : 'Present';

    const attendance = new Attendance({
      employee_id: employee._id,
      date: todayStart, // Normalize to midnight date
      check_in: now,
      status,
    });

    await attendance.save();

    return res.status(201).json({
      message: 'Checked in successfully',
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clock-out for the day
 * @route   POST /api/attendance/checkout
 * @access  Private (Employee, Manager, Admin)
 */
const checkOut = async (req, res, next) => {
  try {
    // Find the employee profile
    const employee = await Employee.findOne({ user_id: req.user._id });
    if (!employee) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    // Set today's date boundaries
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Find today's check-in record
    const attendance = await Attendance.findOne({
      employee_id: employee._id,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    if (!attendance) {
      return res.status(400).json({ error: 'Please check in before clocking out' });
    }

    if (attendance.check_out) {
      return res.status(400).json({ error: 'You have already checked out for today' });
    }

    const now = new Date();
    const checkInTime = new Date(attendance.check_in);
    
    // Calculate difference in hours
    const durationMs = now - checkInTime;
    const workingHours = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2));

    attendance.check_out = now;
    attendance.working_hours = workingHours;

    // Apply Half-Day status override if working hours are below 4 hours
    if (workingHours < 4.0) {
      attendance.status = 'Half Day';
    }

    await attendance.save();

    return res.status(200).json({
      message: 'Checked out successfully',
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get attendance logs (Filtered by role: Employee gets self; Admin/Manager gets list)
 * @route   GET /api/attendance
 * @access  Private
 */
const getAttendanceLogs = async (req, res, next) => {
  const { page = 1, limit = 10, search, date, status, employee_id } = req.query;

  try {
    const skipIndex = (parseInt(page) - 1) * parseInt(limit);
    let filters = {};

    // Role Enforcement: Employees only see their own attendance records
    if (req.user.role === 'Employee') {
      const employee = await Employee.findOne({ user_id: req.user._id });
      if (!employee) {
        return res.status(404).json({ error: 'Employee profile not found' });
      }
      filters.employee_id = employee._id;
    } else {
      // Admins and Managers can filter by a target employee
      if (employee_id) {
        filters.employee_id = employee_id;
      } else if (search) {
        // Search by employee name or code
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

    // Apply filter by status
    if (status) {
      filters.status = status;
    }

    // Apply filter by date
    if (date) {
      const searchDate = new Date(date);
      const startOfDay = new Date(searchDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(searchDate);
      endOfDay.setHours(23, 59, 59, 999);

      filters.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // Execute queries
    const total = await Attendance.countDocuments(filters);
    const logs = await Attendance.find(filters)
      .populate({
        path: 'employee_id',
        populate: [
          { path: 'user_id', select: 'name email role' },
          { path: 'department_id', select: 'department_name' },
        ],
      })
      .sort({ date: -1, check_in: -1 })
      .skip(skipIndex)
      .limit(parseInt(limit));

    return res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
      logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getAttendanceLogs,
};
