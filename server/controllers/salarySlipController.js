const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const SalarySlip = require("../models/SalarySlip");

const PF_RATE = 0.01;

async function calculatePay(employeeId, month, year) {
  const employee = await Employee.findOne({ employeeId });
  if (!employee) {
    const err = new Error("Employee not found for this Employee ID");
    err.statusCode = 404;
    throw err;
  }

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  const totalDaysInMonth = new Date(year, month, 0).getDatgit e();

  const attendanceRecords = await Attendance.find({
    employeeId,
    date: { $gte: start, $lt: end },
  });

  const fullDays = attendanceRecords.filter((r) => r.status === "present").length;
  const halfDays = attendanceRecords.filter((r) => r.status === "half-day").length;
  const daysWorked = fullDays + halfDays * 0.5;

  const perDaySalary = employee.basicSalary / totalDaysInMonth;
  const earnedBasic = perDaySalary * daysWorked;

  const hra = employee.hra || 0;
  const transportation = employee.transportation || 0;
  const otherAllowance = employee.otherAllowance || 0;

  const grossEarnings = earnedBasic + hra + transportation + otherAllowance;
  const pf = Math.round(employee.basicSalary * PF_RATE);
  const netPay = Math.round(grossEarnings - pf);

  return {
    employeeId: employee.employeeId,
    employeeName: employee.name,
    designation: employee.designation,
    month,
    year,
    totalDaysInMonth,
    daysWorked,
    basicSalary: employee.basicSalary,
    perDaySalary: Math.round(perDaySalary),
    earnedBasic: Math.round(earnedBasic),
    hra: Math.round(hra),
    transportation: Math.round(transportation),
    otherAllowance: Math.round(otherAllowance),

    aadharNumber: employee.aadharNumber || "",
    panNumber: employee.panNumber || "",
    bankDetails: employee.bankDetails || {},

    grossEarnings: Math.round(grossEarnings),
    pf,
    netPay,
    isNegative: netPay < 0,
  };
}

exports.calculateSlip = async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;
    const result = await calculatePay(employeeId, Number(month), Number(year));
    res.json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

exports.generateSlip = async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;
    const result = await calculatePay(employeeId, Number(month), Number(year));
    delete result.isNegative;

    const slip = new SalarySlip(result);
    const saved = await slip.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

exports.getSlips = async (req, res) => {
  try {
    const slips = await SalarySlip.find().sort({ generatedAt: -1 });
    res.json(slips);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch salary slips", error: err.message });
  }
};

exports.getSlipById = async (req, res) => {
  try {
    const slip = await SalarySlip.findById(req.params.id);
    if (!slip) return res.status(404).json({ message: "Slip not found" });
    res.json(slip);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch slip", error: err.message });
  }
};