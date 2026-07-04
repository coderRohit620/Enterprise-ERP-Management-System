const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');

/**
 * @desc    Create a new employee and their user credentials
 * @route   POST /api/employees
 * @access  Private/Admin
 */
const createEmployee = async (req, res, next) => {
  const {
    name,
    email,
    password,
    role,
    employee_code,
    department_id,
    designation,
    joining_date,
    salary,
    phone,
    address,
  } = req.body;

  try {
    // Check if email is already in use
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ error: 'Email is already in use' });
    }

    // Check if employee code is already in use
    const codeExists = await Employee.findOne({ employee_code });
    if (codeExists) {
      return res.status(400).json({ error: 'Employee code is already in use' });
    }

    // If department is assigned, verify it exists
    if (department_id) {
      const dept = await Department.findById(department_id);
      if (!dept) {
        return res.status(400).json({ error: 'Assigned Department does not exist' });
      }
    }

    // Create User record
    const user = new User({
      name,
      email,
      password,
      role,
    });
    await user.save();

    // Determine profile image path if uploaded
    const profile_image = req.file ? `/uploads/${req.file.filename}` : null;

    // Create Employee record
    const employee = new Employee({
      user_id: user._id,
      employee_code,
      department_id: department_id || null,
      designation,
      joining_date,
      salary,
      phone,
      address,
      profile_image,
    });

    await employee.save();

    // Return the response containing user credentials and employee profile details
    return res.status(201).json({
      message: 'Employee profile created successfully',
      employee: {
        id: employee._id,
        employee_code: employee.employee_code,
        designation: employee.designation,
        joining_date: employee.joining_date,
        salary: employee.salary,
        phone: employee.phone,
        address: employee.address,
        profile_image: employee.profile_image,
        status: employee.status,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    // Rollback: if User was saved but Employee save failed, clean up User
    if (error && user && user._id) {
      await User.findByIdAndDelete(user._id);
    }
    next(error);
  }
};

/**
 * @desc    Get all employees with pagination, search, sorting and filtering
 * @route   GET /api/employees
 * @access  Private (Admin, Manager)
 */
const getEmployees = async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    search,
    department,
    role,
    status,
    sort = 'createdAt',
    order = 'desc',
  } = req.query;

  try {
    const skipIndex = (parseInt(page) - 1) * parseInt(limit);

    // Build filter search queries on User table
    let userFilters = {};
    if (role) userFilters.role = role;
    if (search) {
      userFilters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const matchedUsers = await User.find(userFilters).select('_id');
    const matchedUserIds = matchedUsers.map((u) => u._id);

    // Build filter queries on Employee table
    let employeeFilters = {};
    if (search) {
      employeeFilters.$or = [
        { user_id: { $in: matchedUserIds } },
        { employee_code: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    } else {
      employeeFilters.user_id = { $in: matchedUserIds };
    }

    if (department) employeeFilters.department_id = department;
    if (status) employeeFilters.status = status;

    // Define Sorting parameters
    let sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;

    // Execute queries
    const total = await Employee.countDocuments(employeeFilters);
    const employees = await Employee.find(employeeFilters)
      .populate('user_id', 'name email role')
      .populate('department_id', 'department_name description manager_id')
      .sort(sortOptions)
      .skip(skipIndex)
      .limit(parseInt(limit));

    return res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
      employees,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get employee profile by ID
 * @route   GET /api/employees/:id
 * @access  Private (Admin, Manager, or Employee owner)
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('user_id', 'name email role')
      .populate('department_id', 'department_name description manager_id');

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Access Security: Employee can only view their own profile
    if (req.user.role === 'Employee' && req.user._id.toString() !== employee.user_id._id.toString()) {
      return res.status(403).json({ error: 'Access denied: You can only view your own profile.' });
    }

    return res.status(200).json(employee);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update employee profile details
 * @route   PUT /api/employees/:id
 * @access  Private (Admin, or Employee owner with restrictions)
 */
const updateEmployee = async (req, res, next) => {
  const {
    name,
    email,
    password,
    role,
    employee_code,
    department_id,
    designation,
    joining_date,
    salary,
    phone,
    address,
    status,
  } = req.body;

  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const user = await User.findById(employee.user_id);
    if (!user) {
      return res.status(404).json({ error: 'Associated user account not found' });
    }

    const isSelfUpdate = req.user._id.toString() === user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    // Access Security: Employees can only edit their own contact details and photo
    if (!isAdmin && !isSelfUpdate) {
      return res.status(403).json({ error: 'Access denied: You are not authorized to edit this profile.' });
    }

    // Handle profile image update
    if (req.file) {
      employee.profile_image = `/uploads/${req.file.filename}`;
    }

    if (isAdmin) {
      // Full administrative edits
      if (name) user.name = name;
      if (role) user.role = role;
      if (password) user.password = password;

      if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          return res.status(400).json({ error: 'Email is already in use by another user' });
        }
        user.email = email;
      }

      if (employee_code && employee_code !== employee.employee_code) {
        const codeExists = await Employee.findOne({ employee_code });
        if (codeExists) {
          return res.status(400).json({ error: 'Employee code is already in use by another employee' });
        }
        employee.employee_code = employee_code;
      }

      if (department_id) {
        const dept = await Department.findById(department_id);
        if (!dept) {
          return res.status(400).json({ error: 'Assigned Department does not exist' });
        }
        employee.department_id = department_id;
      } else if (department_id === null || department_id === '') {
        employee.department_id = null;
      }

      if (designation) employee.designation = designation;
      if (joining_date) employee.joining_date = joining_date;
      if (salary !== undefined) employee.salary = salary;
      if (status) employee.status = status;
      if (phone !== undefined) employee.phone = phone;
      if (address !== undefined) employee.address = address;
    } else {
      // Restricted updates for employee self-profile
      if (phone !== undefined) employee.phone = phone;
      if (address !== undefined) employee.address = address;
    }

    // Save changes
    await user.save();
    await employee.save();

    // Fetch updated documents
    const updatedEmployee = await Employee.findById(employee._id)
      .populate('user_id', 'name email role')
      .populate('department_id', 'department_name description manager_id');

    return res.status(200).json({
      message: 'Profile updated successfully',
      employee: updatedEmployee,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an employee and their corresponding user credentials
 * @route   DELETE /api/employees/:id
 * @access  Private/Admin
 */
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Cascade delete: Remove User record first
    await User.findByIdAndDelete(employee.user_id);
    // Remove Employee record
    await Employee.findByIdAndDelete(employee._id);

    return res.status(200).json({ message: 'Employee and user account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
