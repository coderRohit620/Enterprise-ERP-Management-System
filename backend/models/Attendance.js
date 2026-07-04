const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee ID is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    check_in: {
      type: Date,
      default: null,
    },
    check_out: {
      type: Date,
      default: null,
    },
    working_hours: {
      type: Number,
      default: 0,
      min: [0, 'Working hours cannot be negative'],
    },
    status: {
      type: String,
      required: [true, 'Attendance status is required'],
      enum: {
        values: ['Present', 'Absent', 'Late', 'Half Day'],
        message: '{VALUE} is not a valid attendance status',
      },
      default: 'Present',
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique compound index for employee_id and date
AttendanceSchema.index({ employee_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
