import React, { useState, useEffect } from "react";
import JsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";

const Reports = () => {
  const [fees, setFees] = useState([]);
  const [paymentType, setPaymentType] = useState("");
  const [reportType, setReportType] = useState("debtors");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debtorsYear, setDebtorsYear] = useState(new Date().getFullYear());

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const currentMonthNum = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const formatCurrency = (amount) => {
    const num = Number(amount || 0);
    return num.toLocaleString("es-MX", { 
      style: "currency", 
      currency: "MXN", 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    });
  };

  const getPaymentDisplayType = (filterValue) => {
    if (filterValue && filterValue !== "Todos") {
      return filterValue;
    }
    if (filterValue === "Todos" && fees.length > 0) {
      const uniqueNames = [...new Set(fees.map(fee => fee.name))];
      return uniqueNames.length === 1 ? uniqueNames[0] : "Múltiples Cuotas";
    }
    return fees.length > 0 ? "Cuota" : "Sin Cuotas";
  };

  const currentPaymentDisplayName = getPaymentDisplayType(paymentType);

  const resetFilters = () => {
    setDebtorsYear(new Date().getFullYear());
    setData([]);
  };

  useEffect(() => {
    axios.get("/api/fees", { 
      withCredentials: true, 
      headers: { Accept: "application/json" } 
    })
      .then(res => setFees(Array.isArray(res.data.data) ? res.data.data : []))
      .catch(() => setFees([]));
  }, []);

  const fetchReport = async () => {
    if (!paymentType || reportType !== "debtors") {
      setData([]);
      return;
    }

    if (!debtorsYear || debtorsYear < 2000 || debtorsYear > 2100) {
      console.error("Año inválido:", debtorsYear);
      setData([]);
      return;
    }

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

  const getLastMonthToConsider = (year) => {
    const today = new Date();
    const thisYear = today.getFullYear();
    const thisMonth = today.getMonth() + 1;

    if (year < thisYear) return 12;
    if (year > thisYear) return 0;
    return Math.max(0, thisMonth - 1);
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

  const getRowMonthsOverdueUpToPrevMonth = (row) => {
    const lastMonth = getLastMonthToConsider(debtorsYear);
    if (lastMonth <= 0) return 0;

    let unpaidCount = 0;
    for (let m = 1; m <= lastMonth; m++) {
      const isPaid = !!row[`month_${m}`];
      if (!isPaid) unpaidCount++;
    }
    return unpaidCount;
  };

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

    const tableHeaders = [];
    let grandTotalPaid = 0;
    let monthlyTotals = Array(12).fill(0);
    
    tableHeaders.push([
      "Dirección/Predio",
      "Tipo de Pago",
      "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
      "Pagado",
      "Deuda",
      "Comentarios"
    ]);

    const processedData = data.map(row => {
      let rowTotalPaid = 0;
      const feeAmount = Number(row.fee_amount || 0);
      let transactionMonth = -1;
      const computedDebt = getRowDebtUpToPrevMonth(row);
      const totalDebtValue = computedDebt;
      const rowMonthsOverdue = getRowMonthsOverdueUpToPrevMonth(row);

      for (let i = 1; i <= 12; i++) {
        const isPaid = row[`month_${i}`];
        const paymentDateStr = row[`month_${i}_date`];

        if (isPaid) {
          if (transactionMonth === -1 && paymentDateStr) {
            const parsed = new Date(paymentDateStr);
            if (!isNaN(parsed)) transactionMonth = parsed.getMonth() + 1;
          }
          rowTotalPaid += Number(row[`month_${i}_amount_paid`] ?? feeAmount);
        }
      }

      grandTotalPaid += rowTotalPaid;

      if (transactionMonth !== -1) {
        monthlyTotals[transactionMonth - 1] += rowTotalPaid;
      }

      const bodyRow = [
        row.full_address,
        row.fee_name || currentPaymentDisplayName,
      ];

      for (let m = 1; m <= 12; m++) {
        const paid = !!row[`month_${m}`];
        const dateStr = row[`month_${m}_date`] ? new Date(row[`month_${m}_date`]).toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit" }) : "";
        const amountPaid = Number(row[`month_${m}_amount_paid`] ?? 0);

        if (paid) {
          const amountText = amountPaid ? formatCurrency(amountPaid) : "";
          const lines = [dateStr, amountText].filter(Boolean).join("\n");
          bodyRow.push(lines);
        } else {
          const lastMonth = getLastMonthToConsider(debtorsYear);
          if (m <= lastMonth) bodyRow.push("X");
          else bodyRow.push("-");
        }
      }

      bodyRow.push(formatCurrency(rowTotalPaid));

      const debtText = totalDebtValue > 0
        ? `${formatCurrency(totalDebtValue)} (${rowMonthsOverdue})`
        : formatCurrency(totalDebtValue);
      bodyRow.push(debtText);

      bodyRow.push(row.comments || '-');

      return bodyRow;
    });

    const totalRow = ["TOTAL PAGADO POR MES:", ""];
    monthlyTotals.forEach(total => totalRow.push(total > 0 ? formatCurrency(total) : "-"));
    const grandTotalDebt = data.reduce((sum, row) => sum + getRowDebtUpToPrevMonth(row), 0);
    const grandTotalMonthsOverdue = data.reduce((sum, row) => sum + getRowMonthsOverdueUpToPrevMonth(row), 0);

    totalRow.push(formatCurrency(grandTotalPaid));

    const finalDebtText = grandTotalDebt > 0
      ? `${formatCurrency(grandTotalDebt)} (${grandTotalMonthsOverdue})`
      : formatCurrency(grandTotalDebt);
    totalRow.push(finalDebtText);

    totalRow.push("");

    processedData.push(totalRow);

    const currentColumnStyles = {
        0: { halign: "left", cellWidth: 150 },
        1: { halign: "left", cellWidth: 70 },
        2: { halign: "center", cellWidth: 32 },
        3: { halign: "center", cellWidth: 32 },
        4: { halign: "center", cellWidth: 32 },
        5: { halign: "center", cellWidth: 32 },
        6: { halign: "center", cellWidth: 32 },
        7: { halign: "center", cellWidth: 32 },
        8: { halign: "center", cellWidth: 32 },
        9: { halign: "center", cellWidth: 32 },
        10: { halign: "center", cellWidth: 32 },
        11: { halign: "center", cellWidth: 32 },
        12: { halign: "center", cellWidth: 32 },
        13: { halign: "center", cellWidth: 32 },
        14: { halign: "right", fontStyle: "bold", cellWidth: 60 },
        15: { halign: "right", fontStyle: "bold", cellWidth: 70 },
        16: { halign: "left", cellWidth: 90 }
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

        if (data.row.index === finalRowIndex) {
          const monthIndexStart = 2;

          if (data.column.index === 0) {
            data.cell.colSpan = 2;
            data.cell.styles.halign = 'left';
          } else if (data.column.index === 1) {
            return false;
          }

          if (data.column.index >= monthIndexStart && data.column.index < columnCount - 3) {
            const monthNum = data.column.index - monthIndexStart + 1;
            if (monthNum === currentMonthNum && debtorsYear === currentYear) {
              data.cell.styles.fillColor = [255, 255, 153];
              data.cell.styles.textColor = [0, 0, 0];
            }
          }

          if (data.column.index === 15 && grandTotalDebt > 0) {
            data.cell.styles.fillColor = [220, 53, 69];
            data.cell.styles.textColor = 255;
          }

        } else {
          const totalDebtRaw = data.row.raw[15] ? String(data.row.raw[15]).split(' ')[0].replace(/\$|,/g, '') : '0';
          const totalDebtValue = Number(totalDebtRaw) || 0;

          if (data.column.index === 15 && totalDebtValue > 0) {
            data.cell.styles.fillColor = [220, 53, 69];
            data.cell.styles.textColor = 255;
          }

          if (data.column.index >= 2 && data.column.index <= 13) {
            if (data.cell.text && String(data.cell.text)[0] === 'X') {
              data.cell.styles.fillColor = [220, 53, 69];
              data.cell.styles.textColor = 255;
            }
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
          <div className="col-md-6 col-sm-12">
            <label className="form-label fw-bold">Tipo de Pago</label>
            <select
              className="form-control"
              value={paymentType}
              onChange={(e) => {
                setPaymentType(e.target.value);
                setReportType("debtors");
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

          <div className="col-md-6 col-sm-12">
            <label className="form-label fw-bold">Seleccionar Reporte</label>
            <select className="form-control" value={"debtors"} disabled={true}>
              <option value="debtors">Adeudos por Predio</option>
            </select>
          </div>
        </div>

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
                    <th className="text-left" style={{ minWidth: '250px' }}>Dirección/Predio</th>
                    <th className="text-left" style={{ minWidth: '80px' }}>Tipo de Pago</th>

                    {Array.from({ length: 12 }, (_, i) => i + 1).map(monthNum => (
                      <th key={monthNum} className="text-center" style={{ width: '50px' }}>
                        {(monthNum === currentMonthNum && debtorsYear === currentYear) &&
                          <div className="fw-bold text-danger pb-1" style={{ fontSize: '1.1em', lineHeight: '0.8' }}>⬇️</div>
                        }
                        {monthNames[monthNum - 1].substring(0, 3)}
                      </th>
                    ))}

                    <th className="text-end" style={{ minWidth: '70px' }}>Pagado</th>
                    <th className="text-end" style={{ minWidth: '90px' }}>Deuda</th>
                    <th className="text-left" style={{ minWidth: '100px' }}>Comentarios</th>
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
                      const rowMonthsOverdue = getRowMonthsOverdueUpToPrevMonth(row);

                      const cells = [
                        <td key={`addr-${i}`} className="text-left">{row.full_address}</td>,
                        <td key={`type-${i}`} className="text-left">{row.fee_name || currentPaymentDisplayName}</td>,
                      ];

                      for (let monthNum = 1; monthNum <= 12; monthNum++) {
                        const isPaid = !!row[`month_${monthNum}`];
                        const paymentDateStr = row[`month_${monthNum}_date`];
                        const amountPaid = Number(row[`month_${monthNum}_amount_paid`] ?? feeAmount);

                        if (isPaid) {
                          if (transactionMonth === -1 && paymentDateStr) {
                            const parsed = new Date(paymentDateStr);
                            if (!isNaN(parsed)) transactionMonth = parsed.getMonth() + 1;
                          }

                          rowTotalPaid += amountPaid;

                          const dateText = paymentDateStr ? new Date(paymentDateStr).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' }) : '';
                          const amountText = amountPaid ? formatCurrency(amountPaid) : '';
                          const content = (
                            <div style={{ lineHeight: 1 }}>
                              <div className="text-success fw-bold">✓</div>
                              {dateText && <small className="d-block" style={{ fontSize: '0.65em' }}>{dateText}</small>}
                              {amountText && <small className="d-block" style={{ fontSize: '0.65em' }}>{amountText}</small>}
                            </div>
                          );
                          cells.push(<td key={`m${monthNum}-${i}`} className="text-center" style={{ width: '50px' }}>{content}</td>);

                        } else {
                          const lastMonth = getLastMonthToConsider(debtorsYear);
                          const isTrulyOverdue = monthNum <= lastMonth;

                          if (isTrulyOverdue) {
                            cells.push(<td key={`m${monthNum}-${i}`} className="text-center bg-danger text-white fw-bold" style={{ width: '50px' }}>✗</td>);
                          } else {
                            cells.push(<td key={`m${monthNum}-${i}`} className="text-center text-muted" style={{ width: '50px' }}>-</td>);
                          }
                        }
                      }

                      grandTotalPaid += rowTotalPaid;

                      if (transactionMonth !== -1) {
                        monthlyTotals[transactionMonth - 1] += rowTotalPaid;
                      }

                      const debtBgClass = totalDebtValue > 0 ? "bg-danger text-white" : "text-dark";

                      cells.push(
                        <td key={`totalpaid-${i}`} className="text-end fw-bold text-success" style={{ minWidth: '70px' }}>
                          {formatCurrency(rowTotalPaid)}
                        </td>
                      );

                      const debtDisplay = totalDebtValue > 0
                        ? `${formatCurrency(totalDebtValue)} (${rowMonthsOverdue})`
                        : formatCurrency(totalDebtValue);

                      cells.push(
                        <td key={`totaldebt-${i}`} className={`text-end fw-bold ${debtBgClass}`} style={{ minWidth: '90px' }}>
                          {debtDisplay}
                        </td>
                      );

                      cells.push(
                        <td key={`comments-${i}`} className="text-left text-wrap" style={{ minWidth: '100px' }}>
                          {row.comments || '-'}
                        </td>
                      );

                      return <tr key={i}>{cells}</tr>;
                    });

                    const totalDebtSum = data.reduce((s, r) => s + getRowDebtUpToPrevMonth(r), 0);
                    const grandTotalDebtBgClass = totalDebtSum > 0 ? "bg-danger text-white" : "bg-secondary text-white";
                    const grandTotalMonthsOverdue = data.reduce((sum, row) => sum + getRowMonthsOverdueUpToPrevMonth(row), 0);

                    const finalDebtDisplay = totalDebtSum > 0
                      ? `${formatCurrency(totalDebtSum)} (${grandTotalMonthsOverdue})`
                      : formatCurrency(totalDebtSum);

                    const totalRow = (
                      <tr key="final-totals" className="fw-bold bg-light">
                        <td colSpan={2} className="text-left text-primary">TOTAL PAGADO POR MES:</td>

                        {monthlyTotals.map((total, index) => {
                          const monthNum = index + 1;
                          const isCurrentMonth = monthNum === currentMonthNum && debtorsYear === currentYear;
                          const totalBgClass = isCurrentMonth ? 'bg-warning text-dark' : (total > 0 ? 'text-success' : 'text-muted');

                          return (
                            <td key={`mt-${index}`} className={`text-center ${totalBgClass}`} style={{ width: '50px' }}>
                              {total > 0 ? formatCurrency(total) : '-'}
                            </td>
                          );
                        })}
                        <td key="gtpaid" className="text-end text-success" style={{ minWidth: '70px' }}>
                          {formatCurrency(grandTotalPaid)}
                        </td>
                        <td key="gtdebt" className={`text-end fw-bold ${grandTotalDebtBgClass}`} style={{ minWidth: '90px' }}>
                          {finalDebtDisplay}
                        </td>
                        <td key="gtcomments" className="text-left text-muted" style={{ minWidth: '100px' }}></td>
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