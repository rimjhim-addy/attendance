import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Employees from "./pages/Employees";
import SalarySlip from "./pages/SalarySlip";
import Attendance from "./pages/Attendance";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/employees" element={<Employees />} />
        <Route path="/salary-slips" element={<SalarySlip />} />
        <Route path="/attendance" element={<Attendance />} />

        <Route path="/" element={<Navigate to="/employees" />} />
      </Routes>
    </BrowserRouter>
  );
}