import React, { useEffect, useState } from "react";
import { getEmployees } from "../api/employeeApi";
import { markAttendance } from "../api/attendanceApi";
import "./Attendance.css";

const today = new Date().toISOString().slice(0, 10);

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState(today);
  const [status, setStatus] = useState("present");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getEmployees().then((res) => setEmployees(res.data)).catch(() => {});
  }, []);

  const handleMark = async () => {
    if (!employeeId) {
      setError("Please select an employee.");
      return;
    }
    setError("");
    setMessage("");
    try {
      await markAttendance({ employeeId, date, status });
      setMessage(`Marked ${status} for ${date}.`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not mark attendance.");
    }
  };

  return (
    <div className="attendance">
      <div className="attendance__header">
        <p className="attendance__title">Attendance</p>
        <p className="attendance__subtitle">
          Marks a daily status per employee — Salary Slips read from these records automatically.
        </p>
      </div>

      {message && <div className="attendance__success">{message}</div>}
      {error && <div className="attendance__error">{error}</div>}

      <div className="attendance__form">
        <div className="form-field">
          <label>Employee</label>
          <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
            <option value="">Select employee</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp.employeeId}>
                {emp.employeeId} — {emp.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="form-field">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="present">Present</option>
            <option value="half-day">Half-day</option>
            <option value="absent">Absent</option>
          </select>
        </div>
        <button className="btn-primary" onClick={handleMark}>Mark attendance</button>
      </div>
    </div>
  );
}