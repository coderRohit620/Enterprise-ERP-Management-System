const Department = require('../models/Department');
const Employee = require('../models/Employee');
const User = require('../models/User');

/**
 * @desc    Create a new department
 * @route   POST /api/departments
 * @access  Private/Admin
 */
const createDepartment = async (req, res, next) => {
  const { department_name, description, manager_id } = req.body;

  try {
    // Check uniqueness of department name
    const deptExists = await Department.findOne({ department_name: { $regex: new RegExp(`^${department_name}$`, 'i') } });
    if (deptExists) {
      return res.status(400).json({ error: 'Department name is already in use' });
    }

    // Verify manager exists and holds Manager or Admin roles
    if (manager_id) {
      const managerUser = await User.findById(manager_id);
      if (!managerUser) {
        return res.status(400).json({ error: 'Manager user not found' });
      }
      if (managerUser.role !== 'Manager' && managerUser.role !== 'Admin') {
        return res.status(400).json({ error: 'Assigned manager must have a role of Manager or Admin' });
      }
    }

    const department = new Department({
      department_name,
      description,
      manager_id: manager_id || null,
    });

    await department.save();

    return res.status(201).json({
      message: 'Department created successfully',
      department,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all departments (includes searching, sorting, and employee count)
 * @route   GET /api/departments
 * @access  Private
 */
const getDepartments = async (req, res, next) => {
  const { search, sort = 'department_name', order = 'asc' } = req.query;

  try {
    let query = {};
    if (search) {
      query.department_name = { $regex: search, $options: 'i' };
    }

    let sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;

    // Fetch departments
    const departments = await Department.find(query)
      .populate('manager_id', 'name email role')
      .sort(sortOptions);

    // Compute employee counts
    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const employee_count = await Employee.countDocuments({ department_id: dept._id });
        return {
          ...dept.toObject(),
          employee_count,
        };
      })
    );

    return res.status(200).json(departmentsWithCounts);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get department by ID
 * @route   GET /api/departments/:id
 * @access  Private
 */
const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate('manager_id', 'name email role');
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const employee_count = await Employee.countDocuments({ department_id: department._id });

    return res.status(200).json({
      ...department.toObject(),
      employee_count,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update department details
 * @route   PUT /api/departments/:id
 * @access  Private/Admin
 */
const updateDepartment = async (req, res, next) => {
  const { department_name, description, manager_id } = req.body;

  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Verify name uniqueness if changing
    if (department_name && department_name.toLowerCase() !== department.department_name.toLowerCase()) {
      const deptExists = await Department.findOne({ department_name: { $regex: new RegExp(`^${department_name}$`, 'i') } });
      if (deptExists) {
        return res.status(400).json({ error: 'Department name is already in use' });
      }
      department.department_name = department_name;
    }

    if (description !== undefined) {
      department.description = description;
    }

    // Verify manager assignment validation
    if (manager_id !== undefined) {
      if (manager_id === null || manager_id === '') {
        department.manager_id = null;
      } else {
        const managerUser = await User.findById(manager_id);
        if (!managerUser) {
          return res.status(400).json({ error: 'Manager user not found' });
        }
        if (managerUser.role !== 'Manager' && managerUser.role !== 'Admin') {
          return res.status(400).json({ error: 'Assigned manager must have a role of Manager or Admin' });
        }
        department.manager_id = manager_id;
      }
    }

    await department.save();

    // Populate and return updated department details
    const updatedDept = await Department.findById(department._id).populate('manager_id', 'name email role');

    return res.status(200).json({
      message: 'Department updated successfully',
      department: updatedDept,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete department (updates assigned employees department_id to null)
 * @route   DELETE /api/departments/:id
 * @access  Private/Admin
 */
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Cascade update: nullify department_id in matching Employees
    await Employee.updateMany({ department_id: department._id }, { $set: { department_id: null } });

    // Remove the department
    await Department.findByIdAndDelete(department._id);

    return res.status(200).json({
      message: 'Department deleted successfully. Affected employee associations have been nullified.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregate department statistics
 * @route   GET /api/departments/stats
 * @access  Private (Admin, Manager)
 */
const getDepartmentStats = async (req, res, next) => {
  try {
    // Run Mongo Aggregation to calculate totals and averages
    const stats = await Employee.aggregate([
      {
        $group: {
          _id: '$department_id',
          employee_count: { $sum: 1 },
          average_salary: { $avg: '$salary' },
          total_salary: { $sum: '$salary' },
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'deptInfo',
        },
      },
      {
        $unwind: {
          path: '$deptInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          department_id: '$_id',
          department_name: { $ifNull: ['$deptInfo.department_name', 'Unassigned'] },
          employee_count: 1,
          average_salary: { $round: ['$average_salary', 2] },
          total_salary: { $round: ['$total_salary', 2] },
        },
      },
    ]);

    return res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats,
};
