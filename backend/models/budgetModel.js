const mongoose = require('mongoose');

const budgetSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    amount: {
      type: Number,
      required: [true, 'Please add a budget amount'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: [
        'Food',
        'Transportation',
        'Housing',
        'Utilities',
        'Entertainment',
        'Healthcare',
        'Shopping',
        'Education',
        'Personal Care',
        'Other',
      ],
    },
    paymentMethod: {
      type: String,
      enum: [
        'Cash',
        'Credit Card',
        'Debit Card',
        'Bank Transfer',
        'Mobile Payment',
        'Check',
        'Other'
      ],
      default: 'Other',
    },
    month: {
      type: Number,
      required: [true, 'Please add a month'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Please add a year'],
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index to ensure a user can only have one budget per category per month/year
budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema); 