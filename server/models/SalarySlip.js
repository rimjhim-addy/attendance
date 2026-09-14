const mongoose = require("mongoose");

const salarySlipSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, trim: true },
    employeeName: { type: String, required: true },
    designation: { type: String, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    totalDaysInMonth: { type: Number, required: true },
    daysWorked: { type: Number, required: true },
    basicSalary: { type: Number, required: true },
    perDaySalary: { type: Number, required: true },
    earnedBasic: { type: Number, required: true },

    hra: { type: Number, default: 0 },
    transportation: { type: Number, default: 0 },
    otherAllowance: { type: Number, default: 0 },

    // NEW — identity & bank details, copied from Employee at generation time
    aadharNumber: { type: String, trim: true },
    panNumber: { type: String, trim: true },
    bankDetails: {
      accountHolderName: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      ifscCode: { type: String, trim: true },
      bankName: { type: String, trim: true },
    },

    grossEarnings: { type: Number, required: true },
    pf: { type: Number, required: true },
    netPay: { type: Number, required: true },
  },
  { timestamps: { createdAt: "generatedAt", updatedAt: false } }
);

module.exports = mongoose.model("SalarySlip", salarySlipSchema);