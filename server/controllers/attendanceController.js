
const Attendance = require("../models/Attendance");

exports.markAttendance = async (req, res) => {
  try {
    const { employeeId, date, status } = req.body;
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);

    const record = await Attendance.findOneAndUpdate(
      { employeeId, date: day },
      { employeeId, date: day, status },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ message: "Failed to mark attendance", error: err.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { employeeId, month, year } = req.query;
    const filter = {};

    if (employeeId) filter.employeeId = employeeId;

    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 1);
      filter.date = { $gte: start, $lt: end };
    }

    const records = await Attendance.find(filter).sort({ date: 1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attendance", error: err.message });
  }
};