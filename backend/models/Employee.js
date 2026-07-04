const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    employee_code: {
      type: String,
      required: [true, 'Employee code is required'],
      unique: true,
      trim: true,
    },
    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    joining_date: {
      type: Date,
      required: [true, 'Joining date is required'],
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [0, 'Salary cannot be negative'],
      default: 0,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    profile_image: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      required: [true, 'Employee status is required'],
      enum: {
        values: ['Active', 'Inactive', 'Terminated'],
        message: '{VALUE} is not a valid employee status',
      },
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Employee', EmployeeSchema);
