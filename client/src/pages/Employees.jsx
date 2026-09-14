import React, { useEffect, useState } from "react";
import { getEmployees, addEmployee, deleteEmployee } from "../api/employeeApi";
import "./Employees.css";

const emptyForm = {
  employeeId: "",
  name: "",
  designation: "",
  department: "",
  basicSalary: "",
  aadharNumber: "",
  panNumber: "",
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
  bankName: "",
  hra: "",
  transportation: "",
  otherAllowance: "",
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data);
    } catch (err) {
      setError("Could not load employees. Check that the server is running.");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async () => {
    if (!form.employeeId || !form.name || !form.designation || !form.department || !form.basicSalary) {
      setError("Employee ID, Name, Designation, Department,   and Basic Salary are required.");
      return;
    }
    try {
      await addEmployee({
        employeeId: form.employeeId,
        name: form.name,
        designation: form.designation,
        department: form.department,
        basicSalary: Number(form.basicSalary),
        aadharNumber: form.aadharNumber ,
        panNumber: form.panNumber ,
        bankDetails: {
          accountHolderName: form.accountHolderName ,
          accountNumber: form.accountNumber ,
          ifscCode: form.ifscCode ,
          bankName: form.bankName ,
        },
        hra: form.hra ? Number(form.hra) : 0,
        transportation: form.transportation ? Number(form.transportation) : 0,
        otherAllowance: form.otherAllowance ? Number(form.otherAllowance) : 0,
      });
      setForm(emptyForm);
      setError("");
      setShowForm(false);
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add employee.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    await deleteEmployee(id);
    fetchEmployees();
  };

  return (
    <div className="employees">
      <div className="employees__header">
        <div>
          <p className="employees__title">Employees</p>
          <p className="employees__subtitle">{employees.length} employees on record</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close" : "+ Add employee"}
        </button>
      </div>

      {error && <div className="employees__error">{error}</div>}

      {showForm && (
        <div className="employees__form-card">
          <p className="employees__section-title">Basic details</p>
          <div className="employees__form-grid">
            <div className="form-field">
              <label>Employee ID *</label>
              <input name="employeeId" value={form.employeeId} onChange={handleChange} placeholder="EMP-014" />
            </div>
            <div className="form-field">
              <label>Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Amit Sharma" />
            </div>
            <div className="form-field">
              <label>Designation *</label>
              <input name="designation" value={form.designation} onChange={handleChange} placeholder="Head Chef" />
            </div>
             <div className="form-field">
              <label>Department *</label>
              <input name="department" value={form.department} onChange={handleChange} placeholder=" Staff" />
            </div>
            <div className="form-field">
              <label>Basic Salary *</label>
              <input name="basicSalary" type="number" value={form.basicSalary} onChange={handleChange} placeholder="30000" />
            </div>
          </div>

          <p className="employees__section-title">Identity documents (optional)</p>
          <div className="employees__form-grid">
            <div className="form-field">
              <label>Aadhar Number</label>
              <input name="aadharNumber" value={form.aadharNumber} onChange={handleChange} placeholder="123456789012" maxLength={12} />
            </div>
            <div className="form-field">
              <label>PAN Number</label>
              <input name="panNumber" value={form.panNumber} onChange={handleChange} placeholder="ABCDE1234F" maxLength={10} style={{ textTransform: "uppercase" }} />
            </div>
          </div>

          <p className="employees__section-title">Bank details (optional)</p>
          <div className="employees__form-grid">
            <div className="form-field">
              <label>Account Holder Name</label>
              <input name="accountHolderName" value={form.accountHolderName} onChange={handleChange} placeholder="Same as employee name" />
            </div>
            <div className="form-field">
              <label>Account Number</label>
              <input name="accountNumber" value={form.accountNumber} onChange={handleChange} placeholder="1234567890" />
            </div>
            <div className="form-field">
              <label>IFSC Code</label>
              <input name="ifscCode" value={form.ifscCode} onChange={handleChange} placeholder="SBIN0001234" style={{ textTransform: "uppercase" }} />
            </div>
            <div className="form-field">
              <label>Bank Name</label>
              <input name="bankName" value={form.bankName} onChange={handleChange} placeholder="State Bank of India" />
            </div>
          </div>

          <p className="employees__section-title">Monthly allowances (optional — leave blank if not applicable)</p>
          <div className="employees__form-grid">
            <div className="form-field">
              <label>HRA</label>
              <input name="hra" type="number" value={form.hra} onChange={handleChange} placeholder="0" />
            </div>
            <div className="form-field">
              <label>Transportation</label>
              <input name="transportation" type="number" value={form.transportation} onChange={handleChange} placeholder="0" />
            </div>
            <div className="form-field">
              <label>Other Allowance</label>
              <input name="otherAllowance" type="number" value={form.otherAllowance} onChange={handleChange} placeholder="0" />
            </div>
          </div>

          <button className="btn-primary" onClick={handleAdd} style={{ marginTop: 8 }}>
            Save employee
          </button>
        </div>
      )}

      <div className="employees__table-wrap">
        <table className="employees__table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Designation</th>
              <th>Basic Salary</th>
              <th>Allowances</th>
              <th>Bank</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 && (
              <tr><td colSpan="7">No employees yet — add one above.</td></tr>
            )}
            {employees.map((emp) => {
              const totalAllowance = (emp.hra || 0) + (emp.transportation || 0) + (emp.otherAllowance || 0);
              return (
                <tr key={emp._id}>
                  <td className="emp-id">{emp.employeeId}</td>
                  <td>{emp.name}</td>
                  <td>{emp.designation}</td>
                  <td>₹{emp.basicSalary.toLocaleString()}</td>
                  <td>{totalAllowance > 0 ? `₹${totalAllowance.toLocaleString()}` : "—"}</td>
                  <td>{emp.bankDetails?.bankName || "—"}</td>
                  <td>
                    <button onClick={() => handleDelete(emp._id)} style={{ border: "none", background: "none", color: "#dc2626", cursor: "pointer", fontSize: 13 }}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}