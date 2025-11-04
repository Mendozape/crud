import React, { useState, useEffect } from "react";
// Importar la librería jspdf y el plugin autotable
// 🛑 CAMBIO 1: Importamos la clase principal con la primera letra mayúscula (JsPDF)
import JsPDF from "jspdf"; 
import "jspdf-autotable"; 

const Reports = () => {
  // State definitions
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

  // Helper for month names (Spanish)
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Helper to format month and year (e.g., "Enero 2024")
  const formatMonthYear = (monthNumber, yearNumber) => {
    if (monthNumber >= 1 && monthNumber <= 12 && yearNumber) {
      const month = monthNames[monthNumber - 1];
      return `${month} ${yearNumber}`;
    }
    return 'N/A';
  };

  // Helper function to determine the display name for "Tipo de Pago"
  const getPaymentDisplayType = (filterValue) => {
    if (filterValue !== "Todos" && filterValue !== "") {
      return filterValue;
    }
    if (filterValue === "Todos" && fees.length > 0) {
      const uniqueNames = [...new Set(fees.map(fee => fee.name))];
      return uniqueNames.length === 1 ? uniqueNames[0] : "Cuota(s)"; 
    }
    return "Cuota"; // Default fallback
  };
  
  const currentPaymentDisplayName = getPaymentDisplayType(paymentType);

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
            if (!selectedYear) setSelectedYear(years[0]);
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

    const encodedPaymentType = encodeURIComponent(paymentType);

    switch (reportType) {
      case "debtors":
        url = `/api/reports/debtors?months=${monthsOverdue}&payment_type=${encodedPaymentType}&start_month=${startMonth}&start_year=${startYear}&end_month=${endMonth}&end_year=${endYear}`;
        break;
      case "paymentsByResident":
        url = `/api/reports/payments-by-resident?payment_type=${encodedPaymentType}&resident_id=${selectedResident.id}&start_month=${startMonth}&start_year=${startYear}&end_month=${endMonth}&end_year=${endYear}`;
        break;
      case "incomeByMonth":
        url = `/api/reports/income-by-month?payment_type=${encodedPaymentType}&year=${selectedYear}`;
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

  // totalAmount calculation
  const totalAmount = Number(
    data.reduce((sum, item) => {
      const val = Number(item.total ?? item.amount ?? 0);
      return sum + val;
    }, 0)
  );

  // Helper to render displayed amount for a row
  const getDisplayedAmount = (row) => {
    return Number(row.amount ?? row.fee_amount ?? 0);
  };
  
  // ====================================================================
  // PDF GENERATION LOGIC (CHINGÓN)
  // ====================================================================

  const getReportTitle = () => {
      let baseTitle;
      switch (reportType) {
          case 'debtors':
              baseTitle = 'REPORTE DE ADEUDOS';
              break;
          case 'paymentsByResident':
              baseTitle = 'REPORTE DE PAGOS POR RESIDENTE';
              break;
          case 'incomeByMonth':
              baseTitle = 'REPORTE DE INGRESOS POR MES';
              break;
          default:
              baseTitle = 'REPORTE GENERAL';
      }
      return `${baseTitle} - ${currentPaymentDisplayName.toUpperCase()}`;
  };

  const getFilterDetails = () => {
      const details = [];
      details.push(`Tipo de Pago: ${paymentType}`);
      
      if (reportType === 'debtors') {
          details.push(`Meses Vencidos (mín.): ${monthsOverdue}`);
          details.push(`Período Adeudado: ${monthNames[startMonth - 1]} ${startYear} - ${monthNames[endMonth - 1]} ${endYear}`);
      } else if (reportType === 'paymentsByResident' && selectedResident) {
          details.push(`Residente: ${selectedResident.name} ${selectedResident.last_name}`);
          details.push(`Período de Búsqueda: ${monthNames[startMonth - 1]} ${startYear} - ${monthNames[endMonth - 1]} ${endYear}`);
      } else if (reportType === 'incomeByMonth') {
          details.push(`Año de Ingreso: ${selectedYear}`);
          if (selectedMonth) {
              details.push(`Mes Específico: ${monthNames[selectedMonth - 1]}`);
          }
      }
      return details;
  };

  const generatePdf = () => {
    // Check if there's data and if jsPDF is actually loaded
    if (data.length === 0 || typeof JsPDF === 'undefined') {
        alert("No hay datos para generar el PDF o las librerías no se cargaron correctamente.");
        console.error("jsPDF or data is missing.");
        return;
    }
      
    // 🛑 CAMBIO 2: Usamos JsPDF (con mayúscula)
    const doc = new JsPDF('l', 'pt', 'a4'); 
    const title = getReportTitle();
    const filterDetails = getFilterDetails();
    let startY = 40;
    const margin = 40;
    
    // --- 1. HEADER AND TITLE ---
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 144, 255); // Blue color for the main title
    doc.text(title, doc.internal.pageSize.width / 2, startY, { align: 'center' });
    startY += 25;

    // --- 2. FILTER DETAILS (ENCABEZADO CHINGÓN) ---
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80); // Dark grey for details
    
    filterDetails.forEach(detail => {
        if (startY > doc.internal.pageSize.height - 50) {
             doc.addPage();
             startY = 40;
        }
        doc.text(detail, margin, startY);
        startY += 12;
    });

    startY += 15; // Space before table

    // --- 3. DEFINE TABLE CONTENT ---

    const tableHeaders = [];
    const tableBody = [];
    let tableColSpans = []; 

    if (reportType === "debtors") {
        tableHeaders.push([
            "Residente", "Calle", "Número", "Tipo de Pago", "Meses Pagados", 
            "Monto Cuota", "Meses Vencidos", "Último Pago", "Total Deuda"
        ]);
        tableBody.push(...data.map(row => [
            (row.last_name || "") + (row.name ? ", " + row.name : ""),
            row.street,
            row.street_number,
            row.fee_name || currentPaymentDisplayName,
            row.paid_months,
            `$${Number(row.fee_amount || 0).toFixed(2)}`,
            row.months_overdue,
            row.last_payment_date || 'N/A',
            `$${Number(row.total || 0).toFixed(2)}`
        ]));
        tableColSpans = [8]; // 9 columns total
    } else if (reportType === "paymentsByResident") {
        tableHeaders.push(["Fecha", "Tipo de Pago", "Mes y Año Pagado", "Monto"]);
        tableBody.push(...data.map(row => [
            row.payment_date,
            row.fee_name || currentPaymentDisplayName,
            formatMonthYear(row.month, row.year),
            `$${getDisplayedAmount(row).toFixed(2)}`
        ]));
        tableColSpans = [3]; // 4 columns total
    } else if (reportType === "incomeByMonth") {
         tableHeaders.push(["Mes", "Tipo de Pago", "Total Ingreso"]);
         tableBody.push(...data.map(row => [
            row.month,
            row.payment_type,
            `$${Number(row.total || 0).toFixed(2)}`
        ]));
        tableColSpans = [2]; // 3 columns total
    } else {
        alert("Seleccione un reporte válido.");
        return;
    }

    // 4. Draw Table
    doc.autoTable({
        head: tableHeaders,
        body: tableBody,
        startY: startY,
        theme: 'grid',
        headStyles: {
            fillColor: [60, 179, 113],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'center' 
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240]
        },
        styles: {
             fontSize: 8.5
        },
        columnStyles: {
            ...(['debtors', 'paymentsByResident', 'incomeByMonth'].includes(reportType) && {
                [tableHeaders[0].length - 1]: { halign: 'right', fontStyle: 'bold' },
                ...(reportType === 'debtors' && {
                    4: { halign: 'center' }, // Meses Pagados
                    5: { halign: 'right' },  // Monto Cuota
                    6: { halign: 'center' }, // Meses Vencidos
                    7: { halign: 'center' }, // Último Pago
                }),
                ...(reportType === 'paymentsByResident' && {
                    3: { halign: 'right', fontStyle: 'bold' }, // Monto
                })
            })
        },
        didDrawPage: function (data) {
            // Footer (Page Number)
            doc.setFontSize(10);
            doc.text(`Página ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.width - margin, doc.internal.pageSize.height - 20, { align: 'right' });
        }
    });

    // 5. Add Grand Total Row 
    const finalY = doc.autoTable.previous.finalY;
    
    doc.autoTable({
        head: [['Total:', `$${totalAmount.toFixed(2)}`]],
        headStyles: {
            fillColor: [200, 200, 200], 
            textColor: [0, 0, 0],       
            fontStyle: 'bold',
            halign: 'right',
            fontSize: 10,
            lineWidth: 0.5,
            lineColor: [100, 100, 100]
        },
        body: [], 
        startY: finalY,
        margin: { left: margin, right: margin },
        styles: {
            cellPadding: 6
        },
        columnStyles: {
            0: { cellWidth: (doc.internal.pageSize.width - (2 * margin)) / tableHeaders[0].length * tableColSpans[0] + 0.5, halign: 'right' }, 
            1: { cellWidth: (doc.internal.pageSize.width - (2 * margin)) / tableHeaders[0].length, halign: 'right' }
        }
    });

    doc.save(`${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };
  
  // ====================================================================

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
              
              {/* === FILTER GROUP: MESES VENCIDOS (DEBTORS ONLY) === */}
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

              {/* === FILTER GROUP: RESIDENT AUTOCOMPLETE (PAYMENTS BY RESIDENT ONLY) === */}
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
                          className="list-group-item list-group-item-action cursor-pointer"
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

              {/* === FILTER GROUP: DATE RANGE (DEBTORS ONLY) === */}
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

              {/* === FILTER GROUP: INCOME BY MONTH === */}
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
                    {/* Table Header Definition based on reportType */}
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
                        <th className="text-left">Tipo de Pago</th> 
                        <th className="text-left">Mes y Año Pagado</th> 
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
                          <td className="text-left">{(row.last_name || "") + (row.name ? ", " + row.name : "")}</td>
                          <td className="text-left">{row.street}</td>
                          <td className="text-left">{row.street_number}</td>
                          <td className="text-left">{row.fee_name || currentPaymentDisplayName}</td> 
                          <td className="text-center">{row.paid_months}</td>
                          <td className="text-end">${Number(row.fee_amount || 0).toFixed(2)}</td>
                          <td className="text-center">{row.months_overdue}</td>
                          <td className="text-center">{row.last_payment_date || 'N/A'}</td>
                          <td className="text-end text-danger fw-bold">${Number(row.total || 0).toFixed(2)}</td>
                        </>
                      ) : reportType === "paymentsByResident" ? (
                        <>
                          <td className="text-left">{row.payment_date}</td>
                          <td className="text-left">{row.fee_name || currentPaymentDisplayName}</td>
                          <td className="text-left">
                            {formatMonthYear(row.month, row.year)}
                          </td>
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
                    <td 
                      colSpan={reportType === "debtors" ? 8 : reportType === "paymentsByResident" ? 3 : 2} 
                      className="text-end"
                    >
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

      {/* PDF GENERATION BUTTON */}
      {data.length > 0 && (
          <div className="row mt-4">
              <div className="col-12 text-center">
                  <button 
                      className="btn btn-lg btn-success shadow-sm"
                      onClick={generatePdf}
                      disabled={loading}
                  >
                      ⬇️ Generar PDF
                  </button>
              </div>
          </div>
      )}

    </div>
  );
}; 

export default Reports;