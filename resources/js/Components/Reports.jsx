import React, { useState, useEffect } from "react";

const Reports = () => {
  const [fees, setFees] = useState([]);
  const [paymentType, setPaymentType] = useState("");
  const [reportType, setReportType] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rangeError, setRangeError] = useState(false);

  const [monthsOverdue, setMonthsOverdue] = useState(1);
  const [startMonth, setStartMonth] = useState(1);
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [endMonth, setEndMonth] = useState(new Date().getMonth() + 1);
  const [endYear, setEndYear] = useState(new Date().getFullYear());

  const [residentQuery, setResidentQuery] = useState("");
  const [residentResults, setResidentResults] = useState([]);
  const [selectedResident, setSelectedResident] = useState(null);

  const resetFilters = () => {
    setMonthsOverdue(1);
    setStartMonth(1);
    setStartYear(new Date().getFullYear());
    setEndMonth(new Date().getMonth() + 1);
    setEndYear(new Date().getFullYear());
    setResidentQuery("");
    setSelectedResident(null);
    setResidentResults([]);
    setData([]);
    setRangeError(false);
  };

  // Load fees
  useEffect(() => {
    fetch("/api/fees")
      .then(res => res.json())
      .then(json => setFees(Array.isArray(json.data) ? json.data : []))
      .catch(err => setFees([]));
  }, []);

  // Validate range
  useEffect(() => {
    if (startYear > endYear || (startYear === endYear && startMonth > endMonth)) {
      setRangeError(true);
    } else {
      setRangeError(false);
    }
  }, [startMonth, startYear, endMonth, endYear]);

  // Fetch residents for autocomplete
  useEffect(() => {
    if (!residentQuery) {
      setResidentResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetch(`/api/reports/search-residents?search=${residentQuery}`)
        .then(res => res.json())
        .then(json => setResidentResults(Array.isArray(json.data) ? json.data : []))
        .catch(err => setResidentResults([]));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [residentQuery]);

  const fetchReport = async () => {
    if (!paymentType || !reportType || rangeError) return;
    if (reportType === "paymentsByResident" && !selectedResident) return;

    setLoading(true);
    let url = "";

    switch (reportType) {
      case "debtors":
        url = `/api/reports/debtors?months=${monthsOverdue}&payment_type=${paymentType}&start_month=${startMonth}&start_year=${startYear}&end_month=${endMonth}&end_year=${endYear}`;
        break;
      case "paymentsByResident":
        url = `/api/reports/payments-by-resident?payment_type=${paymentType}&resident_id=${selectedResident.id}&start_month=${startMonth}&start_year=${startYear}&end_month=${endMonth}&end_year=${endYear}`;
        break;
      case "incomeByMonth":
        url = `/api/reports/income-by-month?year=${endYear}&payment_type=${paymentType}`;
        break;
      default:
        break;
    }

    try {
      const res = await fetch(url, { credentials: "include" });
      const json = await res.json();
      setData(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      console.error("Error fetching report:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [paymentType, reportType, monthsOverdue, startMonth, startYear, endMonth, endYear, rangeError, selectedResident]);

  const totalOverdue = Number(
    data.reduce((sum, item) => sum + Number(item.total || item.amount || 0), 0)
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Reports</h1>

      <div className="mb-4">
        <label className="mr-2">Select Payment Type:</label>
        <select
          value={paymentType}
          onChange={(e) => { setPaymentType(e.target.value); setReportType(""); resetFilters(); }}
          className="border p-1"
        >
          <option value="">-- Choose Payment Type --</option>
          {fees.map(fee => <option key={fee.id} value={fee.name}>{fee.name}</option>)}
        </select>
      </div>

      {paymentType && (
        <div className="mb-4">
          <label className="mr-2">Select Report:</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border p-1"
          >
            <option value="">-- Choose Report --</option>
            <option value="debtors">Residents with overdue payments</option>
            <option value="paymentsByResident">Payments by resident</option>
            <option value="incomeByMonth">Income by month</option>
          </select>
        </div>
      )}

      {/* Autocomplete input */}
      {reportType === "paymentsByResident" && (
        <div className="mb-4 relative">
          <label>Resident:</label>
          <input
            type="text"
            value={residentQuery}
            onChange={e => { setResidentQuery(e.target.value); setSelectedResident(null); }}
            placeholder="Type to search resident..."
            className="border p-1 w-full"
          />
          {residentResults.length > 0 && !selectedResident && (
            <ul className="absolute border bg-white w-full z-10 max-h-40 overflow-y-auto">
              {residentResults.map(res => (
                <li
                  key={res.id}
                  className="p-1 hover:bg-gray-200 cursor-pointer"
                  onClick={() => { setSelectedResident(res); setResidentQuery(`${res.name} ${res.last_name}`); setResidentResults([]); }}
                >
                  {res.name} {res.last_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Date filters */}
      {(reportType === "debtors" || (reportType === "paymentsByResident" && selectedResident)) && (
        <div className="mb-4">
          {rangeError && (
            <div className="alert alert-danger text-center" role="alert">
              Invalid range: "From" must be before "Until"
            </div>
          )}

          <div className="d-flex flex-wrap gap-2 align-items-center">
            {reportType === "debtors" && (
              <>
                <label>Months overdue (min):</label>
                <input
                  type="number"
                  min={1}
                  value={monthsOverdue}
                  onChange={e => setMonthsOverdue(parseInt(e.target.value))}
                  className="border p-1"
                />
              </>
            )}

            <label>From Month:</label>
            <select value={startMonth} onChange={e => setStartMonth(parseInt(e.target.value))} className="border p-1">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('en', { month: 'long' })}</option>
              ))}
            </select>

            <label>From Year:</label>
            <select value={startYear} onChange={e => setStartYear(parseInt(e.target.value))} className="border p-1">
              {Array.from({ length: 11 }, (_, i) => {
                const year = new Date().getFullYear() - 5 + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>

            <label>Until Month:</label>
            <select value={endMonth} onChange={e => setEndMonth(parseInt(e.target.value))} className="border p-1">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('en', { month: 'long' })}</option>
              ))}
            </select>

            <label>Until Year:</label>
            <select value={endYear} onChange={e => setEndYear(parseInt(e.target.value))} className="border p-1">
              {Array.from({ length: 11 }, (_, i) => {
                const year = new Date().getFullYear() - 5 + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>
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
                <th className="border p-2">Payment Date</th>
                <th className="border p-2">Amount</th>
              </>}
              {reportType === "paymentsByResident" && <>
                <th className="border p-2">Resident</th>
                <th className="border p-2">Street & Number</th>
                <th className="border p-2">Payment Type</th>
                <th className="border p-2">Payment Date</th>
                <th className="border p-2">Amount</th>
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
                      <td className="border p-2">{formatDate(item.last_payment_date)}</td>
                      <td className="border p-2">{Number(item.total || 0).toFixed(2)}</td>
                    </>}
                    {reportType === "paymentsByResident" && <>
                      <td className="border p-2">{item.name} {item.last_name}</td>
                      <td className="border p-2">{item.street} {item.street_number}</td>
                      <td className="border p-2">{item.fee_name}</td>
                      <td className="border p-2">{formatDate(item.payment_date)}</td>
                      <td className="border p-2">{Number(item.amount || 0).toFixed(2)}</td>
                    </>}
                    {reportType === "incomeByMonth" && <>
                      <td className="border p-2">{item.month}</td>
                      <td className="border p-2">{Number(item.total || 0).toFixed(2)}</td>
                    </>}
                  </tr>
                ))}
                {(reportType === "debtors" || reportType === "paymentsByResident") && (
                  <tr className="font-bold bg-gray-100">
                    <td colSpan={reportType === "debtors" ? 5 : 4} className="border p-2 text-right">Total:</td>
                    <td className="border p-2">{totalOverdue.toFixed(2)}</td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Reports;
