import React, { useState, useEffect } from "react";
import JsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";

const Reports = () => {
  const [fees, setFees] = useState([]);
  const [paymentType, setPaymentType] = useState("");
  const [reportType, setReportType] = useState("debtors"); // Fixed report type
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // For debtors report - only year selection
  const [debtorsYear, setDebtorsYear] = useState(new Date().getFullYear());

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const currentMonthNum = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // MODIFICACIÓN: Se eliminan los decimales de todos los montos monetarios
  const formatCurrency = (amount) => {
    const num = Number(amount || 0);
    return num.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const getPaymentDisplayType = (filterValue) => {
    if (filterValue !== "Todos" && filterValue !== "") {
      return filterValue;
    }
    if (filterValue === "Todos" && fees.length > 0) {
      const uniqueNames = [...new Set(fees.map(fee => fee.name))];
      return uniqueNames.length === 1 ? uniqueNames[0] : "Cuota(s)";
    }
    return "Cuota";
  };

  const currentPaymentDisplayName = getPaymentDisplayType(paymentType);

  const resetFilters = () => {
    setDebtorsYear(new Date().getFullYear());
    setData([]);
  };

  useEffect(() => {
    axios.get("/api/fees", { withCredentials: true, headers: { Accept: "application/json" } })
      .then(res => setFees(Array.isArray(res.data.data) ? res.data.data : []))
      .catch(() => setFees([]));
  }, []);

  const fetchReport = async () => {
    if (!paymentType || reportType !== "debtors") return;

    setLoading(true);
    const encodedPaymentType = encodeURIComponent(paymentType);
    const url = `/api/reports/debtors?payment_type=${encodedPaymentType}&year=${debtorsYear}`;

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

  useEffect(() => {
    const delay = setTimeout(() => {
      if (paymentType && reportType === "debtors") {
        fetchReport();
      } else {
        setData([]);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [paymentType, reportType, debtorsYear]);

  // Calculates the debt up to the previous month relative to today:
  const getLastMonthToConsider = (year) => {
    const today = new Date();
    const thisYear = today.getFullYear();
    const thisMonth = today.getMonth() + 1; // 1..12

    if (year < thisYear) return 12;
    if (year > thisYear) return 0;
    // same year
    return Math.max(0, thisMonth - 1); // previous month (0 if january)
  };

  const getRowDebtUpToPrevMonth = (row) => {
    const feeAmount = Number(row.fee_amount || 0);
    const lastMonth = getLastMonthToConsider(debtorsYear);
    if (lastMonth <= 0) return 0;

    let unpaidCount = 0;
    for (let m = 1; m <= lastMonth; m++) {
      const isPaid = !!row[`month_${m}`];
      if (!isPaid) unpaidCount++;
    }
    return unpaidCount * feeAmount;
  };

  // Get report title
  const getReportTitle = () => {
    const baseTitle = "ADEUDOS POR PREDIO";
    return `${baseTitle} - ${currentPaymentDisplayName.toUpperCase()}`;
  };

  const getFilterDetails = () => {
    const details = [];
    details.push(`Tipo de Pago: ${paymentType}`);
    details.push(`Año: ${debtorsYear}`);
    details.push(`Al día: ${new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}`);
    return details;
  };

  // --- PDF LOGIC ---
  const generatePdf = () => {
    if (data.length === 0 || typeof JsPDF === "undefined") {
      alert("No hay datos para generar el PDF o las librerías no se cargaron correctamente.");
      console.error("jsPDF or data is missing.");
      return;
    }

    const doc = new JsPDF("l", "pt", "a4");
    const title = getReportTitle();
    const filterDetails = getFilterDetails();
    let startY = 40;
    const margin = 40;

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 144, 255);
    doc.text(title, doc.internal.pageSize.width / 2, startY, { align: "center" });
    startY += 25;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    filterDetails.forEach(detail => {
      if (startY > doc.internal.pageSize.height - 50) {
        doc.addPage();
        startY = 40;
      }
      doc.text(detail, margin, startY);
      startY += 12;
    });
    startY += 15;

    // Build table data for PDF
    const tableHeaders = [];
    let tableBody = [];
    let grandTotalPaid = 0;
    let monthlyTotals = Array(12).fill(0);
    let totalMonthsOverdueSum = 0; // Initialize total months overdue
    
    // --- PDF HEADERS: 16 COLUMNS (Matching JSX Screen) ---
    tableHeaders.push([
      "Dirección/Predio", 
      "Tipo de Pago",
      "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
      "Pagado",
      "Deuda/hoy"
    ]);

    const processedData = data.map(row => {
      let rowTotalPaid = 0;
      const feeAmount = Number(row.fee_amount || 0);
      let monthsPaidCount = 0;
      let transactionMonth = -1; // Month of the transaction
      const computedDebt = getRowDebtUpToPrevMonth(row);
      const totalDebtValue = computedDebt;
      const rowMonthsOverdue = row.months_overdue || 0; // Get individual row months overdue
      
      totalMonthsOverdueSum += rowMonthsOverdue; // Accumulate total months overdue
      
      // 1. Determine the transaction month and count paid amounts
      for (let i = 1; i <= 12; i++) {
        const isPaid = row[`month_${i}`];
        const paymentDateStr = row[`month_${i}_date`];

        if (isPaid) { 
          monthsPaidCount++;
          // Use the actual payment_date month for the summation
          if (transactionMonth === -1 && paymentDateStr) {
            transactionMonth = new Date(paymentDateStr).getMonth() + 1; 
          }
          // Accumulate paid amount
          rowTotalPaid += Number(row[`month_${i}_amount_paid`] ?? feeAmount);
        }
      }

      // 1.2 Global accumulation
      grandTotalPaid += rowTotalPaid; 
      
      // 1.3 Accumulate the total transaction amount ONLY in the month of payment_date
      if (transactionMonth !== -1) {
          monthlyTotals[transactionMonth - 1] += rowTotalPaid; 
      }

      // 1.4 Construct the row for the PDF body
      const bodyRow = [
        row.full_address,
        row.fee_name || currentPaymentDisplayName,
      ];

      // Months: status indicator + amount/date
      for (let m = 1; m <= 12; m++) {
        const paid = !!row[`month_${m}`];
        const dateStr = row[`month_${m}_date`] ? new Date(row[`month_${m}_date`]).toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit" }) : "";
        const amountPaid = Number(row[`month_${m}_amount_paid`] ?? 0);

        if (paid) {
          const amountText = amountPaid ? formatCurrency(amountPaid) : "";
          // Multiline content for PDF: Use 'OK' for compatibility
          const lines = [ dateStr, amountText].filter(Boolean).join("\n"); 
          bodyRow.push(lines);
        } else {
          // Overdue indicator: Use 'X' for compatibility
          const lastMonth = getLastMonthToConsider(debtorsYear);
          if (m <= lastMonth) bodyRow.push("X"); 
          else bodyRow.push("-");
        }
      }

      // Total Pagado
      bodyRow.push(formatCurrency(rowTotalPaid));

      // Total Deuda (Formatted: $X (Y meses))
      const debtText = totalDebtValue > 0 
                     ? `${formatCurrency(totalDebtValue)} (${rowMonthsOverdue})` 
                     : formatCurrency(totalDebtValue);
      bodyRow.push(debtText);

      return bodyRow;
    });

    // totals row
    const totalRow = ["TOTAL PAGADO POR MES:", "", ];
    
    // Fill monthly totals (Starting at index 2)
    monthlyTotals.forEach(total => totalRow.push(total > 0 ? formatCurrency(total) : "-"));
    
    // Calculate Grand Total Debt for the final row
    const grandTotalDebt = data.reduce((sum, row) => sum + getRowDebtUpToPrevMonth(row), 0);
    
    // Fill Grand Totals
    totalRow.push(formatCurrency(grandTotalPaid));
    
    // Total Deuda Final (Formatted: $X (Y meses))
    const finalDebtText = grandTotalDebt > 0 
                        ? `${formatCurrency(grandTotalDebt)} (${totalMonthsOverdueSum})` 
                        : formatCurrency(grandTotalDebt);
    totalRow.push(finalDebtText);
    processedData.push(totalRow);

    // column styles (16 columns total in PDF data)
    const monthCellWidth = 36;
    const currentColumnStyles = {
        0: { halign: "left", cellWidth: 170 }, // Dirección/Predio (Index 0)
        1: { halign: "left", cellWidth: 80 }, // Tipo de Pago (Index 1)
        2: { halign: "center", cellWidth: 32 }, // Ene (Index 2)
        3: { halign: "center", cellWidth: 32 }, // Feb
        4: { halign: "center", cellWidth: 32 }, // Mar
        5: { halign: "center", cellWidth: 32 }, // Abr
        6: { halign: "center", cellWidth: 32 }, // May
        7: { halign: "center", cellWidth: 32 }, // Jun
        8: { halign: "center", cellWidth: 32 }, // Jul
        9: { halign: "center", cellWidth: 32 }, // Ago
        10: { halign: "center", cellWidth: 32 }, // Sep
        11: { halign: "center", cellWidth: 32 }, // Oct
        12: { halign: "center", cellWidth: 32 }, // Nov
        13: { halign: "center", cellWidth: 32 }, // Dic (Index 13)
        14: { halign: "right", fontStyle: "bold", cellWidth: 70 }, // Total Pagado (Index 14)
        15: { halign: "right", fontStyle: "bold", cellWidth: 80 } // Total Deuda (Index 15)
    };

    const finalRowIndex = processedData.length - 1;

    doc.autoTable({
      head: tableHeaders,
      body: processedData,
      startY,
      theme: "grid",
      tableWidth: "auto",
      headStyles: {
        fillColor: [60, 179, 113],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 7,
        halign: "center"
      },
      styles: {
        fontSize: 7,
        halign: "center",
        cellPadding: 3,
      },
      columnStyles: currentColumnStyles,
      rowStyles: {
        [finalRowIndex]: {
          fontStyle: "bold",
          fillColor: [220, 220, 220],
          textColor: [0, 0, 0],
          fontSize: 8,
        }
      },
      didParseCell: function (data) {
        const columnCount = tableHeaders[0].length;
        
        // --- Totals Row Logic ---
        if (data.row.index === finalRowIndex) {
          const monthIndexStart = 2; 
          
          // ColSpan for "TOTAL PAGADO POR MES:" (Col 0 and 1 combined)
          if (data.column.index === 0) {
            data.cell.colSpan = 2; 
            data.cell.styles.halign = 'left'; 
          } else if (data.column.index === 1) {
            return false; // Hide col 1
          }
          
          // Apply yellow background to current month total (Columns 2 to 13)
          if (data.column.index >= monthIndexStart && data.column.index < columnCount - 2) {
              const monthNum = data.column.index - monthIndexStart + 1;
              if (monthNum === currentMonthNum && debtorsYear === currentYear) {
                  data.cell.styles.fillColor = [255, 255, 153]; // Light Yellow (bg-warning equivalent)
                  data.cell.styles.textColor = [0, 0, 0];
              }
          }
          
          // Apply Red BG to Grand Total Debt if > 0
          if (data.column.index === 15 && grandTotalDebt > 0) {
              data.cell.styles.fillColor = [220, 53, 69];
              data.cell.styles.textColor = 255;
          }

        } else {
          // --- Data Rows Logic ---

          // Conditional red background for Total Deuda column (index 15)
          const totalDebtRaw = data.row.raw[15] ? String(data.row.raw[15]).split(' ')[0].replace(/\$|,/g, '') : '0'; // Adjusted to read only the amount part
          const totalDebtValue = Number(totalDebtRaw) || 0;

          if (data.column.index === 15 && totalDebtValue > 0) {
            data.cell.styles.fillColor = [220, 53, 69]; // Red color
            data.cell.styles.textColor = 255;
          }

          // Apply red background to overdue months (columns 2 through 13)
          if (data.column.index >= 2 && data.column.index <= 13) {
            if (data.cell.text[0] === 'X') { // Check for 'X'
                data.cell.styles.fillColor = [220, 53, 69];
                data.cell.styles.textColor = 255;
            }
            // Center multiline content
            if (String(data.cell.text).includes("\n")) {
              data.cell.styles.fontSize = 6.5; 
              data.cell.styles.halign = "center";
              data.cell.styles.valign = "middle";
            }
          }
        }
      },
      didDrawPage: function (data) {
        doc.setFontSize(10);
        doc.text(`Página ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.width - margin, doc.internal.pageSize.height - 20, { align: "right" });
      }
    });

    doc.save(`${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-primary fw-bold">📊 Generador de Reportes Integrado</h2>

      <div className="p-4 mb-4 bg-light border rounded shadow-sm">
        <h4 className="mb-3 text-secondary">Parámetros del Reporte</h4>

        <div className="row g-3 mb-4">
          {/* SELECTOR 1: Tipo de Pago */}
          <div className="col-md-6 col-sm-12">
            <label className="form-label fw-bold">Tipo de Pago</label>
            <select
              className="form-control"
              value={paymentType}
              onChange={(e) => {
                setPaymentType(e.target.value);
                setReportType("debtors"); // Fixed to debtors
                resetFilters();
              }}
            >
              <option value="">-- Seleccionar Tipo de Pago --</option>
              <option value="Todos">Todos</option>
              {fees.map((fee) => (
                <option key={fee.id} value={fee.name}>
                  {fee.name}{fee.deleted_at && ` (Inactivo)`}
                </option>
              ))}
            </select>
          </div>

          {/* SELECTOR 2: Reporte Fijo */}
          <div className="col-md-6 col-sm-12">
            <label className="form-label fw-bold">Seleccionar Reporte</label>
            <select className="form-control" value={"debtors"} disabled={true}>
              <option value="debtors">Adeudos por Predio</option>
            </select>
          </div>
        </div>

        {/* Filters Detail for Debtors (only necessary section) */}
        {(reportType === "debtors") && (
          <div className="border-top pt-3 mt-3">
            <h5 className="mb-3 text-secondary">Filtros de Detalle</h5>
            <div className="row g-2 align-items-end">
              <div className="col-md-3 col-6">
                <label className="form-label form-label-sm">Año</label>
                <select
                  className="form-control"
                  value={debtorsYear}
                  onChange={(e) => setDebtorsYear(parseInt(e.target.value) || new Date().getFullYear())}
                >
                  {Array.from({ length: 11 }, (_, i) => {
                    const year = new Date().getFullYear() - 5 + i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card shadow">
        <div className="card-header bg-dark text-white fw-bold text-center">
          {reportType === "debtors"
            ? `Resultados del Reporte: ADEUDOS POR PREDIO - ${currentPaymentDisplayName.toUpperCase()} - Año ${debtorsYear} - Al día: ${new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}`
            : "Seleccione un Tipo de Pago para generar el Reporte."}
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="p-4 text-center text-muted">Cargando datos...</div>
          ) : data.length === 0 && reportType === "debtors" ? (
            <div className="p-4 text-center text-muted">No hay datos disponibles para los filtros seleccionados.</div>
          ) : (reportType === "debtors") ? (
            <div className="table-responsive">
              <table className="table table-bordered table-hover mb-0 table-striped table-sm">
                <thead className="table-light">
                  <tr>
                    {/* Headers (16 total in screen view) */}
                    <th className="text-left" style={{ minWidth: '300px' }}>Dirección/Predio</th>
                    <th className="text-left" style={{ minWidth: '80px' }}>Tipo de Pago</th>
                    
                    {/* Monthly Headers with Arrow Indicator (12) */}
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(monthNum => (
                      <th key={monthNum} className="text-center" style={{ width: '50px' }}>
                        {(monthNum === currentMonthNum && debtorsYear === currentYear) &&
                          <div className="fw-bold text-danger pb-1" style={{ fontSize: '1.1em', lineHeight: '0.8' }}>⬇️</div>
                        }
                        {monthNames[monthNum - 1].substring(0, 3)}
                      </th>
                    ))}
                    
                    <th className="text-end" style={{ minWidth: '70px' }}>Pagado</th>
                    <th className="text-end" style={{ minWidth: '110px' }}>Deuda</th>
                  </tr>
                </thead>

                <tbody>
                  {(() => {
                    let grandTotalPaid = 0;
                    const monthlyTotals = Array(12).fill(0);

                    const rows = data.map((row, i) => {
                      let rowTotalPaid = 0;
                      let transactionMonth = -1;

                      const feeAmount = Number(row.fee_amount || 0);
                      const totalDebtValue = getRowDebtUpToPrevMonth(row); 
                      
                      const cells = [
                        <td key={`addr-${i}`} className="text-left">{row.full_address}</td>,
                        <td key={`type-${i}`} className="text-left">{row.fee_name || currentPaymentDisplayName}</td>,
                      ];

                      // 1. Determine the transaction month and calculate paid totals/status
                      for (let monthNum = 1; monthNum <= 12; monthNum++) {
                        const isPaid = !!row[`month_${monthNum}`];
                        const paymentDateStr = row[`month_${monthNum}_date`];
                        const amountPaid = Number(row[`month_${monthNum}_amount_paid`] ?? feeAmount); 

                        if (isPaid) {
                          
                          // Use the actual payment_date month for the transaction summation
                          if (transactionMonth === -1 && paymentDateStr) {
                            transactionMonth = new Date(paymentDateStr).getMonth() + 1; 
                          }
                          
                          rowTotalPaid += amountPaid; // Accumulate total paid by this property

                          // Cell Content (Use Palomita in JSX)
                          const dateText = paymentDateStr ? new Date(paymentDateStr).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' }) : '';
                          const amountText = amountPaid ? formatCurrency(amountPaid) : '';
                          const content = (
                            <div style={{ lineHeight: 1 }}>
                              <div className="text-success fw-bold">✓</div>
                              {dateText && <small className="d-block" style={{ fontSize: '0.65em' }}>{dateText}</small>}
                              {amountText && <small className="d-block" style={{ fontSize: '0.65em' }}>{amountText}</small>}
                            </div>
                          );
                          cells.push(<td key={`m${monthNum}-${i}`} className="text-center" style={{ width: '50px' }}>{content}</td>); // REDUCED WIDTH

                        } else {
                          // Cell Content (Not Paid)
                          const lastMonth = getLastMonthToConsider(debtorsYear);
                          const isTrulyOverdue = monthNum <= lastMonth;

                          if (isTrulyOverdue) {
                            // Use Cruz in JSX
                            cells.push(<td key={`m${monthNum}-${i}`} className="text-center bg-danger text-white fw-bold" style={{ width: '50px' }}>✗</td>); // REDUCED WIDTH
                          } else {
                            cells.push(<td key={`m${monthNum}-${i}`} className="text-center text-muted" style={{ width: '50px' }}>-</td>); // REDUCED WIDTH
                          }
                        }
                      }

                      grandTotalPaid += rowTotalPaid;

                      // 2. Accumulate the total transaction amount ONLY in the month of payment_date
                      if (transactionMonth !== -1) {
                        monthlyTotals[transactionMonth - 1] += rowTotalPaid;
                      }

                      // Conditional logic for background color
                      const debtBgClass = totalDebtValue > 0 ? "bg-danger text-white" : "text-dark";
                      
                      // Total Months Due
                      const rowMonthsOverdue = row.months_overdue || 0;

                      // Total Pagado
                      cells.push(
                        <td key={`totalpaid-${i}`} className="text-end fw-bold text-success" style={{ minWidth: '70px' }}>
                          {formatCurrency(rowTotalPaid)}
                        </td>
                      );

                      // Total Deuda (Formatted: $X (Y meses))
                      const debtDisplay = totalDebtValue > 0 
                                          ? `${formatCurrency(totalDebtValue)} (${rowMonthsOverdue} )` 
                                          : formatCurrency(totalDebtValue);

                      cells.push(
                        <td key={`totaldebt-${i}`} className={`text-end fw-bold ${debtBgClass}`} style={{ minWidth: '80px' }}>
                          {debtDisplay}
                        </td>
                      );

                      return <tr key={i}>{cells}</tr>;
                    });

                    // 3. Construct the NEW SUMMATION ROW
                    const totalDebtSum = data.reduce((s, r) => s + getRowDebtUpToPrevMonth(r), 0);
                    const grandTotalDebtBgClass = totalDebtSum > 0 ? "bg-danger text-white" : "bg-secondary text-white";
                    const totalMonthsOverdueSum = data.reduce((sum, row) => sum + (row.months_overdue || 0), 0);
                    
                    // Total Deuda Final (Formatted: $X (Y meses))
                    const finalDebtDisplay = totalDebtSum > 0 
                                            ? `${formatCurrency(totalDebtSum)} (${totalMonthsOverdueSum})` 
                                            : formatCurrency(totalDebtSum);


                    const totalRow = (
                      <tr key="final-totals" className="fw-bold bg-light">
                        {/* Colspan adjusted for 16 columns (Col 0 and 1 combined to span 2) */}
                        <td colSpan={2} className="text-left text-primary">TOTAL PAGADO POR MES:</td>
                        
                        {monthlyTotals.map((total, index) => {
                          const monthNum = index + 1;
                          const isCurrentMonth = monthNum === currentMonthNum && debtorsYear === currentYear;
                          // Apply yellow background if it's the current month's total
                          const totalBgClass = isCurrentMonth ? 'bg-warning text-dark' : (total > 0 ? 'text-success' : 'text-muted');
                          
                          return (
                            <td key={`mt-${index}`} className={`text-center ${totalBgClass}`} style={{ width: '50px' }}>
                              {total > 0 ? formatCurrency(total) : '-'}
                            </td>
                          );
                        })}
                        {/* Summation for the Total Pagado column */}
                        <td key="gtpaid" className="text-end text-success" style={{ minWidth: '70px' }}>
                          {formatCurrency(grandTotalPaid)}
                        </td>
                        {/* Summation for the Total Deuda column (Applying conditional class) */}
                        <td key="gtdebt" className={`text-end fw-bold ${grandTotalDebtBgClass}`} style={{ minWidth: '100px' }}>
                          {finalDebtDisplay}
                        </td>
                      </tr>
                    );

                    return rows.concat(totalRow);
                  })()}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>

      {data.length > 0 && reportType === "debtors" && (
        <div className="row mt-4">
          <div className="col-12 text-center">
            <button className="btn btn-lg btn-success shadow-sm" onClick={generatePdf} disabled={loading}>
              ⬇️ Generar PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;