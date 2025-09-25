import React, { useState, useEffect } from "react";

const Reports = () => {
  const [fees, setFees] = useState([]);
  const [paymentType, setPaymentType] = useState("");
  const [reportType, setReportType] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [monthsOverdue, setMonthsOverdue] = useState(1);
  const [endMonth, setEndMonth] = useState(new Date().getMonth() + 1);
  const [endYear, setEndYear] = useState(new Date().getFullYear());

  const resetFilters = () => {
    setMonthsOverdue(1);
    setEndMonth(new Date().getMonth() + 1);
    setEndYear(new Date().getFullYear());
    setData([]);
  };

  // Load fees
  useEffect(() => {
    fetch("/api/fees")
      .then(res => res.json())
      .then(json => setFees(json.data || []))
      .catch(err => console.error("Error fetching fees:", err));
  }, []);

  const fetchReport = async () => {
    if (!paymentType || !reportType) return;

    setLoading(true);
    let url = "";

    switch (reportType) {
      case "debtors":
        url = `/api/reports/debtors?months=${monthsOverdue}&payment_type=${paymentType}&end_month=${endMonth}&end_year=${endYear}`;
        break;
      case "paymentsByDate":
        url = `/api/reports/payments-by-date?start_date=${endYear}-01-01&end_date=${endYear}-12-31&payment_type=${paymentType}`;
        break;
      case "incomeByMonth":
        url = `/api/reports/income-by-month?year=${endYear}&payment_type=${paymentType}`;
        break;
      default:
        break;
    }

    try {
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
      });
      const json = await res.json();
      setData(Array.isArray(json.data) ? json.data : []);
    } catch (error) {
      console.error("Error fetching report:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [paymentType, reportType, monthsOverdue, endMonth, endYear]);

  // Calcular total general de overdue
  const totalOverdue = data.reduce((sum, item) => sum + (item.total || 0), 0);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Reports</h1>

      <div className="mb-4">
        <label className="mr-2">Select Payment Type:</label>
        <select
          value={paymentType}
          onChange={(e) => {
            setPaymentType(e.target.value);
            setReportType("");
            resetFilters();
          }}
          className="border p-1"
        >
          <option value="">-- Choose Payment Type --</option>
          {fees.map(fee => (
            <option key={fee.id} value={fee.name}>{fee.name}</option>
          ))}
        </select>
      </div>

      {paymentType && (
        <>
          <div className="mb-4">
            <label className="mr-2">Select Report:</label>
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                resetFilters();
              }}
              className="border p-1"
            >
              <option value="">-- Choose Report --</option>
              <option value="debtors">Residents with overdue payments</option>
              <option value="paymentsByDate">Payments by date</option>
              <option value="incomeByMonth">Income by month</option>
            </select>
          </div>

          {/* Filters */}
          {reportType === "debtors" && (
            <div className="mb-4 space-x-2">
              <label>Months overdue (min):</label>
              <input
                type="number"
                min={1}
                value={monthsOverdue}
                onChange={e => setMonthsOverdue(e.target.value)}
                className="border p-1"
              />
              <label>Up to Month:</label>
              <select
                value={endMonth}
                onChange={e => setEndMonth(e.target.value)}
                className="border p-1"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('en', { month: 'long' })}</option>
                ))}
              </select>
              <label>Year:</label>
              <input
                type="number"
                value={endYear}
                onChange={e => setEndYear(e.target.value)}
                className="border p-1"
              />
            </div>
          )}

          {/* Table */}
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="border-collapse border w-full">
              <thead>
                <tr>
                  {reportType === "debtors" && <>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Last Name</th>
                    <th className="border p-2">Street & Number</th>
                    <th className="border p-2">Months Owed</th>
                    <th className="border p-2">Total</th>
                  </>}
                  {reportType === "paymentsByDate" && <>
                    <th className="border p-2">Resident</th>
                    <th className="border p-2">Fee</th>
                    <th className="border p-2">Amount</th>
                    <th className="border p-2">Payment Date</th>
                  </>}
                  {reportType === "incomeByMonth" && <>
                    <th className="border p-2">Month</th>
                    <th className="border p-2">Total Income</th>
                  </>}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center p-2">No data available</td>
                  </tr>
                ) : (
                  <>
                    {data.map((item, idx) => (
                      <tr key={idx}>
                        {reportType === "debtors" && <>
                          <td className="border p-2">{item.name}</td>
                          <td className="border p-2">{item.last_name}</td>
                          <td className="border p-2">{item.street} {item.street_number}</td>
                          <td className="border p-2">{item.months_overdue}</td>
                          <td className="border p-2">{item.total.toFixed(2)}</td>
                        </>}
                        {reportType === "paymentsByDate" && <>
                          <td className="border p-2">{item.resident?.name || "N/A"}</td>
                          <td className="border p-2">{item.fee?.name || "N/A"}</td>
                          <td className="border p-2">{item.amount}</td>
                          <td className="border p-2">{item.payment_date}</td>
                        </>}
                        {reportType === "incomeByMonth" && <>
                          <td className="border p-2">{item.month}</td>
                          <td className="border p-2">{item.total}</td>
                        </>}
                      </tr>
                    ))}
                    {/* Total row */}
                    {reportType === "debtors" && (
                      <tr className="font-bold bg-gray-100">
                        <td colSpan={4} className="border p-2 text-right">Total Overdue:</td>
                        <td className="border p-2">{totalOverdue.toFixed(2)}</td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
