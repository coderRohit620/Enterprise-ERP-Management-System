const User = require('../models/User');
const Employee = require('../models/Employee');
const generateToken = require('../utils/jwt');

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create token
    const token = generateToken(user._id);

    // Return user information and token
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    // req.user is populated by protect middleware
    const profileData = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      created_at: req.user.createdAt,
    };

    // If user is Employee or Manager, fetch their corporate details from Employee model
    if (req.user.role === 'Employee' || req.user.role === 'Manager') {
      const employeeDetails = await Employee.findOne({ user_id: req.user._id }).populate('department_id', 'department_name description');
      if (employeeDetails) {
        profileData.employee = {
          id: employeeDetails._id,
          employee_code: employeeDetails.employee_code,
          designation: employeeDetails.designation,
          joining_date: employeeDetails.joining_date,
          salary: employeeDetails.salary,
          phone: employeeDetails.phone,
          address: employeeDetails.address,
          profile_image: employeeDetails.profile_image,
          status: employeeDetails.status,
          department: employeeDetails.department_id,
        };
      }
    }

    return res.status(200).json(profileData);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Set new password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user (Stateless JWT clearance message)
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = (req, res) => {
  return res.status(200).json({ message: 'Logout successful. Please discard your token.' });
};

module.exports = {
  login,
  getProfile,
  changePassword,
  logout,
};
