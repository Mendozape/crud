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

  const monthNames = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];

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

  // Load years for incomeByMonth
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

  // Validate date range
  useEffect(() => {
    if (startYear > endYear || (startYear === endYear && startMonth > endMonth)) {
      setRangeError(true);
    } else {
      setRangeError(false);
    }
  }, [startMonth, startYear, endMonth, endYear]);

  // Fetch residents (autocomplete)
  useEffect(() => {
    if (!residentQuery) {
      setResidentResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetch(`/api/reports/search-residents?search=${encodeURIComponent(residentQuery)}`)
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
        url = `/api/reports/debtors?months=${monthsOverdue}&payment_type=${encodeURIComponent(paymentType)}&start_month=${startMonth}&start_year=${startYear}&end_month=${endMonth}&end_year=${endYear}`;
        break;
      case "paymentsByResident":
        url = `/api/reports/payments-by-resident?payment_type=${encodeURIComponent(paymentType)}&resident_id=${selectedResident.id}&start_month=${startMonth}&start_year=${startYear}&end_month=${endMonth}&end_year=${endYear}`;
        break;
      case "incomeByMonth":
        url = `/api/reports/income-by-month?payment_type=${encodeURIComponent(paymentType)}&year=${selectedYear}`;
        if (selectedMonth) url += `&month=${selectedMonth}`;
        break;
      default:
        break;
    }

    try {
      const res = await fetch(url, { credentials: "include" });
      const json = await res.json();
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

  // Automatically fetch report on any field change (debounced)
  useEffect(() => {
    const delay = setTimeout(() => {
      if (paymentType && reportType) {
        fetchReport();
      } else {
        setData([]);
      }
    }, 400); // debounce 400ms

    return () => clearTimeout(delay);
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

  // totalAmount: adapt to use fee_amount when amount is missing in paymentsByResident
  const totalAmount = Number(
    data.reduce((sum, item) => {
      // For paymentsByResident: prefer item.amount, fallback to item.fee_amount
      if (reportType === "paymentsByResident") {
        const val = Number(item.amount ?? item.fee_amount ?? 0);
        return sum + val;
      }
      // For debtors/incomeByMonth keep previous logic
      return sum + Number(item.total ?? item.amount ?? 0);
    }, 0)
  );

  // Helper to render displayed amount for a row
  const getDisplayedAmount = (row) => {
    // paymentsByResident: amount (payment) or fallback fee_amount
    if (reportType === "paymentsByResident") {
      return Number(row.amount ?? row.fee_amount ?? 0);
    }
    // debtors: use total or fee_amount
    if (reportType === "debtors") {
      return Number(row.total ?? row.fee_amount ?? 0);
    }
    // incomeByMonth: use total
    return Number(row.total ?? 0);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-primary fw-bold">📊 Generador de Reportes Integrado</h2>

      <div className="p-4 mb-4 bg-light border rounded shadow-sm">
        <h4 className="mb-3 text-secondary">Parámetros del Reporte</h4>

        {/* Main selectors row */}
        <div className="row g-3 mb-4">
          <div className="col-md-6 col-sm-12">
            <label className="form-label fw-bold">Tipo de Pago</label>
            <select
              className="form-control"
              value={paymentType}
              onChange={(e) => {
                setPaymentType(e.target.value);
                setReportType("");
                resetFilters();
              }}
            >
              <option value="">-- Seleccionar Tipo de Pago --</option>
              <option value="Todos">Todos</option>
              {fees.map((fee) => (
                <option key={fee.id} value={fee.name}>
                  {fee.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6 col-sm-12">
            <label className="form-label fw-bold">Seleccionar Reporte</label>
            <select
              className="form-control"
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setData([]);
                if (e.target.value !== "paymentsByResident") {
                  setSelectedResident(null);
                  setResidentQuery("");
                }
              }}
              disabled={!paymentType}
            >
              <option value="">-- Seleccionar Reporte --</option>
              <option value="debtors">Residentes con adeudos</option>
              <option value="paymentsByResident">Pagos por residente</option>
              <option value="incomeByMonth">Ingresos por mes</option>
            </select>
          </div>
        </div>

        {(reportType === "debtors" || reportType === "paymentsByResident" || reportType === "incomeByMonth") && (
          <div className="border-top pt-3 mt-3">
            <h5 className="mb-3 text-secondary">Filtros de Detalle</h5>

            {rangeError && (
              <div className="alert alert-danger p-2" role="alert">
                ⚠️ Rango inválido: "Desde" debe ser anterior o igual a "Hasta".
              </div>
            )}

            <div className="row g-2 align-items-end">
              {reportType === "debtors" && (
                <div className="col-md-2 col-6">
                  <label className="form-label form-label-sm">Meses Vencidos (mín.)</label>
                  <input
                    type="number"
                    min={1}
                    className="form-control"
                    value={monthsOverdue}
                    onChange={(e) => setMonthsOverdue(parseInt(e.target.value) || 1)}
                  />
                </div>
              )}

              {reportType === "paymentsByResident" && (
                <div className="col-md-3 col-12 position-relative">
                  <label className="form-label form-label-sm">Residente</label>
                  <input
                    type="text"
                    className={`form-control ${selectedResident ? 'border-success' : ''}`}
                    value={residentQuery}
                    onChange={(e) => {
                      setResidentQuery(e.target.value);
                      setSelectedResident(null);
                      setData([]);
                    }}
                    placeholder="Buscar residente..."
                  />
                  {residentResults.length > 0 && !selectedResident && (
                    <ul className="list-group position-absolute w-100 shadow-lg" style={{ zIndex: 10 }}>
                      {residentResults.map((res) => (
                        <li
                          key={res.id}
                          className="list-group-item list-group-item-action"
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
                  {selectedResident && <small className="text-success">Seleccionado</small>}
                </div>
              )}

              {reportType === "debtors" && (
                <>
                  <div className="col-md-2 col-6">
                    <label className="form-label form-label-sm">Desde Mes</label>
                    <select className="form-control" value={startMonth} onChange={(e) => setStartMonth(parseInt(e.target.value) || 1)}>
                      {monthNames.map((name, i) => (
                        <option key={i + 1} value={i + 1}>{name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-1 col-6">
                    <label className="form-label form-label-sm">Año</label>
                    <select className="form-control" value={startYear} onChange={(e) => setStartYear(parseInt(e.target.value) || new Date().getFullYear())}>
                      {Array.from({ length: 11 }, (_, i) => {
                        const year = new Date().getFullYear() - 5 + i;
                        return <option key={year} value={year}>{year}</option>;
                      })}
                    </select>
                  </div>

                  <div className="col-md-2 col-6">
                    <label className="form-label form-label-sm">Hasta Mes</label>
                    <select className="form-control" value={endMonth} onChange={(e) => setEndMonth(parseInt(e.target.value) || (new Date().getMonth() + 1))}>
                      {monthNames.map((name, i) => (
                        <option key={i + 1} value={i + 1}>{name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-1 col-6">
                    <label className="form-label form-label-sm">Año</label>
                    <select className="form-control" value={endYear} onChange={(e) => setEndYear(parseInt(e.target.value) || new Date().getFullYear())}>
                      {Array.from({ length: 11 }, (_, i) => {
                        const year = new Date().getFullYear() - 5 + i;
                        return <option key={year} value={year}>{year}</option>;
                      })}
                    </select>
                  </div>
                </>
              )}

              {reportType === "incomeByMonth" && (
                <>
                  <div className="col-md-2 col-6">
                    <label className="form-label form-label-sm">Año</label>
                    <select
                      className="form-control"
                      value={selectedYear || ""}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    >
                      <option value="" disabled>Seleccionar año</option>
                      {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3 col-6">
                    <label className="form-label form-label-sm">Mes (opcional)</label>
                    <select className="form-control" value={selectedMonth || ""} onChange={(e) => setSelectedMonth(parseInt(e.target.value) || null)}>
                      <option value="">Todos los meses</option>
                      {monthNames.map((name, i) => (
                        <option key={i + 1} value={i + 1}>{name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

            </div>
          </div>
        )}

      </div>

      {/* TABLE */}
      <div className="card shadow">
        <div className="card-header bg-dark text-white fw-bold">Resultados del Reporte</div>
        <div className="card-body p-0">
          {loading ? (
            <div className="p-4 text-center text-muted">Cargando datos...</div>
          ) : data.length === 0 ? (
            <div className="p-4 text-center text-muted">
              {reportType === 'paymentsByResident' && !selectedResident
                ? "Por favor, seleccione un residente para generar el reporte de pagos."
                : rangeError
                  ? "Rango de fechas inválido. Corrija los filtros."
                  : "No hay datos disponibles para los filtros seleccionados."}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover mb-0 table-striped">
                <thead className="table-light">
                  <tr>
                    {reportType === "debtors" ? (
                      <>
                        <th className="text-left">Residente</th>
                        <th className="text-left">Calle</th>
                        <th className="text-left">Número</th>
                        <th className="text-left">Tipo de Pago</th>
                        <th className="text-center">Meses Pagados</th>
                        <th className="text-end">Monto Cuota</th>
                        <th className="text-center">Meses Vencidos</th>
                        <th className="text-center">Último Pago</th>
                        <th className="text-end">Total Deuda</th>
                      </>
                    ) : reportType === "paymentsByResident" ? (
                      <>
                        <th className="text-left">Fecha</th>
                        <th className="text-left">Concepto</th>
                        <th className="text-end">Monto</th>
                      </>
                    ) : reportType === "incomeByMonth" ? (
                      <>
                        <th className="text-left">Mes</th>
                        <th className="text-left">Tipo de Pago</th>
                        <th className="text-end">Total Ingreso</th>
                      </>
                    ) : (
                      Object.keys(data[0]).map((key) => (
                        <th key={key} className="text-left">
                          {key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i}>
                      {reportType === "debtors" ? (
                        <>
                          <td className="text-left">{(row.name || "") + (row.last_name ? " " + row.last_name : "")}</td>
                          <td className="text-left">{row.street}</td>
                          <td className="text-left">{row.street_number}</td>
                          <td className="text-left">{paymentType}</td>
                          <td className="text-center">{row.paid_months}</td>
                          <td className="text-end">${Number(row.fee_amount ?? row.amount ?? 0).toFixed(2)}</td>
                          <td className="text-center">{row.months_overdue}</td>
                          <td className="text-center">{row.last_payment_date || 'N/A'}</td>
                          <td className="text-end  fw-bold">${Number(row.total || 0).toFixed(2)}</td>
                        </>
                      ) : reportType === "paymentsByResident" ? (
                        <>
                          <td className="text-left">{row.payment_date}</td>

                          {/* Concept: if empty, show cuota with payment type */}
                          <td className="text-left">
                            {row.concept && String(row.concept).trim() !== "" 
                              ? row.concept 
                              : (`Cuota de ${paymentType}`)}
                          </td>

                          {/* Monto: prefer amount (payment); fallback fee_amount */}
                          <td className="text-end">
                            ${getDisplayedAmount(row).toFixed(2)}
                          </td>
                        </>
                      ) : reportType === "incomeByMonth" ? (
                        <>
                          <td className="text-left">{row.month}</td>
                          <td className="text-left">{row.payment_type}</td>
                          <td className="text-end">${Number(row.total || 0).toFixed(2)}</td>
                        </>
                      ) : (
                        Object.values(row).map((val, j) => (
                          <td key={j}>{val}</td>
                        ))
                      )}
                    </tr>
                  ))}

                  <tr className="fw-bold bg-secondary text-white">
                    <td colSpan={reportType === "debtors" ? 8 : reportType === "paymentsByResident" ? 2 : 2} className="text-end">
                      Total:
                    </td>
                    <td className="text-end">
                      ${totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Reports;