const mongoose = require('mongoose');

const LeaveRequestSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee ID is required'],
    },
    leave_type: {
      type: String,
      required: [true, 'Leave type is required'],
      enum: {
        values: ['Casual', 'Sick', 'Maternity', 'Paternity', 'Unpaid'],
        message: '{VALUE} is not a valid leave type',
      },
    },
    start_date: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    end_date: {
      type: Date,
      required: [true, 'End date is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
    },
    status: {
      type: String,
      required: [true, 'Leave status is required'],
      enum: {
        values: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
        message: '{VALUE} is not a valid leave status',
      },
      default: 'Pending',
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Validator to check dates order
LeaveRequestSchema.pre('validate', function (next) {
  if (this.start_date && this.end_date && this.end_date < this.start_date) {
    this.invalidate('end_date', 'End date must be greater than or equal to start date');
  }
  next();
});

module.exports = mongoose.model('LeaveRequest', LeaveRequestSchema);
