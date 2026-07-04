const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee ID is required'],
    },
    month: {
      type: Number,
      required: [true, 'Month is required'],
      min: [1, 'Month must be between 1 and 12'],
      max: [12, 'Month must be between 1 and 12'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    basic_salary: {
      type: Number,
      required: [true, 'Basic salary is required'],
      min: [0, 'Basic salary cannot be negative'],
    },
    bonus: {
      type: Number,
      default: 0,
      min: [0, 'Bonus cannot be negative'],
    },
    deduction: {
      type: Number,
      default: 0,
      min: [0, 'Deduction cannot be negative'],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative'],
    },
    pf: {
      type: Number,
      default: 0,
      min: [0, 'PF cannot be negative'],
    },
    net_salary: {
      type: Number,
      required: [true, 'Net salary is required'],
      min: [0, 'Net salary cannot be negative'],
    },
    generated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique compound index for employee_id, month, and year
PayrollSchema.index({ employee_id: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', PayrollSchema);
