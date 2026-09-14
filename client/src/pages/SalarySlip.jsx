import React, { useEffect, useState } from "react";
import { getEmployees } from "../api/employeeApi";
import { calculateSlip, generateSlip, getSlips } from "../api/salarySlipApi";
import companyLogo from "../components/images.png";
import "./SalarySlip.css";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
const years = [currentYear, currentYear - 1, currentYear - 2];

const money = (val) => (val || 0).toLocaleString();

export default function SalarySlip() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(currentYear);

  const [preview, setPreview] = useState(null);
  const [savedSlip, setSavedSlip] = useState(null);
  const [pastSlips, setPastSlips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getEmployees().then((res) => setEmployees(res.data)).catch(() => {});
    fetchPastSlips();
  }, []);

  const fetchPastSlips = async () => {
    try {
      const res = await getSlips();
      setPastSlips(res.data);
    } catch (err) {}
  };

  const handlePreview = async () => {
    if (!employeeId) {
      setError("Please select an employee.");
      return;
    }
    setError("");
    setSavedSlip(null);
    setLoading(true);
    try {
      const res = await calculateSlip({ employeeId, month, year });
      setPreview(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not calculate salary.");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateSlip({ employeeId, month, year });
      setSavedSlip(res.data);
      setPreview(null);
      fetchPastSlips();
    } catch (err) {
      setError(err.response?.data?.message || "Could not generate slip.");
    } finally {
      setLoading(false);
    }
  };

  const displaySlip = savedSlip || preview;

  // Earnings rows (only these are summed into Gross Earnings)
  const earningsRows = displaySlip
    ? [
        { label: `Earned Basic (${displaySlip.daysWorked} days)`, amount: displaySlip.earnedBasic },
        ...(displaySlip.hra > 0 ? [{ label: "HRA", amount: displaySlip.hra }] : []),
        ...(displaySlip.transportation > 0 ? [{ label: "Transportation Allowance", amount: displaySlip.transportation }] : []),
        ...(displaySlip.otherAllowance > 0 ? [{ label: "Other Allowance", amount: displaySlip.otherAllowance }] : []),
      ]
    : [];

  // PF Deduction row is only included when PF is a real, positive amount.
  // If PF is 0 / null / undefined / blank, the row (and the whole
  // deduction) simply doesn't exist — deductions column stays clean.
  const deductionRows = displaySlip && Number(displaySlip.pf) > 0
    ? [{ label: "PF Deduction", amount: displaySlip.pf }]
    : [];

  const totalDeductions = deductionRows.reduce((sum, d) => sum + Number(d.amount || 0), 0);

  const rowDiff = earningsRows.length - deductionRows.length;

  return (
    <div className="salary">
      <div className="salary__header">
        <div>
          <p className="salary__title">Salary slips</p>
        </div>
      </div>

      <div className="salary__generate-section">
        <p className="salary__section-title">Generate salary slip</p>
        <div className="salary__form-row">
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
            <label>Month</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {months.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Year</label>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button className="btn-primary" onClick={handlePreview} disabled={loading}>
            {loading ? "Calculating…" : "Calculate"}
          </button>
        </div>
      </div>

      {error && <div className="salary__error">{error}</div>}

      {displaySlip && (
        <div className="slip-preview">
          {!savedSlip && (
            <div className={`slip-preview__banner ${preview?.isNegative ? "warning" : ""}`}>
              {preview?.isNegative
                ? "⚠ Net pay is negative — please check attendance data before generating this slip."
                : "This is a preview. Nothing is saved yet — review the numbers, then confirm."}
            </div>
          )}
          {savedSlip && (
            <div className="slip-preview__banner">
              ✓ Slip generated and saved permanently. This record cannot be edited.
            </div>
          )}

          <div className="slip" id="slip-to-print">
            {/* Company header */}
            <div className="slip__company">
              <div className="slip__company-row">
                <div className="slip__logo">
                  <img src={companyLogo} alt="Company Logo" />
                </div>
                <div>
                  <p className="slip__company-name">{displaySlip.companyName || "Addymize"}</p>
                  <p className="slip__company-address">{displaySlip.companyAddress || "Logix Technova Sector 134"}</p>
                </div>
                <div className="slip__company-meta">
                  <p className="slip__company-tag">Salary Slip</p>
                  <p className="slip__company-month">{months[displaySlip.month - 1]} {displaySlip.year}</p>
                </div>
              </div>
            </div>

            {/* Employee meta */}
            <div className="slip__meta-grid">
              <div className="slip__meta-item">
                <span className="slip__meta-label">Employee Name</span>
                <span className="slip__meta-value">{displaySlip.employeeName}</span>
              </div>
              <div className="slip__meta-item">
                <span className="slip__meta-label">Employee ID</span>
                <span className="slip__meta-value">{displaySlip.employeeId}</span>
              </div>
              <div className="slip__meta-item">
                <span className="slip__meta-label">Designation</span>
                <span className="slip__meta-value">{displaySlip.designation}</span>
              </div>
              <div className="slip__meta-item">
                <span className="slip__meta-label">Department</span>
                <span className="slip__meta-value">{displaySlip.department}</span>
              </div>
              <div className="slip__meta-item">
                <span className="slip__meta-label">Days Worked</span>
                <span className="slip__meta-value">{displaySlip.daysWorked} / {displaySlip.totalDaysInMonth}</span>
              </div>

              {/* Basic Salary & Per Day Salary are reference info only —
                  kept out of the earnings table so they never get
                  double-counted against Earned Basic. */}
              <div className="slip__meta-item">
                <span className="slip__meta-label">Basic Salary</span>
                <span className="slip__meta-value">₹{money(displaySlip.basicSalary)}</span>
              </div>

              {displaySlip.panNumber && (
                <div className="slip__meta-item">
                  <span className="slip__meta-label">PAN Number</span>
                  <span className="slip__meta-value">{displaySlip.panNumber}</span>
                </div>
              )}
              {displaySlip.aadharNumber && (
                <div className="slip__meta-item">
                  <span className="slip__meta-label">Aadhar Number</span>
                  <span className="slip__meta-value">
                    XXXX-XXXX-{displaySlip.aadharNumber.slice(-4)}
                  </span>
                </div>
              )}
            </div>

            {/* Bank account */}
            {(displaySlip.bankDetails?.bankName || displaySlip.bankDetails?.accountNumber) && (
              <div className="slip__bank">
                <span className="slip__meta-label">Bank account</span>
                <span className="slip__meta-value">
                  {displaySlip.bankDetails?.bankName}
                  {displaySlip.bankDetails?.accountNumber &&
                    ` · XXXXXX${displaySlip.bankDetails.accountNumber.slice(-4)}`}
                  {displaySlip.bankDetails?.ifsc && ` · IFSC ${displaySlip.bankDetails.ifsc}`}
                </span>
              </div>
            )}

            {/* Earnings / Deductions side by side */}
            <div className="slip__columns">
              <div className="slip__column">
                <div className="slip__column-header">
                  <span>Earnings</span>
                  <span>Amount</span>
                </div>
                {earningsRows.map((e) => (
                  <div className="slip__row" key={e.label}>
                    <span>{e.label}</span>
                    <span className="amount">₹{money(e.amount)}</span>
                  </div>
                ))}
                {rowDiff < 0 &&
                  Array.from({ length: -rowDiff }).map((_, i) => (
                    <div className="slip__row slip__row--spacer" key={`sp-e-${i}`}>&nbsp;</div>
                  ))}
                <div className="slip__row slip__row--total">
                  <span>Gross Earnings</span>
                  <span className="amount">₹{money(displaySlip.grossEarnings ?? displaySlip.earnedBasic)}</span>
                </div>
              </div>

              <div className="slip__column">
                <div className="slip__column-header">
                  <span>Deductions</span>
                  <span>Amount</span>
                </div>
                {deductionRows.map((d) => (
                  <div className="slip__row slip__row--deduction" key={d.label}>
                    <span>{d.label}</span>
                    <span className="amount">− ₹{money(d.amount)}</span>
                  </div>
                ))}
                {rowDiff > 0 &&
                  Array.from({ length: rowDiff }).map((_, i) => (
                    <div className="slip__row slip__row--spacer" key={`sp-d-${i}`}>&nbsp;</div>
                  ))}
                {deductionRows.length > 0 && (
                  <div className="slip__row slip__row--total">
                    <span>Total Deductions</span>
                    <span className="amount">₹{money(totalDeductions)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="slip__net-pay">
              <span className="slip__net-pay-label">NET PAY</span>
              <span className="slip__net-pay-value">₹{money(displaySlip.netPay)}</span>
            </div>

            <br />
            <br />

            <div className="slip__footer">
              <p>This is a computer-generated payslip and does not require a signature.</p>
              <div className="slip__signatory">
                <div className="slip__signatory-line" />
                <span>Authorised signatory</span>
              </div>
            </div>
          </div>

          {!savedSlip && (
            <div className="slip__actions">
              <button className="btn-primary" onClick={handleConfirmGenerate} disabled={loading}>
                {loading ? "Saving…" : "Confirm & Generate Slip"}
              </button>
              <button className="btn-ghost" onClick={() => setPreview(null)}>
                Cancel
              </button>
            </div>
          )}
          {savedSlip && (
            <div className="slip__actions">
              <button className="btn-primary" onClick={() => window.print()}>
                Print / Download
              </button>
              <button className="btn-ghost" onClick={() => setSavedSlip(null)}>
                Close
              </button>
            </div>
          )}
        </div>
      )}

      <div className="salary__list-section">
        <p className="salary__section-title">Previously generated slips</p>

        {pastSlips.length === 0 && (
          <div className="salary__empty">No salary slips generated yet.</div>
        )}

        {pastSlips.map((s) => (
          <div
            className="slip-row"
            key={s._id}
            onClick={() => { setSavedSlip(s); setPreview(null); }}
          >
            <div>
              <p className="slip-row__name">{s.employeeName} · {s.employeeId}</p>
              <p className="slip-row__meta">{months[s.month - 1]} {s.year} · {s.daysWorked}/{s.totalDaysInMonth} days</p>
            </div>
            <span className="slip-row__net">₹{money(s.netPay)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
