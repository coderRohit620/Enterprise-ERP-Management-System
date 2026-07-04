const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const User = require('../models/User');
const generateSalarySlipPDF = require('../utils/pdfGenerator');

/**
 * @desc    Generate monthly payroll record for an employee
 * @route   POST /api/payroll/generate
 * @access  Private/Admin
 */
const generatePayroll = async (req, res, next) => {
  const { employee_id, month, year, bonus, deduction, tax, pf } = req.body;

  try {
    // Find the target employee
    const employee = await Employee.findById(employee_id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Verify employee status is Active
    if (employee.status !== 'Active') {
      return res.status(400).json({ error: 'Payroll generation is restricted for inactive/terminated profiles' });
    }

    // Verify if payroll has already been generated for this employee for this month/year
    const payrollExists = await Payroll.findOne({ employee_id, month, year });
    if (payrollExists) {
      return res.status(400).json({ error: `Payroll has already been generated for this employee for ${month}/${year}` });
    }

    const basic_salary = employee.salary;
    const bonusAmount = parseFloat(bonus || 0);
    const deductionAmount = parseFloat(deduction || 0);

    // Apply defaults for tax (10% of basic) and PF (5% of basic) if not specified
    const taxAmount = tax !== undefined ? parseFloat(tax) : parseFloat((basic_salary * 0.10).toFixed(2));
    const pfAmount = pf !== undefined ? parseFloat(pf) : parseFloat((basic_salary * 0.05).toFixed(2));

    // Calculate Net Salary: Basic + Bonus - Deductions - Tax - PF
    const net_salary = parseFloat((basic_salary + bonusAmount - deductionAmount - taxAmount - pfAmount).toFixed(2));

    const payroll = new Payroll({
      employee_id,
      month,
      year,
      basic_salary,
      bonus: bonusAmount,
      deduction: deductionAmount,
      tax: taxAmount,
      pf: pfAmount,
      net_salary: Math.max(0, net_salary), // Ensure salary is not negative
    });

    await payroll.save();

    return res.status(201).json({
      message: 'Payroll generated successfully',
      payroll,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all payroll logs (Scoped by role: Employee sees self; Admin/Manager sees all)
 * @route   GET /api/payroll
 * @access  Private
 */
const getPayrollLogs = async (req, res, next) => {
  const { page = 1, limit = 10, search, month, year, employee_id } = req.query;

  try {
    const skipIndex = (parseInt(page) - 1) * parseInt(limit);
    let filters = {};

    // Role Enforcement: Employees can only view their own payroll slips
    if (req.user.role === 'Employee') {
      const employee = await Employee.findOne({ user_id: req.user._id });
      if (!employee) {
        return res.status(404).json({ error: 'Employee profile not found' });
      }
      filters.employee_id = employee._id;
    } else {
      // Admins and Managers can check a specific employee
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

    if (month) {
      filters.month = parseInt(month);
    }

    if (year) {
      filters.year = parseInt(year);
    }

    const total = await Payroll.countDocuments(filters);
    const logs = await Payroll.find(filters)
      .populate({
        path: 'employee_id',
        populate: [
          { path: 'user_id', select: 'name email role' },
          { path: 'department_id', select: 'department_name' },
        ],
      })
      .sort({ year: -1, month: -1 })
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

/**
 * @desc    Download salary slip PDF
 * @route   GET /api/payroll/:id/download
 * @access  Private
 */
const downloadSalarySlip = async (req, res, next) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate({
      path: 'employee_id',
      populate: [
        { path: 'user_id', select: 'name email role' },
        { path: 'department_id', select: 'department_name' },
      ],
    });

    if (!payroll) {
      return res.status(404).json({ error: 'Payroll record not found' });
    }

    // Access Security: Employee can only download their own payslip
    if (req.user.role === 'Employee' && req.user._id.toString() !== payroll.employee_id.user_id._id.toString()) {
      return res.status(403).json({ error: 'Access denied: You are not authorized to view another employee’s salary slip' });
    }

    // Set HTTP Response Headers for PDF downloading
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=payslip-${payroll.employee_id.employee_code}-${payroll.month}-${payroll.year}.pdf`
    );

    // Call PDF generation stream helper
    generateSalarySlipPDF(res, payroll);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generatePayroll,
  getPayrollLogs,
  downloadSalarySlip,
};
