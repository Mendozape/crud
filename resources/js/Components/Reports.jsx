import React, { useState, useEffect } from "react";
import JsPDF from "jspdf";
import "jspdf-autotable";
import axios from 'axios';

const Reports = () => {
    const [fees, setFees] = useState([]);
    const [paymentType, setPaymentType] = useState("");
    const [reportType, setReportType] = useState("debtors"); // Fixed report type
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // For debtors report - only year selection
    const [debtorsYear, setDebtorsYear] = useState(new Date().getFullYear());

    // States related to removed reports (kept for compilation structure safety, but unused)
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
    const [rangeError, setRangeError] = useState(false); // Kept only for function definition, but logic removed

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const currentMonthNum = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

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

    // Simplified reset: only affects debtors filters
    const resetFilters = () => {
        setDebtorsYear(new Date().getFullYear());
        setData([]);
    };

    // Load fees on mount
    useEffect(() => {
        axios.get("/api/fees", { withCredentials: true, headers: { Accept: 'application/json' } })
            .then(res => setFees(Array.isArray(res.data.data) ? res.data.data : []))
            .catch(() => setFees([]));
    }, []);

    // Fetch debtors report data
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

    // Auto-fetch report when paymentType or year changes
    useEffect(() => {
        const delay = setTimeout(() => {
            if (paymentType && reportType === "debtors") {
                fetchReport();
            } else {
                setData([]);
            }
        }, 400);

        return () => clearTimeout(delay);
    }, [
        paymentType,
        reportType,
        debtorsYear,
    ]);

    // Total debt calculation (used in the final summary row)
    const totalAmount = Number(
        data.reduce((sum, item) => {
            const val = Number(item.total ?? 0);
            return sum + val;
        }, 0)
    );

    // Get report title
    const getReportTitle = () => {
        const baseTitle = 'ADEUDOS POR PREDIO';
        return `${baseTitle} - ${currentPaymentDisplayName.toUpperCase()}`;
    };

    // Get filter details for the PDF header
    const getFilterDetails = () => {
        const details = [];
        details.push(`Tipo de Pago: ${paymentType}`);
        details.push(`Año: ${debtorsYear}`);
        details.push(`Al día: ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}`);
        return details;
    };

    // --- PDF LOGIC ---
    const generatePdf = () => {
        if (data.length === 0 || typeof JsPDF === 'undefined') {
            alert("No hay datos para generar el PDF o las librerías no se cargaron correctamente.");
            console.error("jsPDF or data is missing.");
            return;
        }

        const doc = new JsPDF('l', 'pt', 'a4');
        const title = getReportTitle();
        const filterDetails = getFilterDetails();
        let startY = 40;
        const margin = 40;

        // Header logic
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 144, 255);
        doc.text(title, doc.internal.pageSize.width / 2, startY, { align: 'center' });
        startY += 25;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
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
        // End Header logic

        const tableHeaders = [];
        let tableBody = [];
        let currentColumnStyles = {};
        let grandTotalPaid = 0;
        let monthlyTotals = Array(12).fill(0);
        let totalColumns = 18;


        if (reportType === "debtors") {
            // 18 COLUMNS SETUP
            tableHeaders.push([
                "Dirección/Predio", "Tipo de Pago", "Monto Cuota", "Meses Vencidos",
                "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
                "Total Pagado", // NEW COLUMN
                "Total Deuda"
            ]);

            // 1. Calculate totals and build the table body
            const processedData = data.map(row => {
                let rowTotalPaid = 0;
                const feeAmount = Number(row.fee_amount || 0);
                let monthsPaidCount = 0;
                let transactionMonth = -1; // Month of the transaction

                // 1.1 Determine the transaction month and count paid months
                for (let i = 1; i <= 12; i++) {
                    const isPaid = row[`month_${i}`];
                    const paymentDateStr = row[`month_${i}_date`]; // string 'YYYY-MM-DD'

                    if (isPaid) {
                        monthsPaidCount++;
                        // Use the actual payment_date month for the summation
                        if (transactionMonth === -1 && paymentDateStr) {
                            transactionMonth = new Date(paymentDateStr).getMonth() + 1;
                        }
                    }
                }

                // 1.2 Calculate the total transaction amount (used for summation)
                const totalTransactionAmount = feeAmount * monthsPaidCount;
                rowTotalPaid = totalTransactionAmount;
                grandTotalPaid += rowTotalPaid;

                // 1.3 Accumulate the transaction amount ONLY in the month of payment_date
                if (transactionMonth !== -1) {
                    monthlyTotals[transactionMonth - 1] += totalTransactionAmount;
                }

                // 1.4 Construct the row for the PDF body
                const bodyRow = [
                    row.full_address,
                    row.fee_name || currentPaymentDisplayName,
                    `$${feeAmount.toFixed(2)}`,
                    row.months_overdue
                ];

                for (let i = 1; i <= 12; i++) {
                    const isPaid = row[`month_${i}`];

                    if (isPaid) {
                        bodyRow.push('✓');
                    } else {
                        bodyRow.push(row.months_overdue > 0 && new Date().getMonth() + 1 > i ? '✗' : '-');
                    }
                }

                // Add the NEW TOTAL PAID PER PROPERTY COLUMN
                bodyRow.push(`$${rowTotalPaid.toFixed(2)}`);

                // Add the existing Total Debt column
                bodyRow.push(`$${Number(row.total || 0).toFixed(2)}`);

                return bodyRow;
            });

            tableBody = processedData;

            // 2. Construct the FINAL TOTALS ROW
            const totalRow = ["Total Pagado:", "", "", ""];

            // Fill monthly totals
            monthlyTotals.forEach(total => {
                totalRow.push(total > 0 ? `$${total.toFixed(2)}` : '-');
            });

            // Fill Grand Totals
            const grandTotalDebtCurrent = data.reduce((sum, row) => sum + Number(row.total || 0), 0);
            totalRow.push(`$${grandTotalPaid.toFixed(2)}`);
            totalRow.push(`$${grandTotalDebtCurrent.toFixed(2)}`);

            tableBody.push(totalRow);


            // 3. Column Styles for 18 columns (762pt wide)
            const availableWidth = doc.internal.pageSize.width - (2 * margin); // Recalculate inside generatePdf
            const monthCellWidth = 25;
            currentColumnStyles = {
                0: { halign: 'left', cellWidth: 120 },
                1: { halign: 'left', cellWidth: 60 },
                2: { halign: 'right', cellWidth: 50 },
                3: { halign: 'center', cellWidth: 40 },
                4: { halign: 'center', cellWidth: monthCellWidth },
                5: { halign: 'center', cellWidth: monthCellWidth },
                6: { halign: 'center', cellWidth: monthCellWidth },
                7: { halign: 'center', cellWidth: monthCellWidth },
                8: { halign: 'center', cellWidth: monthCellWidth },
                9: { halign: 'center', cellWidth: monthCellWidth },
                10: { halign: 'center', cellWidth: monthCellWidth },
                11: { halign: 'center', cellWidth: monthCellWidth },
                12: { halign: 'center', cellWidth: monthCellWidth },
                13: { halign: 'center', cellWidth: monthCellWidth },
                14: { halign: 'center', cellWidth: monthCellWidth },
                15: { halign: 'center', cellWidth: monthCellWidth },
                16: { halign: 'right', fontStyle: 'bold', cellWidth: 80 }, // Total Pagado (NEW)
                17: { halign: 'right', fontStyle: 'bold', cellWidth: 112 } // Total Deuda
            };

            const finalRowIndex = tableBody.length - 1;

            doc.autoTable({
                head: tableHeaders,
                body: tableBody,
                startY: startY,
                theme: 'grid',
                tableWidth: 'auto',
                headStyles: {
                    fillColor: [60, 179, 113],
                    textColor: 255,
                    fontStyle: 'bold',
                    fontSize: 7,
                    halign: 'center'
                },
                styles: {
                    fontSize: 6.5,
                    halign: 'center',
                    cellPadding: 2,
                },
                columnStyles: currentColumnStyles,
                rowStyles: {
                    [finalRowIndex]: {
                        fontStyle: 'bold',
                        fillColor: [220, 220, 220],
                        textColor: [0, 0, 0],
                        fontSize: 8,
                    }
                },
                didParseCell: function (data) {
                    if (data.row.index === finalRowIndex) {
                        data.cell.styles.halign = (data.column.index === 0 || data.column.index < 4) ? 'left' :
                            (data.column.index >= 4 && data.column.index <= 15) ? 'center' :
                                'right';
                        if (data.column.index > 0 && data.column.index < 4) {
                            data.cell.text = [""];
                        }
                    } else {
                        // Apply conditional red background for Total Deuda
                        const totalDebtValue = Number(data.row.raw[17].replace('$', '').replace(',', '') || 0); // Debt is at index 17
                        if (data.column.index === 17 && totalDebtValue > 0) {
                            data.cell.styles.fillColor = [220, 53, 69]; // Bootstrap red color
                            data.cell.styles.textColor = 255;
                        }
                    }
                },
                didDrawPage: function (data) {
                    doc.setFontSize(10);
                    doc.text(`Página ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.width - margin, doc.internal.pageSize.height - 20, { align: 'right' });
                }
            });

        } else {
            // If reportType is somehow set but not 'debtors', show a message in PDF
            doc.text("No data to show for this report type.", 40, startY);
        }

        doc.save(`${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
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
                                    {fee.name}
                                    {fee.deleted_at && ` (Inactivo)`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* SELECTOR 2: Reporte Fijo */}
                    <div className="col-md-6 col-sm-12">
                        <label className="form-label fw-bold">Seleccionar Reporte</label>
                        <select
                            className="form-control"
                            value={"debtors"} // Fixed value
                            disabled={true}
                        >
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
                        ? `Resultados del Reporte: ${currentPaymentDisplayName} - Año ${debtorsYear} - Al día: ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}` 
                        : "Seleccione un Tipo de Pago para generar el Reporte."}
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="p-4 text-center text-muted">Cargando datos...</div>
                    ) : data.length === 0 && reportType === "debtors" ? (
                        <div className="p-4 text-center text-muted">
                            No hay datos disponibles para los filtros seleccionados.
                        </div>
                    ) : (reportType === "debtors") ? (
                        <div className="table-responsive">
                            <table className={`table table-bordered table-hover mb-0 table-striped table-sm`}>
                                <thead className="table-light">
                                    <tr>
                                        {/* Debtors Headers */}
                                        <th className="text-left" style={{ minWidth: '150px' }}>Dirección/Predio</th>
                                        <th className="text-left" style={{ minWidth: '80px' }}>Tipo de Pago</th>
                                        <th className="text-end" style={{ minWidth: '70px' }}>Monto Cuota</th>
                                        <th className="text-center" style={{ minWidth: '60px' }}>Meses Vencidos</th>

                                        {/* Modificación para el indicador de mes actual arriba */}
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(monthNum => (
                                            <th key={monthNum} className="text-center" style={{ width: '45px' }}>
                                                {(monthNum === currentMonthNum && debtorsYear === currentYear) &&
                                                    <div className="fw-bold text-danger pb-1" style={{ fontSize: '1.2em', lineHeight: '0.8' }}>
                                                        ⬇️
                                                    </div>
                                                }
                                                {monthNames[monthNum - 1].substring(0, 3)}
                                            </th>
                                        ))}

                                        <th className="text-end" style={{ minWidth: '85px' }}>Total Pagado</th>
                                        <th className="text-end" style={{ minWidth: '95px' }}>Total Deuda</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        let grandTotalPaid = 0;
                                        const monthlyTotals = Array(12).fill(0);

                                        const rows = data.map((row, i) => {
                                            let rowTotalPaid = 0;
                                            const feeAmount = Number(row.fee_amount || 0);
                                            let monthsPaidCount = 0;
                                            let transactionMonth = -1;
                                            const totalDebtValue = Number(row.total || 0);

                                            const cells = [
                                                <td key="addr" className="text-left">{row.full_address}</td>,
                                                <td key="type" className="text-left">{row.fee_name || currentPaymentDisplayName}</td>,
                                                <td key="fee" className="text-end">${feeAmount.toFixed(2)}</td>,
                                                <td key="overdue" className="text-center">{row.months_overdue}</td>,
                                            ];

                                            // 1. Determine the transaction month and count paid months
                                            for (let monthNum = 1; monthNum <= 12; monthNum++) {
                                                const isPaid = row[`month_${monthNum}`];
                                                const paymentDateStr = row[`month_${monthNum}_date`];

                                                if (isPaid) {
                                                    monthsPaidCount++;
                                                    // Use the actual payment_date month for the summation
                                                    if (transactionMonth === -1 && paymentDateStr) {
                                                        transactionMonth = new Date(paymentDateStr).getMonth() + 1;
                                                    }
                                                }

                                                let bgClass = '';
                                                let content = <span className="text-muted">-</span>;

                                                if (isPaid) {
                                                    bgClass = '';
                                                    content = (
                                                        <div className="text-success">
                                                            <div className="fw-bold">✓</div>
                                                            {paymentDateStr && <small className="d-block" style={{ fontSize: '0.65em', lineHeight: '1' }}>{new Date(paymentDateStr).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' })}</small>}
                                                        </div>
                                                    );
                                                } else {
                                                    const currentMonth = new Date().getMonth() + 1;
                                                    const currentYear = new Date().getFullYear();
                                                    const isTrulyOverdue = debtorsYear < currentYear || (debtorsYear === currentYear && monthNum < currentMonth);

                                                    if (isTrulyOverdue) {
                                                        bgClass = 'bg-danger text-white';
                                                        content = <span className="fw-bold">✗</span>;
                                                    }
                                                }

                                                cells.push(<td key={`m${monthNum}`} className={`text-center ${bgClass}`} style={{ width: '45px' }}>{content}</td>);
                                            }

                                            // Calculate total transaction amount
                                            const totalTransactionAmount = feeAmount * monthsPaidCount;
                                            rowTotalPaid = totalTransactionAmount;
                                            grandTotalPaid += rowTotalPaid;

                                            // 2. Accumulate the total transaction amount ONLY in the month of payment_date
                                            if (transactionMonth !== -1) {
                                                monthlyTotals[transactionMonth - 1] += totalTransactionAmount;
                                            }

                                            // Conditional logic for background color
                                            const debtBgClass = totalDebtValue > 0 ? "bg-danger text-white" : "text-dark";

                                            // NEW COLUMN: Total Pagado per Property
                                            cells.push(
                                                <td key="totalpaid" className="text-end fw-bold text-success" style={{ minWidth: '85px' }}>
                                                    ${rowTotalPaid.toFixed(2)}
                                                </td>
                                            );

                                            // EXISTING COLUMN: Total Deuda per Property (Applying conditional class)
                                            cells.push(
                                                <td
                                                    key="totaldebt"
                                                    className={`text-end fw-bold ${debtBgClass}`}
                                                    style={{ minWidth: '95px' }}
                                                >
                                                    ${totalDebtValue.toFixed(2)}
                                                </td>
                                            );

                                            return <tr key={i}>{cells}</tr>;
                                        });

                                        // 3. Construct the NEW SUMMATION ROW

                                        // Conditional logic for the Grand Total Debt background color
                                        const grandTotalDebtBgClass = totalAmount > 0 ? "bg-danger text-white" : "bg-secondary text-white";

                                        const totalRow = (
                                            <tr key="final-totals" className="fw-bold bg-light">
                                                <td colSpan={4} className="text-left text-primary">
                                                    TOTAL PAGADO POR MES:
                                                </td>
                                                {monthlyTotals.map((total, index) => {
                                                    const monthNum = index + 1;
                                                    const isCurrentMonth = monthNum === currentMonthNum && debtorsYear === currentYear;
                                                    const totalBgClass = isCurrentMonth ? 'bg-warning text-dark' : (total > 0 ? 'text-success' : 'text-muted');

                                                    return (
                                                        <td key={`mt-${index}`} className={`text-center ${totalBgClass}`}>
                                                            {total > 0 ? `$${total.toFixed(2)}` : '-'}
                                                        </td>
                                                    );
                                                })}
                                                {/* Summation for the NEW Total Pagado column */}
                                                <td key="gtpaid" className="text-end text-success">
                                                    ${grandTotalPaid.toFixed(2)}
                                                </td>
                                                {/* Summation for the Total Deuda column (Applying conditional class) */}
                                                <td key="gtdebt" className={`text-end fw-bold ${grandTotalDebtBgClass}`}>
                                                    ${totalAmount.toFixed(2)}
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