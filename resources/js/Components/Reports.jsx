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

  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

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
    setSelectedMonth(null);
    setSelectedYear(null);
  };

  // Load fees
  useEffect(() => {
    fetch("/api/fees")
      .then(res => res.json())
      .then(json => setFees(Array.isArray(json.data) ? json.data : []))
      .catch(() => setFees([]));
  }, []);

  // Load available years for incomeByMonth
  useEffect(() => {
    if (reportType === "incomeByMonth") {
      fetch("/api/reports/available-years")
        .then(res => res.json())
        .then(json => {
          if (Array.isArray(json.data) && json.data.length > 0) {
            const years = json.data.map(y => parseInt(y));
            setAvailableYears(years);
            setSelectedYear(years[0]);
          } else {
            setAvailableYears([]);
            setSelectedYear(null);
          }
        })
        .catch(() => {
          setAvailableYears([]);
          setSelectedYear(null);
        });
    }
  }, [reportType]);

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
        .catch(() => setResidentResults([]));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [residentQuery]);

  // Fetch report
  const fetchReport = async () => {
    if (!paymentType || !reportType || rangeError) return;
    if (reportType === "paymentsByResident" && !selectedResident) return;
    if (reportType === "incomeByMonth" && !selectedYear) return;

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
        url = `/api/reports/income-by-month?payment_type=${paymentType}&year=${selectedYear}`;
        if (selectedMonth) url += `&month=${selectedMonth}`;
        break;
      default:
        break;
    }

    try {
      const res = await fetch(url, { credentials: "include" });
      const json = await res.json();
      // Filtramos posibles filas duplicadas de total del backend
      const filteredData = Array.isArray(json.data)
        ? json.data.filter(row => row.name !== "Total" && row.total !== "Total")
        : [];
      setData(filteredData);
    } catch (err) {
      console.error("Error fetching report:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [
    paymentType,
    reportType,
    monthsOverdue,
    startMonth,
    startYear,
    endMonth,
    endYear,
    rangeError,
    selectedResident,
    selectedMonth,
    selectedYear
  ]);

  const totalAmount = Number(
    data.reduce((sum, item) => sum + Number(item.total || item.amount || 0), 0)
  );

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Reports</h1>

      {/* Payment Type */}
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
          {fees.map(fee => <option key={fee.id} value={fee.name}>{fee.name}</option>)}
        </select>
      </div>

      {/* Report Type */}
      {paymentType && (
        <div className="mb-4">
          <label className="mr-2">Select Report:</label>
          <select
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value);
              setData([]);
              if (e.target.value !== "paymentsByResident") {
                setSelectedResident(null);
                setResidentQuery("");
              }
            }}
            className="border p-1"
          >
            <option value="">-- Choose Report --</option>
            <option value="debtors">Residents with overdue payments</option>
            <option value="paymentsByResident">Payments by resident</option>
            <option value="incomeByMonth">Income by month</option>
          </select>
        </div>
      )}

      {/* Resident autocomplete */}
      {reportType === "paymentsByResident" && (
        <div className="mb-4 relative">
          <label>Resident:</label>
          <input
            type="text"
            value={residentQuery}
            onChange={e => {
              setResidentQuery(e.target.value);
              setSelectedResident(null);
              setData([]);
            }}
            placeholder="Type to search resident..."
            className="border p-1 w-full"
          />
          {residentResults.length > 0 && !selectedResident && (
            <ul className="absolute border bg-white w-full z-10 max-h-40 overflow-y-auto">
              {residentResults.map(res => (
                <li
                  key={res.id}
                  className="p-1 hover:bg-gray-200 cursor-pointer"
                  onClick={() => {
                    setSelectedResident(res);
                    setResidentQuery(`${res.name} ${res.last_name}`);
                    setResidentResults([]);
                  }}
                >
                  {res.name} {res.last_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Date filters */}
      {(reportType === "debtors" || (reportType === "paymentsByResident" && selectedResident) || reportType === "incomeByMonth") && (
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

            {(reportType === "debtors" || reportType === "paymentsByResident") && (
              <>
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
              </>
            )}

            {/* Income by month */}
            {reportType === "incomeByMonth" && (
              <>
                <label>Month (optional):</label>
                <select value={selectedMonth || ""} onChange={e => setSelectedMonth(parseInt(e.target.value) || null)} className="border p-1">
                  <option value="">All months</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('en', { month: 'long' })}</option>
                  ))}
                </select>

                <label>Year:</label>
                <select
                  value={selectedYear || ""}
                  onChange={e => setSelectedYear(parseInt(e.target.value))}
                  className="border p-1"
                >
                  <option value="" disabled>Select year</option>
                  {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : data.length === 0 ? (
        <p>No data available for the selected filters.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto border-collapse border border-gray-400 w-full">
            <thead>
              <tr>
                {reportType === "debtors" ? (
                  <>
                    {Object.keys(data[0])
                      .filter(k => k !== "total" && k !== "last_payment_date")
                      .map(key => (
                        <th key={key} className="border px-2 py-1">{key}</th>
                      ))}
                    <th className="border px-2 py-1">Last Payment Date</th>
                    <th className="border px-2 py-1">Total</th>
                  </>
                ) : reportType === "paymentsByResident" ? (
                  <>
                    {Object.keys(data[0])
                      .filter(k => k !== "total" && k !== "last_payment_date" && k !== "amount")
                      .map(key => (
                        <th key={key} className="border px-2 py-1">{key}</th>
                      ))}
                    <th className="border px-2 py-1">Amount</th>
                  </>
                ) : reportType === "incomeByMonth" ? (
                  <>
                    <th className="border px-2 py-1">Month</th>
                    <th className="border px-2 py-1">Payment Type</th>
                    <th className="border px-2 py-1">Total</th>
                  </>
                ) : (
                  Object.keys(data[0]).map(key => (
                    <th key={key} className="border px-2 py-1">{key}</th>
                  ))
                )}
              </tr>
            </thead>

            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  {reportType === "debtors" ? (
                    <>
                      {Object.keys(row)
                        .filter(k => k !== "total" && k !== "last_payment_date")
                        .map(key => (
                          <td key={key} className="border px-2 py-1">{row[key]}</td>
                        ))}
                      <td className="border px-2 py-1">{row.last_payment_date || ""}</td>
                      <td className="border px-2 py-1">{row.total || 0}</td>
                    </>
                  ) : reportType === "paymentsByResident" ? (
                    <>
                      {Object.keys(row)
                        .filter(k => k !== "total" && k !== "last_payment_date" && k !== "amount")
                        .map(key => (
                          <td key={key} className="border px-2 py-1">{row[key]}</td>
                        ))}
                      <td className="border px-2 py-1">{row.amount}</td>
                    </>
                  ) : reportType === "incomeByMonth" ? (
                    <>
                      <td className="border px-2 py-1">{row.month}</td>
                      <td className="border px-2 py-1">{row.payment_type}</td>
                      <td className="border px-2 py-1">{row.total}</td>
                    </>
                  ) : (
                    Object.values(row).map((val, j) => (
                      <td key={j} className="border px-2 py-1">{val}</td>
                    ))
                  )}
                </tr>
              ))}

              {/* Total row */}
              <tr className="font-bold bg-gray-100">
                {reportType === "debtors" ? (
                  <>
                    {Object.keys(data[0])
                      .filter(k => k !== "total" && k !== "last_payment_date")
                      .map((_, idx) => (
                        <td key={idx} className="border px-2 py-1"></td>
                      ))}
                    <td className="border px-2 py-1">Total</td>
                    <td className="border px-2 py-1">{totalAmount}</td>
                  </>
                ) : reportType === "paymentsByResident" ? (
                  <>
                    {Array.from({ length: Object.keys(data[0]).length - 1 }).map((_, idx) => (
                      <td key={idx} className="border px-2 py-1"></td>
                    ))}
                    <td className="border px-2 py-1">{totalAmount}</td>
                  </>
                ) : reportType === "incomeByMonth" ? (
                  <>
                    <td className="border px-2 py-1"></td>
                    <td className="border px-2 py-1">Total</td>
                    <td className="border px-2 py-1">{totalAmount}</td>
                  </>
                ) : (
                  <>
                    {Array.from({ length: Object.keys(data[0]).length - 1 }).map((_, idx) => (
                      <td key={idx} className="border px-2 py-1"></td>
                    ))}
                    <td className="border px-2 py-1">{totalAmount}</td>
                  </>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;
