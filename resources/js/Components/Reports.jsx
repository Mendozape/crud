import React, { useState, useEffect } from "react";
import JsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";
import * as XLSX from "xlsx";

// React functional component for generating reports
const Reports = () => {
    // --- CONSTANTS & HELPERS ---
    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const currentMonthNum = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    // --- STATE VARIABLES ---
    const [fees, setFees] = useState([]);
    const [paymentType, setPaymentType] = useState("");
    const [reportType, setReportType] = useState("debtors");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [ingresoYear, setIngresoYear] = useState(currentYear);
    const [gastoMonth, setGastoMonth] = useState(currentMonthNum);
    const [gastoYear, setGastoYear] = useState(currentYear);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentMonthExpenses, setCurrentMonthExpenses] = useState({ 
        expenses: [], 
        total: 0, 
        monthName: monthNames[currentMonthNum - 1], 
        year: currentYear 
    });

    const totalMonthColumns = 12;
    const totalTrailingColumns = 5;
    const fullTableColSpan = 2 + totalMonthColumns + totalTrailingColumns;

    const filteredData = data.filter(row => 
        row.full_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.fee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.comments || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        setIngresoYear(currentYear);
        setData([]);
        setSearchTerm("");
    };

    const getLastMonthToConsider = (year) => {
        const today = new Date();
        const thisYear = today.getFullYear();
        const thisMonth = today.getMonth() + 1;

        if (year < thisYear) return 12;
        if (year > thisYear) return 0;
        return Math.max(0, thisMonth - 1);
    };

    const getRowMonthsOverdueUpToPrevMonth = (row) => {
        const lastMonth = getLastMonthToConsider(ingresoYear);
        if (lastMonth <= 0) return 0;

        let unpaidCount = 0;
        for (let m = 1; m <= lastMonth; m++) {
            const isRegistered = !!row[`month_${m}`];
            if (!isRegistered) unpaidCount++;
        }
        return unpaidCount;
    };
    
    const getRowMonthsOverdueBeforeYear = (row) => {
        return Number(row.months_overdue || 0);
    };

    const getTotalMonthsOverdue = (row) => {
        return getRowMonthsOverdueUpToPrevMonth(row) + getRowMonthsOverdueBeforeYear(row);
    };

    const getTotalDebt = (row) => {
        const totalMonths = getTotalMonthsOverdue(row);
        const feeAmount = Number(row.fee_amount || 0);
        return totalMonths * feeAmount;
    };

    const getReportTitle = () => {
        const baseTitle = "ADEUDOS POR PREDIO";
        return `${baseTitle} - ${currentPaymentDisplayName.toUpperCase()}`;
    };

    const getFilterDetails = () => {
        const details = [];
        details.push(`Tipo de Pago: ${paymentType}`);
        details.push(`Año de Ingresos (Reporte Anual): ${ingresoYear}`);
        details.push(`Filtro Egresos: ${monthNames[gastoMonth - 1]} ${gastoYear}`);
        details.push(`Al día: ${new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}`);
        return details;
    };

    // --- FETCH LOGIC ---

    const fetchExpenses = async (month = gastoMonth, year = gastoYear) => {
        try {
            const url = `/api/reports/expenses?month=${encodeURIComponent(month)}&year=${encodeURIComponent(year)}`;
            const res = await fetch(url, { credentials: "include" });
            const json = await res.json();
            
            if (json.expenses) {
                const monthIndex = Number(json.month) - 1;
                setCurrentMonthExpenses({
                    expenses: json.expenses || [],
                    total: json.total ?? 0,
                    monthName: json.month_name || monthNames[monthIndex < 0 ? 0 : monthIndex],
                    year: json.year || year,
                });
            } else {
                setCurrentMonthExpenses({ 
                    expenses: [], 
                    total: 0, 
                    monthName: monthNames[(Number(month) - 1) % 12], 
                    year 
                });
            }
        } catch (err) {
            console.error("Error fetching monthly expenses:", err);
            setCurrentMonthExpenses({ 
                expenses: [], 
                total: 0, 
                monthName: monthNames[(Number(month) - 1) % 12], 
                year 
            });
        }
    };

    const fetchReport = async () => {
        if (!paymentType || reportType !== "debtors") {
            setData([]);
            return;
        }

        if (!ingresoYear || ingresoYear < 2000 || ingresoYear > 2100) {
            console.error("Invalid year:", ingresoYear);
            setData([]);
            return;
        }

        setLoading(true);
        const encodedPaymentType = encodeURIComponent(paymentType);
        const url = `/api/reports/debtors?payment_type=${encodedPaymentType}&year=${ingresoYear}`;

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
        axios.get("/api/fees", { 
            withCredentials: true, 
            headers: { Accept: "application/json" } 
        })
        .then(res => setFees(Array.isArray(res.data.data) ? res.data.data : []))
        .catch(() => setFees([]));

        fetchExpenses(gastoMonth, gastoYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const delay = setTimeout(() => {
            if (paymentType && reportType === "debtors") {
                fetchReport();
            } else {
                setData([]);
            }
        }, 400);
        return () => clearTimeout(delay);
    }, [paymentType, reportType, ingresoYear]);

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchExpenses(gastoMonth, gastoYear);
        }, 200);
        return () => clearTimeout(delay);
    }, [gastoMonth, gastoYear]);

    // --- EXPORT FUNCTIONS ---
    
    const generateExcel = () => {
        try {
            if (data.length === 0) {
                alert("No hay datos para generar el Excel.");
                return;
            }

            // Prepare data for Excel
            const excelData = [];
            
            // 1. Add title and filter details
            excelData.push([getReportTitle()]);
            excelData.push([]);
            
            const filterDetails = getFilterDetails();
            filterDetails.forEach(detail => {
                excelData.push([detail]);
            });
            excelData.push([]);
            
            // 2. Add debtors table headers
            const tableHeaders = [
                "Dirección/Predio",
                "Tipo de Pago",
                "vencidos < 2026",
                "Ene", "Feb", "Mar", "Abr", "May", "Jun", 
                "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
                "Ingreso anual",
                "Meses vencidos",
                "Deuda",
                "Comentarios"
            ];
            excelData.push(tableHeaders);

            // 3. Add debtors data rows
            const monthlyCalendarTotals = Array(12).fill(0);
            let grandTotalPaid = 0;
            let grandTotalDebt = 0;
            let grandTotalMonthsOverdue = 0;
            let grandTotalMonthsOverdueBeforeYear = 0;

            filteredData.forEach(row => {
                let rowTotalPaid = 0;
                const feeAmount = Number(row.fee_amount || 0);
                
                // Calculate row data
                for (let m = 1; m <= 12; m++) {
                    const calendarAmount = Number(row[`total_paid_in_month_${m}`] || 0);
                    monthlyCalendarTotals[m - 1] += calendarAmount;
                    
                    if (row[`month_${m}`]) {
                        rowTotalPaid += Number(row[`month_${m}_amount_paid`] ?? feeAmount);
                    }
                }
                
                const monthsOverdueBeforeYear = getRowMonthsOverdueBeforeYear(row);
                const totalMonthsOverdue = getTotalMonthsOverdue(row);
                const totalDebtValue = getTotalDebt(row);
                
                // Update grand totals
                grandTotalPaid += rowTotalPaid;
                grandTotalDebt += totalDebtValue;
                grandTotalMonthsOverdue += totalMonthsOverdue;
                grandTotalMonthsOverdueBeforeYear += monthsOverdueBeforeYear;
                
                // Create row data
                const rowData = [
                    row.full_address || '',
                    row.fee_name || currentPaymentDisplayName,
                    monthsOverdueBeforeYear,
                ];
                
                // Add monthly cells
                for (let m = 1; m <= 12; m++) {
                    const isRegistered = !!row[`month_${m}`];
                    const amountPaid = Number(row[`month_${m}_amount_paid`] ?? 0);
                    const status = row[`month_${m}_status`];
                    const isWaived = status === 'Condonado' || amountPaid === 0;
                    
                    if (isRegistered) {
                        if (isWaived) {
                            rowData.push("Condonado");
                        } else {
                            rowData.push(formatCurrency(amountPaid));
                        }
                    } else {
                        const lastMonth = getLastMonthToConsider(ingresoYear);
                        rowData.push(m <= lastMonth ? "X" : "-");
                    }
                }
                
                // Add trailing columns with formatting
                rowData.push(formatCurrency(rowTotalPaid));
                rowData.push(totalMonthsOverdue);
                rowData.push(formatCurrency(totalDebtValue));
                rowData.push(row.comments || '-');
                
                excelData.push(rowData);
            });
            
            // 4. Add debtors total row
            const totalRow = [
                "INGRESOS (ACUMULADO " + ingresoYear + "):",
                "",
                grandTotalMonthsOverdueBeforeYear,
            ];
            
            // Add monthly totals
            monthlyCalendarTotals.forEach(total => {
                totalRow.push(total > 0 ? formatCurrency(total) : "-");
            });
            
            // Add grand totals
            totalRow.push(formatCurrency(grandTotalPaid));
            totalRow.push(grandTotalMonthsOverdue);
            totalRow.push(formatCurrency(grandTotalDebt));
            totalRow.push("");
            
            excelData.push(totalRow);
            excelData.push([]);
            
            // 5. Add expenses section
            const expensesToDisplay = currentMonthExpenses.expenses || [];
            if (expensesToDisplay.length > 0 || currentMonthExpenses.total > 0) {
                excelData.push([`GASTOS / EGRESOS (${currentMonthExpenses.monthName.toUpperCase()} ${currentMonthExpenses.year})`]);
                excelData.push([]);
                
                excelData.push([
                    "Categoría",
                    "Monto"
                ]);
                
                expensesToDisplay.forEach(exp => {
                    excelData.push([
                        exp.category?.name || 'N/A',
                        formatCurrency(exp.amount)
                    ]);
                });
                
                excelData.push([
                    `TOTAL EGRESOS (${currentMonthExpenses.monthName.toUpperCase()} ${currentMonthExpenses.year}):`,
                    formatCurrency(currentMonthExpenses.total)
                ]);
                
                excelData.push([]);
                
                // 6. Add balance (saldo) row
                const monthlyTotalIndex = Number(gastoMonth) - 1;
                const monthlyIncomeForBalance = monthlyCalendarTotals[monthlyTotalIndex] || 0;
                const saldo = monthlyIncomeForBalance - currentMonthExpenses.total;
                
                const ingresoFormatted = formatCurrency(monthlyIncomeForBalance);
                const egresoFormatted = formatCurrency(currentMonthExpenses.total);
                const saldoFormatted = formatCurrency(saldo);
                
                excelData.push([
                    `SALDO (${currentMonthExpenses.monthName.toUpperCase()} ${currentMonthExpenses.year}):`,
                    `${ingresoFormatted} - ${egresoFormatted} = ${saldoFormatted}`
                ]);
            }
            
            // 7. Create worksheet and workbook
            const ws = XLSX.utils.aoa_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Reporte Adeudos");

            // 8. Style the worksheet - Add styling for Excel
            const debtorsColWidths = [
                { wch: 30 },
                { wch: 15 },
                { wch: 10 },
                { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
                { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
                { wch: 15 },
                { wch: 12 },
                { wch: 15 },
                { wch: 25 },
            ];
            ws['!cols'] = debtorsColWidths;

            // Add cell styling for Excel
            const range = XLSX.utils.decode_range(ws['!ref']);
            
            // Style headers (row 5, zero-based index 4)
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({r: 4, c: C});
                if (!ws[cellAddress]) continue;
                
                // Add bold style to headers
                ws[cellAddress].s = {
                    font: { bold: true },
                    alignment: { 
                        horizontal: C === 0 || C === 1 || C === 18 ? 'left' : 
                                   C >= 2 && C <= 14 ? 'center' : 
                                   C === 15 || C === 17 ? 'right' : 
                                   C === 16 ? 'center' : 'left'
                    }
                };
            }

            // Style data rows
            for (let R = 5; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cellAddress = XLSX.utils.encode_cell({r: R, c: C});
                    if (!ws[cellAddress]) continue;
                    
                    const cellValue = ws[cellAddress].v;
                    const cellStyle = { alignment: {} };
                    
                    // Set alignment based on column
                    if (C === 0 || C === 1 || C === 18) {
                        cellStyle.alignment.horizontal = 'left';
                    } else if (C === 15 || C === 17) {
                        cellStyle.alignment.horizontal = 'right';
                    } else if (C === 16) {
                        cellStyle.alignment.horizontal = 'center';
                    } else if (C >= 2 && C <= 14) {
                        cellStyle.alignment.horizontal = 'center';
                    }
                    
                    // Apply conditional formatting for "vencidos < 2026" (column 2)
                    if (C === 2 && cellValue > 0) {
                        cellStyle.fill = { fgColor: { rgb: "FF0000" } };
                        cellStyle.font = { color: { rgb: "FFFFFF" }, bold: true };
                    }
                    
                    // Apply conditional formatting for "Meses vencidos" (column 16)
                    if (C === 16 && cellValue > 0) {
                        cellStyle.fill = { fgColor: { rgb: "FF0000" } };
                        cellStyle.font = { color: { rgb: "FFFFFF" }, bold: true };
                    }
                    
                    // Apply conditional formatting for "Deuda" (column 17)
                    if (C === 17 && cellValue && cellValue > 0) {
                        cellStyle.fill = { fgColor: { rgb: "FF0000" } };
                        cellStyle.font = { color: { rgb: "FFFFFF" }, bold: true };
                    }
                    
                    // Style for "Pagado" column (green text)
                    if (C === 15 && cellValue && typeof cellValue === 'string' && cellValue.includes('$')) {
                        cellStyle.font = { color: { rgb: "28A745" }, bold: true };
                    }
                    
                    // Style for "X" in monthly columns (red)
                    if (C >= 3 && C <= 14 && cellValue === 'X') {
                        cellStyle.fill = { fgColor: { rgb: "DC3545" } };
                        cellStyle.font = { color: { rgb: "FFFFFF" }, bold: true };
                    }
                    
                    // Style for "Condonado" in monthly columns (blue)
                    if (C >= 3 && C <= 14 && cellValue === 'Condonado') {
                        cellStyle.fill = { fgColor: { rgb: "6495ED" } };
                        cellStyle.font = { color: { rgb: "FFFFFF" }, bold: true };
                    }
                    
                    ws[cellAddress].s = cellStyle;
                }
            }

            // 9. Generate Excel file
            const fileName = `reporte_adeudos_${currentPaymentDisplayName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;
            XLSX.writeFile(wb, fileName);

        } catch (error) {
            console.error("Error al generar Excel:", error);
            alert("Ocurrió un error al generar el Excel. Por favor, verifica la consola para más detalles.");
        }
    };

    // --- PDF GENERATION ---
    
    const generatePdf = () => {
        try {
            if (data.length === 0) {
                alert("No hay datos para generar el PDF.");
                return;
            }
            
            if (typeof JsPDF === "undefined") {
                alert("Error: jsPDF no está disponible.");
                return;
            }
            
            const doc = new JsPDF("l", "pt", "a4");
            const title = getReportTitle();
            const filterDetails = getFilterDetails();
            let startY = 40;
            const margin = 40;

            // 1. Title and Filter Details setup
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

            // 2. INCOME (INGRESOS) / DEBTORS TABLE GENERATION
            const tableHeaders = [];
            const monthlyCalendarTotals = Array(12).fill(0);
            
            tableHeaders.push([
                "Dirección/Predio",
                "Tipo de Pago",
                "vencidos < 2026",
                "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
                "Ingreso anual",
                "Meses vencidos",
                "Deuda",
                "Comentarios"
            ]);

            const processedData = data.map(row => {
                let rowTotalPaid = 0;
                const feeAmount = Number(row.fee_amount || 0);

                for (let m = 1; m <= 12; m++) {
                    const calendarAmount = Number(row[`total_paid_in_month_${m}`] || 0);
                    monthlyCalendarTotals[m - 1] += calendarAmount;
                    
                    if (row[`month_${m}`]) {
                        rowTotalPaid += Number(row[`month_${m}_amount_paid`] ?? feeAmount);
                    }
                }
                
                const monthsOverdueBeforeYear = getRowMonthsOverdueBeforeYear(row);
                const totalMonthsOverdue = getTotalMonthsOverdue(row);
                const totalDebtValue = getTotalDebt(row);

                const bodyRow = [
                    row.full_address,
                    row.fee_name || currentPaymentDisplayName,
                    monthsOverdueBeforeYear.toString(),
                ];

                for (let m = 1; m <= 12; m++) {
                    const isRegistered = !!row[`month_${m}`];
                    const dateStr = row[`month_${m}_date`] ? 
                        new Date(row[`month_${m}_date`]).toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit" }) : "";
                    const amountPaid = Number(row[`month_${m}_amount_paid`] ?? 0);
                    const status = row[`month_${m}_status`];

                    if (isRegistered) {
                        const amountDisplay = amountPaid > 0 ? formatCurrency(amountPaid) : '';
                        
                        let visualContent;
                        const isWaived = status === 'Condonado' || amountPaid === 0;

                        if (isWaived) {
                            visualContent = [dateStr, "Condonado"].filter(Boolean).join("\n");
                        } else {
                            visualContent = [dateStr, amountDisplay].filter(Boolean).join("\n");
                        }
                        
                        bodyRow.push(visualContent);
                    } else {
                        const lastMonth = getLastMonthToConsider(ingresoYear);
                        if (m <= lastMonth) bodyRow.push("X");
                        else bodyRow.push("-");
                    }
                }

                bodyRow.push(formatCurrency(rowTotalPaid));
                bodyRow.push(totalMonthsOverdue.toString());
                bodyRow.push(formatCurrency(totalDebtValue));
                bodyRow.push(row.comments || '-');

                return bodyRow;
            });
            
            const grandTotalPaidDisplayed = monthlyCalendarTotals.reduce((sum, val) => sum + val, 0);
            const grandTotalDebt = data.reduce((sum, row) => sum + getTotalDebt(row), 0);
            const grandTotalMonthsOverdue = data.reduce((sum, row) => sum + getTotalMonthsOverdue(row), 0);
            const grandTotalMonthsOverdueBeforeYear = data.reduce((sum, row) => sum + getRowMonthsOverdueBeforeYear(row), 0);

            const totalRow = ["INGRESOS (ACUMULADO " + ingresoYear + "):", "", grandTotalMonthsOverdueBeforeYear.toString()];
            
            monthlyCalendarTotals.forEach(total => totalRow.push(total > 0 ? formatCurrency(total) : "-"));

            totalRow.push(formatCurrency(grandTotalPaidDisplayed));
            totalRow.push(grandTotalMonthsOverdue.toString());
            totalRow.push(formatCurrency(grandTotalDebt));
            totalRow.push("");

            processedData.push(totalRow);
            
            // Updated column styles to match HTML table alignment
            const currentColumnStyles = {
                0: { halign: "left", cellWidth: 120 },
                1: { halign: "left", cellWidth: 70 },
                2: { halign: "center", cellWidth: 40 },
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
                14: { halign: "center", cellWidth: 32 },
                15: { halign: "center", cellWidth: 60 }, // Changed from right to center
                16: { halign: "center", cellWidth: 40 },
                17: { halign: "center", cellWidth: 70 }, // Changed from right to center
                18: { halign: "left", cellWidth: 70 }
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
                    const monthIndexStart = 3;

                    // --- Final Row Styling ---
                    if (data.row.index === finalRowIndex) { 
                        if (data.column.index === 0) {
                            data.cell.colSpan = 2; 
                            data.cell.styles.halign = 'left';
                        } else if (data.column.index === 1) {
                            return false;
                        }
                        
                        // Style for "vencidos < 2026" total row - RED when > 0
                        if (data.column.index === 2 && grandTotalMonthsOverdueBeforeYear > 0) {
                            data.cell.styles.fillColor = [220, 53, 69];
                            data.cell.styles.textColor = 255;
                            data.cell.styles.fontStyle = "bold";
                        }

                        if (data.column.index >= monthIndexStart && data.column.index < columnCount - 4) {
                            const monthNum = data.column.index - monthIndexStart + 1;
                            if (monthNum === currentMonthNum && ingresoYear === currentYear) {
                                data.cell.styles.fillColor = [255, 255, 153]; 
                                data.cell.styles.textColor = [0, 0, 0];
                            }
                        }
                        
                        // "Ingreso anual" total styling - green text
                        if (data.column.index === 15) {
                            data.cell.styles.textColor = [40, 167, 69]; // Green
                            data.cell.styles.fontStyle = "bold";
                        }
                        
                        // "Meses vencidos" total styling - RED when > 0
                        if (data.column.index === 16 && grandTotalMonthsOverdue > 0) {
                            data.cell.styles.fillColor = [220, 53, 69];
                            data.cell.styles.textColor = 255;
                            data.cell.styles.fontStyle = "bold";
                        }

                        // "Deuda" total styling - RED when > 0
                        if (data.column.index === 17 && grandTotalDebt > 0) {
                            data.cell.styles.fillColor = [220, 53, 69];
                            data.cell.styles.textColor = 255;
                            data.cell.styles.fontStyle = "bold";
                        }

                    } else { 
                        // --- Regular Data Row Styling ---
                        
                        // "vencidos < 2026" Column - RED when > 0
                        if (data.column.index === 2) {
                            const monthsOverdueBeforeYear = getRowMonthsOverdueBeforeYear(data.row.raw);
                            if (monthsOverdueBeforeYear > 0) {
                                data.cell.styles.fillColor = [220, 53, 69];
                                data.cell.styles.textColor = 255;
                                data.cell.styles.fontStyle = "bold";
                            }
                        }
                        
                        // "Ingreso anual" Column - green text
                        if (data.column.index === 15) {
                            data.cell.styles.textColor = [40, 167, 69]; // Green
                            data.cell.styles.fontStyle = "bold";
                        }
                        
                        // "Meses vencidos" Column - RED when > 0
                        if (data.column.index === 16) {
                            const totalMonthsOverdue = getTotalMonthsOverdue(data.row.raw);
                            if (totalMonthsOverdue > 0) {
                                data.cell.styles.fillColor = [220, 53, 69];
                                data.cell.styles.textColor = 255;
                                data.cell.styles.fontStyle = "bold";
                            }
                        }

                        // "Deuda" Column - RED when > 0
                        if (data.column.index === 17) {
                            const totalDebtValue = getTotalDebt(data.row.raw);
                            if (totalDebtValue > 0) {
                                data.cell.styles.fillColor = [220, 53, 69];
                                data.cell.styles.textColor = 255;
                                data.cell.styles.fontStyle = "bold";
                            }
                        }

                        // Monthly Columns Styling
                        if (data.column.index >= monthIndexStart && data.column.index <= 14) {
                            const cellText = String(data.cell.text);
                            
                            // "X" cells - RED background
                            if (cellText && cellText[0] === 'X') {
                                data.cell.styles.fillColor = [220, 53, 69];
                                data.cell.styles.textColor = 255;
                                data.cell.styles.fontStyle = "bold";
                            } 
                            // "Condonado" cells - BLUE background
                            else if (cellText.includes('Condonado')) {
                                data.cell.styles.fillColor = [100, 149, 237];
                                data.cell.styles.textColor = 255;
                                data.cell.styles.fontStyle = "bold";
                            }

                            // Adjust font size for multi-line cells
                            if (cellText.includes("\n")) {
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

            // 3. EXPENSE TABLE GENERATION
            let expenseStartY = doc.autoTable.previous.finalY + 15;
            const expensesToDisplay = (currentMonthExpenses.expenses || []);
            
            if (expensesToDisplay.length > 0) {
                doc.setFontSize(14);
                doc.setTextColor(220, 53, 69);
                doc.text(`GASTOS / EGRESOS (${currentMonthExpenses.monthName.toUpperCase()} ${currentMonthExpenses.year})`, margin, expenseStartY);
                expenseStartY += 10;

                const expenseTableHeaders = [
                    ["Categoría", "Descripción", "Fecha", "Monto"]
                ];

                const expenseTableBody = expensesToDisplay.map(exp => [
                    exp.category?.name || 'N/A', 
                    exp.description || '-', 
                    new Date(exp.expense_date).toLocaleDateString("es-MX", { year: "numeric", month: "2-digit", day: "2-digit" }), 
                    formatCurrency(exp.amount)
                ]);
                
                expenseTableBody.push([
                    { content: `TOTAL EGRESOS (${currentMonthExpenses.monthName.toUpperCase()} ${currentMonthExpenses.year}):`, colSpan: 3, styles: { fontStyle: 'bold', halign: 'right', fillColor: [220, 220, 220] } },
                    { content: formatCurrency(currentMonthExpenses.total), styles: { fontStyle: 'bold', halign: 'right', fillColor: [220, 220, 220], textColor: [220, 53, 69] } }
                ]);

                doc.autoTable({
                    head: expenseTableHeaders,
                    body: expenseTableBody,
                    startY: expenseStartY,
                    theme: "grid",
                    margin: { left: margin, right: margin },
                    headStyles: {
                        fillColor: [220, 53, 69],
                        textColor: 255,
                        fontStyle: "bold",
                        fontSize: 8,
                        halign: "center"
                    },
                    styles: {
                        fontSize: 8,
                        cellPadding: 2,
                        halign: "left"
                    },
                    columnStyles: {
                        0: { cellWidth: 100 },
                        1: { cellWidth: 350 },
                        2: { cellWidth: 60, halign: 'center' },
                        3: { cellWidth: 80, halign: 'right' }
                    },
                    didDrawPage: function (data) {
                        doc.setFontSize(10);
                        doc.text(`Página ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.width - margin, doc.internal.pageSize.height - 20, { align: "right" });
                    }
                });
                expenseStartY = doc.autoTable.previous.finalY + 15;
            } else {
                expenseStartY += 10;
            }

            // 4. BALANCE (SALDO) ROW
            const monthlyTotalIndex = Number(gastoMonth) - 1;
            const monthlyIncomeForBalance = monthlyCalendarTotals[monthlyTotalIndex] || 0;
            const saldo = monthlyIncomeForBalance - currentMonthExpenses.total;
            
            const ingresoFormatted = formatCurrency(monthlyIncomeForBalance);
            const egresoFormatted = formatCurrency(currentMonthExpenses.total);
            const saldoFormatted = formatCurrency(saldo);
            const formulaString = `${ingresoFormatted} - ${egresoFormatted} = ${saldoFormatted}`;
            
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            
            const saldoBgColor = saldo >= 0 ? [40, 167, 69] : [220, 53, 69]; // Green for positive, Red for negative
            doc.setFillColor(saldoBgColor[0], saldoBgColor[1], saldoBgColor[2]);
            doc.rect(margin, expenseStartY, doc.internal.pageSize.width - (2 * margin), 25, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.text(`SALDO (${currentMonthExpenses.monthName.toUpperCase()} ${currentMonthExpenses.year}):`, margin + 10, expenseStartY + 15);
            doc.text(formulaString, doc.internal.pageSize.width - margin - 10, expenseStartY + 15, { align: "right" });

            const fileName = `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
            doc.save(fileName);
            
        } catch (error) {
            console.error("Error al generar PDF:", error);
            alert("Ocurrió un error al generar el PDF. Por favor, verifica la consola para más detalles.");
        }
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
                </div>

                {paymentType && (
                    <div className="border-top pt-3 mt-3">
                        <h5 className="mb-3 text-secondary">Filtros por Fecha</h5>
                        <div className="row g-2 align-items-end">
                            
                            <div className="col-md-3 col-6">
                                <label className="form-label form-label-sm fw-bold text-primary">Año - Ingresos</label>
                                <select
                                    className="form-control"
                                    value={ingresoYear}
                                    onChange={(e) => setIngresoYear(parseInt(e.target.value) || currentYear)}
                                >
                                    {Array.from({ length: 11 }, (_, i) => {
                                        const year = currentYear - 5 + i;
                                        return <option key={year} value={year}>{year}</option>;
                                    })}
                                </select>
                            </div>
                            
                            <div className="col-md-3 col-6">
                                <label className="form-label form-label-sm fw-bold text-danger">Mes - Gastos</label>
                                <select
                                    className="form-control"
                                    value={gastoMonth}
                                    onChange={(e) => setGastoMonth(parseInt(e.target.value) || currentMonthNum)}
                                >
                                    {monthNames.map((m, idx) => <option key={idx + 1} value={idx + 1}>{m}</option>)}
                                </select>
                            </div>
                            
                            <div className="col-md-3 col-6">
                                <label className="form-label form-label-sm fw-bold text-danger">Año - Gastos</label>
                                <select
                                    className="form-control"
                                    value={gastoYear}
                                    onChange={(e) => setGastoYear(parseInt(e.target.value) || currentYear)}
                                >
                                    {Array.from({ length: 11 }, (_, i) => {
                                        const year = currentYear - 5 + i;
                                        return <option key={year} value={year}>{year}</option>;
                                    })}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {paymentType && (
                <div className="card shadow">
                    <div className="card-header bg-dark text-white fw-bold text-center">
                        {reportType === "debtors"
                            ? `Resultados del Reporte: ADEUDOS POR PREDIO - ${currentPaymentDisplayName.toUpperCase()} - Año ${ingresoYear} - Al día: ${new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}`
                            : "Seleccione un Tipo de Pago para generar el Reporte."}
                    </div>

                    <div className="card-body p-0">
                        {loading ? (
                            <div className="p-4 text-center text-muted">Cargando datos...</div>
                        ) : data.length === 0 && reportType === "debtors" ? (
                            <div className="p-4 text-center text-muted">No hay datos disponibles para los filtros seleccionados.</div>
                        ) : reportType === "debtors" ? (
                            <>
                                <div className="p-3 border-bottom">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Buscar por dirección, tipo de pago o comentarios..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-bordered table-hover mb-0 table-striped table-sm">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="text-left" style={{ minWidth: '250px' }}>Dirección/Predio</th>
                                                <th className="text-left" style={{ minWidth: '80px' }}>Tipo de Pago</th>
                                                <th className="text-center" style={{ minWidth: '60px' }}>
                                                    vencidos &lt; 2026
                                                </th>
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map(monthNum => (
                                                    <th key={monthNum} className="text-center" style={{ width: '50px' }}>
                                                        {(monthNum === currentMonthNum && ingresoYear === currentYear) &&
                                                            <div className="fw-bold text-danger pb-1" style={{ fontSize: '1.1em', lineHeight: '0.8' }}>⬇️</div>
                                                        }
                                                        {monthNames[monthNum - 1].substring(0, 3)}
                                                    </th>
                                                ))}
                                                <th className="text-center" style={{ minWidth: '70px' }}>Ingreso anual</th>
                                                <th className="text-center" style={{ minWidth: '60px' }}>Meses vencidos</th>
                                                <th className="text-center" style={{ minWidth: '90px' }}>Deuda</th>
                                                <th className="text-left" style={{ minWidth: '100px' }}>Comentarios</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {(() => {
                                                const monthlyCalendarTotals = Array(12).fill(0);
                                                const rows = filteredData.map((row, i) => {
                                                    let rowTotalPaid = 0;
                                                    const feeAmount = Number(row.fee_amount || 0);
                                                    const totalMonthsOverdue = getTotalMonthsOverdue(row);
                                                    const totalDebtValue = getTotalDebt(row);
                                                    const monthsOverdueBeforeYear = getRowMonthsOverdueBeforeYear(row);

                                                    const cells = [
                                                        <td key={`addr-${i}`} className="text-left">{row.full_address}</td>,
                                                        <td key={`type-${i}`} className="text-left">{row.fee_name || currentPaymentDisplayName}</td>,
                                                        <td key={`overdue-before-${i}`} className={`text-center fw-bold ${monthsOverdueBeforeYear > 0 ? "bg-danger text-white" : "text-muted"}`} style={{ minWidth: '60px' }}>{monthsOverdueBeforeYear}</td>,
                                                    ];

                                                    for (let m = 1; m <= 12; m++) {
                                                        const isRegistered = !!row[`month_${m}`];
                                                        const paymentDateStr = row[`month_${m}_date`];
                                                        const amountPaid = Number(row[`month_${m}_amount_paid`] ?? feeAmount);
                                                        const status = row[`month_${m}_status`];

                                                        if (isRegistered) {
                                                            rowTotalPaid += amountPaid;
                                                        }
                                                        
                                                        const calendarAmount = Number(row[`total_paid_in_month_${m}`] || 0);
                                                        monthlyCalendarTotals[m - 1] += calendarAmount;
                                                        
                                                        if (isRegistered) {
                                                            let content;
                                                            let cellClass = 'text-center';
                                                            const isWaived = status === 'Condonado' || amountPaid === 0;

                                                            if (isWaived) {
                                                                const dateText = paymentDateStr ? new Date(paymentDateStr).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' }) : '';
                                                                const statusText = <small className="d-block text-white fw-bold" style={{ fontSize: '0.65em' }}>condonado</small>;

                                                                content = (
                                                                    <div style={{ lineHeight: 1 }}>
                                                                        <div className="text-white fw-bold">✓</div>
                                                                        {dateText && <small className="d-block text-white" style={{ fontSize: '0.65em' }}>{dateText}</small>}
                                                                        {statusText}
                                                                    </div>
                                                                );
                                                                cellClass = 'text-center bg-info text-white';
                                                            } else {
                                                                const dateText = paymentDateStr ? new Date(paymentDateStr).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' }) : '';
                                                                const amountText = formatCurrency(amountPaid);
                                                                
                                                                content = (
                                                                    <div style={{ lineHeight: 1 }}>
                                                                        <div className="text-success fw-bold">✓</div>
                                                                        {dateText && <small className="d-block" style={{ fontSize: '0.65em' }}>{dateText}</small>}
                                                                        {amountText && <small className="d-block" style={{ fontSize: '0.65em' }}>{amountText}</small>}
                                                                    </div>
                                                                );
                                                                cellClass = 'text-center';
                                                            }

                                                            cells.push(<td key={`m${m}-${i}`} className={cellClass} style={{ width: '50px' }}>{content}</td>);
                                                        } else {
                                                            const lastMonth = getLastMonthToConsider(ingresoYear);
                                                            const isTrulyOverdue = m <= lastMonth;

                                                            if (isTrulyOverdue) {
                                                                cells.push(<td key={`m${m}-${i}`} className="text-center bg-danger text-white fw-bold" style={{ width: '50px' }}>✗</td>);
                                                            } else {
                                                                cells.push(<td key={`m${m}-${i}`} className="text-center text-muted" style={{ width: '50px' }}>-</td>);
                                                            }
                                                        }
                                                    }

                                                    const debtBgClass = totalDebtValue > 0 ? "bg-danger text-white" : "text-dark";
                                                    const monthsOverdueBgClass = totalMonthsOverdue > 0 ? "bg-danger text-dark fw-bold" : "text-dark";

                                                    cells.push(<td key={`totalpaid-${i}`} className="text-center fw-bold text-success" style={{ minWidth: '70px' }}>{formatCurrency(rowTotalPaid)}</td>);
                                                    cells.push(<td key={`monthsOverdue-${i}`} className={`text-center fw-bold ${monthsOverdueBgClass}`} style={{ minWidth: '60px' }}>{totalMonthsOverdue}</td>);
                                                    cells.push(<td key={`totaldebt-${i}`} className={`text-center fw-bold ${debtBgClass}`} style={{ minWidth: '90px' }}>{formatCurrency(totalDebtValue)}</td>);
                                                    cells.push(<td key={`comments-${i}`} className="text-left text-wrap" style={{ minWidth: '100px' }}>{row.comments || '-'}</td>);

                                                    return <tr key={i}>{cells}</tr>;
                                                });

                                                const grandTotalPaidDisplayed = monthlyCalendarTotals.reduce((sum, val) => sum + val, 0);
                                                const totalDebtSum = filteredData.reduce((s, r) => s + getTotalDebt(r), 0);
                                                const grandTotalDebtBgClass = totalDebtSum > 0 ? "bg-danger text-dark fw-bold" : "text-dark";
                                                const grandTotalMonthsOverdue = filteredData.reduce((sum, row) => sum + getTotalMonthsOverdue(row), 0);
                                                const grandTotalMonthsOverdueBeforeYear = filteredData.reduce((sum, row) => sum + getRowMonthsOverdueBeforeYear(row), 0);
                                                const grandTotalMonthsOverdueBgClass = grandTotalMonthsOverdue > 0 ? "bg-danger text-dark fw-bold" : "text-dark";
                                                const finalDebtDisplay = formatCurrency(totalDebtSum);

                                                const totalRow = (
                                                    <tr key="final-totals" className="fw-bold bg-light">
                                                        <td colSpan={2} className="text-left text-primary">INGRESOS (ACUMULADO {ingresoYear}):</td>
                                                        <td key="gt-before-2026" className={`text-center fw-bold ${grandTotalMonthsOverdueBeforeYear > 0 ? "bg-danger text-white" : "text-muted"}`} style={{ minWidth: '60px' }}>
                                                            {grandTotalMonthsOverdueBeforeYear}
                                                        </td>
                                                        {monthlyCalendarTotals.map((total, index) => {
                                                            const monthNum = index + 1;
                                                            const isCurrentMonth = monthNum === currentMonthNum && ingresoYear === currentYear;
                                                            const totalBgClass = isCurrentMonth ? 'bg-warning text-dark' : (total > 0 ? 'text-success' : 'text-muted');

                                                            return (
                                                                <td key={`mt-${index}`} className={`text-center ${totalBgClass}`} style={{ width: '50px' }}>
                                                                    {total > 0 ? formatCurrency(total) : '-'}
                                                                </td>
                                                            );
                                                        })}
                                                        <td key="gtpaid" className="text-center fw-bold text-success" style={{ minWidth: '70px' }}>
                                                            {formatCurrency(grandTotalPaidDisplayed)}
                                                        </td>
                                                        <td key="gtmonths" className={`text-center fw-bold ${grandTotalMonthsOverdueBgClass}`} style={{ minWidth: '60px' }}>
                                                            {grandTotalMonthsOverdue}
                                                        </td>
                                                        <td key="gtdebt" className={`text-center fw-bold ${grandTotalDebtBgClass}`} style={{ minWidth: '90px' }}>
                                                            {finalDebtDisplay}
                                                        </td>
                                                        <td key="gtcomments" className="text-left text-muted" style={{ minWidth: '100px' }}></td>
                                                    </tr>
                                                );
                                                
                                                const expenseRows = [];
                                                const expensesToDisplay = (currentMonthExpenses.expenses || []);
                                                const expenseMonthDisplay = currentMonthExpenses.monthName;
                                                const expenseYearDisplay = currentMonthExpenses.year;
                                                
                                                if ((expensesToDisplay.length > 0) || (currentMonthExpenses.total && currentMonthExpenses.total > 0)) {
                                                    expenseRows.push(
                                                        <tr key="expenses-header" className="fw-bold bg-dark text-white">
                                                            <td colSpan={fullTableColSpan} className="text-center">GASTOS ({expenseMonthDisplay.toUpperCase()} {expenseYearDisplay})</td>
                                                        </tr>
                                                    );

                                                    expensesToDisplay.forEach((expense, expIndex) => {
                                                        const colsBeforeMonth = 2 + 1 + (Number(gastoMonth) - 1);
                                                        const colsAfterMonth = (totalMonthColumns - Number(gastoMonth)) + totalTrailingColumns;
                                                        
                                                        expenseRows.push(
                                                            <tr key={`expense-${expIndex}`} className="text-muted" style={{ fontSize: '0.85em' }}>
                                                                <td colSpan={3} className="text-left">
                                                                    <span className="fw-bold text-danger">➖ {expense.category?.name || expense.category || 'Gasto'}</span>
                                                                    <span className="d-block text-truncate fst-italic" style={{maxWidth: '200px'}}>{expense.description}</span>
                                                                </td>
                                                                {colsBeforeMonth > 3 && <td colSpan={colsBeforeMonth - 3} className="text-center"></td>}
                                                                <td key={`exp-amount-month-${expIndex}`} className="text-end fw-bold text-danger bg-light">
                                                                    {formatCurrency(expense.amount)}
                                                                    <small className="d-block text-muted" style={{fontSize: '0.65em'}}>{new Date(expense.expense_date).toLocaleDateString('es-MX', {day: '2-digit', month: '2-digit', year: 'numeric'})}</small>
                                                                </td>
                                                                {colsAfterMonth > 0 && <td colSpan={colsAfterMonth} className="text-center"></td>}
                                                            </tr>
                                                        );
                                                    });
                                                    
                                                    const totalTextColSpan = 3 + (Number(gastoMonth) - 1);
                                                    const totalAmountColSpan = 1;
                                                    const totalTailColSpan = totalMonthColumns - Number(gastoMonth) + totalTrailingColumns;

                                                    expenseRows.push(
                                                        <tr key="expenses-total" className="fw-bold bg-secondary text-white">
                                                            <td colSpan={totalTextColSpan} className="text-end">TOTAL GASTOS ({expenseMonthDisplay.toUpperCase()} {expenseYearDisplay}):</td>
                                                            <td colSpan={totalAmountColSpan} className="text-end">
                                                                {formatCurrency(currentMonthExpenses.total)}
                                                            </td>
                                                            <td colSpan={totalTailColSpan} className="text-left"></td>
                                                        </tr>
                                                    );
                                                } else if (paymentType) {
                                                    const selectedGastoMonthName = monthNames[Number(gastoMonth) - 1];

                                                    expenseRows.push(
                                                        <tr key="no-expenses">
                                                            <td colSpan={fullTableColSpan} className="text-center text-muted fst-italic p-3">
                                                                No hay gastos registrados para {selectedGastoMonthName} de {gastoYear}.
                                                            </td>
                                                        </tr>
                                                    );
                                                }

                                                const monthlyIncomeForBalance = monthlyCalendarTotals[Number(gastoMonth) - 1] || 0;
                                                const saldo = monthlyIncomeForBalance - currentMonthExpenses.total;

                                                const ingresoFormatted = formatCurrency(monthlyIncomeForBalance);
                                                const egresoFormatted = formatCurrency(currentMonthExpenses.total);
                                                const saldoFormatted = formatCurrency(saldo);
                                                const formulaString = `${ingresoFormatted} - ${egresoFormatted} = ${saldoFormatted}`;
                                                
                                                const saldoBgClass = saldo >= 0 ? 'bg-success' : 'bg-danger';

                                                const saldoRow = (
                                                    <tr key="saldo-total" className={`fw-bold ${saldoBgClass} text-white`}>
                                                        <td colSpan={2} className="text-left fw-bold">
                                                            SALDO ({expenseMonthDisplay.toUpperCase()} {expenseYearDisplay}):
                                                        </td>
                                                        <td colSpan={fullTableColSpan - 2} className="text-end pe-4">
                                                            <span className='text-white'>{formulaString}</span>
                                                        </td>
                                                    </tr>
                                                );
                                                
                                                return rows.concat(totalRow, expenseRows, saldoRow);
                                            })()}
                                        </tbody>
                                    </table>

                                    {filteredData.length === 0 && searchTerm && (
                                        <div className="text-center p-4 text-muted">
                                            No se encontraron registros que coincidan con "{searchTerm}"
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            )}

            {paymentType && data.length > 0 && reportType === "debtors" && (
                <div className="row mt-4">
                    <div className="col-12 text-center">
                        <div className="btn-group" role="group">
                            <button className="btn btn-lg btn-success shadow-sm" onClick={generatePdf} disabled={loading}>
                                ⬇️ Generar PDF
                            </button>
                            <button className="btn btn-lg btn-primary shadow-sm ms-2" onClick={generateExcel} disabled={loading}>
                                📊 Descargar Excel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;