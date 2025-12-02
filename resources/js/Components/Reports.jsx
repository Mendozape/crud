import React, { useState, useEffect } from "react";
import JsPDF from "jspdf";
import "jspdf-autotable";
import axios from "axios";

// React functional component for generating reports
const Reports = () => {
    // --- CONSTANTS & HELPERS ---
    // Month names in Spanish for display purposes
    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    // Get current month (1-12) and year
    const currentMonthNum = new Date().getMonth() + 1; // 1-12 
    const currentYear = new Date().getFullYear();
    
    // --- STATE VARIABLES ---
    // List of available fees/payment types
    const [fees, setFees] = useState([]);
    // Currently selected payment type for the report filter
    const [paymentType, setPaymentType] = useState("");
    // Current report type (e.g., "debtors")
    const [reportType, setReportType] = useState("debtors");
    // Data fetched from the report API (debtors data)
    const [data, setData] = useState([]);
    // Loading indicator for API calls
    const [loading, setLoading] = useState(false);
    
    // Year filter for income/debtors report
    const [ingresoYear, setIngresoYear] = useState(currentYear);
    // Month filter for expense report
    const [gastoMonth, setGastoMonth] = useState(currentMonthNum);
    // Year filter for expense report
    const [gastoYear, setGastoYear] = useState(currentYear);
    // Search term for filtering the table data
    const [searchTerm, setSearchTerm] = useState(""); 
    // State to hold the fetched monthly expenses and total
    const [currentMonthExpenses, setCurrentMonthExpenses] = useState({ 
        expenses: [], 
        total: 0, 
        monthName: monthNames[currentMonthNum - 1], 
        year: currentYear 
    });

    // Constants for table column spanning in the UI table (not strictly needed for logic but helps readability)
    const totalMonthColumns = 12; 
    const totalTrailingColumns = 3; 
    const fullTableColSpan = 2 + totalMonthColumns + totalTrailingColumns;

    // Filter data based on search term (address, fee name, or comments)
    const filteredData = data.filter(row => 
        row.full_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.fee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.comments || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helper function to format currency as MXN (Mexican Pesos) with no fraction digits
    const formatCurrency = (amount) => {
        const num = Number(amount || 0);
        return num.toLocaleString("es-MX", { 
            style: "currency", 
            currency: "MXN", 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 0 
        });
    };

    // Determines the display name for the current payment type filter
    const getPaymentDisplayType = (filterValue) => {
        if (filterValue && filterValue !== "Todos") {
            return filterValue;
        }
        if (filterValue === "Todos" && fees.length > 0) {
            const uniqueNames = [...new Set(fees.map(fee => fee.name))];
            // If all fees have the same name, use that name, otherwise use "Múltiples Cuotas"
            return uniqueNames.length === 1 ? uniqueNames[0] : "Múltiples Cuotas";
        }
        return fees.length > 0 ? "Cuota" : "Sin Cuotas";
    };

    // The display name of the current payment filter
    const currentPaymentDisplayName = getPaymentDisplayType(paymentType);

    // Resets report filters and data state
    const resetFilters = () => {
        setIngresoYear(currentYear);
        setData([]);
        setSearchTerm("");
    };

    // Determines the last completed month to calculate debt (prev month or Dec if year is past)
    const getLastMonthToConsider = (year) => {
        const today = new Date();
        const thisYear = today.getFullYear();
        const thisMonth = today.getMonth() + 1; // 1-12

        if (year < thisYear) return 12; // If past year, consider up to December
        if (year > thisYear) return 0; // If future year, consider 0 months
        return Math.max(0, thisMonth - 1); // Current year: consider up to last month
    };

    // Calculates the total debt for a specific row up to the previous month
    const getRowDebtUpToPrevMonth = (row) => {
        const feeAmount = Number(row.fee_amount || 0);
        const lastMonth = getLastMonthToConsider(ingresoYear); 
        if (lastMonth <= 0) return 0;

        let unpaidCount = 0;
        // Check payment status for months 1 through 'lastMonth'
        for (let m = 1; m <= lastMonth; m++) {
            const isRegistered = !!row[`month_${m}`];
            // Debt is calculated ONLY if the month is NOT registered (paid or condoned)
            if (!isRegistered) unpaidCount++;
        }
        return unpaidCount * feeAmount;
    };

    // Calculates the number of months overdue for a specific row up to the previous month
    const getRowMonthsOverdueUpToPrevMonth = (row) => {
        const lastMonth = getLastMonthToConsider(ingresoYear);
        if (lastMonth <= 0) return 0;

        let unpaidCount = 0;
        // Count unpaid months up to 'lastMonth'
        for (let m = 1; m <= lastMonth; m++) {
            const isRegistered = !!row[`month_${m}`];
            // Months overdue count ONLY if the month is NOT registered (paid or condoned)
            if (!isRegistered) unpaidCount++;
        }
        return unpaidCount;
    };

    // Generates the report title for the PDF
    const getReportTitle = () => {
        const baseTitle = "ADEUDOS POR PREDIO";
        return `${baseTitle} - ${currentPaymentDisplayName.toUpperCase()}`;
    };

    // Collects filter details for the PDF header
    const getFilterDetails = () => {
        const details = [];
        details.push(`Tipo de Pago: ${paymentType}`);
        details.push(`Año de Ingresos (Reporte Anual): ${ingresoYear}`);
        details.push(`Filtro Egresos: ${monthNames[gastoMonth - 1]} ${gastoYear}`);
        details.push(`Al día: ${new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}`);
        return details;
    };

    // --- FETCH LOGIC ---

    // Fetches monthly expenses data
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
                // Set default state if no expenses are returned
                setCurrentMonthExpenses({ 
                    expenses: [], 
                    total: 0, 
                    monthName: monthNames[(Number(month) - 1) % 12], 
                    year 
                });
            }
        } catch (err) {
            console.error("Error fetching monthly expenses:", err);
            // Set default state on error
            setCurrentMonthExpenses({ 
                expenses: [], 
                total: 0, 
                monthName: monthNames[(Number(month) - 1) % 12], 
                year 
            });
        }
    };

    // Fetches the main debtors report data
    const fetchReport = async () => {
        // Skip fetch if payment type is not selected or report type is not 'debtors'
        if (!paymentType || reportType !== "debtors") {
            setData([]);
            return;
        }

        // Basic year validation
        if (!ingresoYear || ingresoYear < 2000 || ingresoYear > 2100) {
            console.error("Año inválido:", ingresoYear);
            setData([]);
            return;
        }

        setLoading(true);
        const encodedPaymentType = encodeURIComponent(paymentType);
        // Uses the addressPayments model as per user request (implicit in the endpoint structure)
        const url = `/api/reports/debtors?payment_type=${encodedPaymentType}&year=${ingresoYear}`;

        try {
            const res = await fetch(url, { credentials: "include" });
            const json = await res.json();
            
            // Filter out aggregation rows named "Total"
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

    // useEffect hook to fetch initial data (fees and current month expenses) once on mount
    useEffect(() => {
        // Fetch list of fees/payment types
        axios.get("/api/fees", { 
            withCredentials: true, 
            headers: { Accept: "application/json" } 
        })
        .then(res => setFees(Array.isArray(res.data.data) ? res.data.data : []))
        .catch(() => setFees([]));

        // Fetch current month expenses
        fetchExpenses(gastoMonth, gastoYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // useEffect hook to fetch the debtors report when filters change (debounced)
    useEffect(() => {
        const delay = setTimeout(() => {
            if (paymentType && reportType === "debtors") {
                fetchReport();
            } else {
                setData([]);
            }
        }, 400); // Debounce to prevent excessive API calls while typing/changing filters
        return () => clearTimeout(delay);
    }, [paymentType, reportType, ingresoYear]); // Dependencies: main report filters

    // useEffect hook to fetch expenses when the expense filter changes (debounced)
    useEffect(() => {
        const delay = setTimeout(() => {
            fetchExpenses(gastoMonth, gastoYear);
        }, 200); // Debounce for expense fetching
        return () => clearTimeout(delay);
    }, [gastoMonth, gastoYear]); // Dependencies: expense month/year filters

    // --- PDF GENERATION ---
    
    // Function to generate the PDF report using jspdf and jspdf-autotable
    const generatePdf = () => {
        try {
            if (data.length === 0) {
                alert("No hay datos para generar el PDF.");
                return;
            }
            
            // Check if jsPDF library is available
            if (typeof JsPDF === "undefined") {
                alert("Error: jsPDF no está disponible.");
                return;
            }
            
            // Initialize jsPDF in landscape (l) mode, points (pt) unit, A4 size
            const doc = new JsPDF("l", "pt", "a4");
            const title = getReportTitle();
            const filterDetails = getFilterDetails();
            let startY = 40;
            const margin = 40;

            // 1. Title and Filter Details setup
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(30, 144, 255); // Dodger Blue
            doc.text(title, doc.internal.pageSize.width / 2, startY, { align: "center" });
            startY += 25;

            // Add filter details below the title
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80, 80, 80);
            filterDetails.forEach(detail => {
                // Add new page if space runs out
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
            // Array to accumulate total payments for each calendar month
            const monthlyCalendarTotals = Array(12).fill(0); 
            
            // Define main table headers
            tableHeaders.push([
                "Dirección/Predio",
                "Tipo de Pago",
                "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
                "Pagado",
                "Deuda",
                "Comentarios"
            ]);

            // Process data for the table body
            const processedData = data.map(row => {
                let rowTotalPaid = 0;
                const feeAmount = Number(row.fee_amount || 0);

                // Calculate monthly calendar totals (total received in that month) and row total paid (total paid for that row's fee)
                for (let m = 1; m <= 12; m++) {
                    // Accumulate monthly calendar totals from the API response field
                    const calendarAmount = Number(row[`total_paid_in_month_${m}`] || 0);
                    monthlyCalendarTotals[m - 1] += calendarAmount;
                    
                    // Calculate rowTotalPaid only if the month is marked as registered
                    if (row[`month_${m}`]) {
                        rowTotalPaid += Number(row[`month_${m}_amount_paid`] ?? feeAmount);
                    }
                }
                
                // Calculate debt and overdue months
                const computedDebt = getRowDebtUpToPrevMonth(row);
                const totalDebtValue = computedDebt;
                const rowMonthsOverdue = getRowMonthsOverdueUpToPrevMonth(row);

                const bodyRow = [
                    row.full_address,
                    row.fee_name || currentPaymentDisplayName,
                ];

                // Map monthly payments to table cells
                for (let m = 1; m <= 12; m++) {
                    const isRegistered = !!row[`month_${m}`]; // Check if it's paid OR condoned
                    const dateStr = row[`month_${m}_date`] ? 
                        new Date(row[`month_${m}_date`]).toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit" }) : "";
                    const amountPaid = Number(row[`month_${m}_amount_paid`] ?? 0);
                    const status = row[`month_${m}_status`]; // Status: 'Pagado' or 'Condonado'

                    if (isRegistered) {
                        const amountDisplay = amountPaid > 0 ? formatCurrency(amountPaid) : '';
                        
                        let visualContent;
                        
                        // Determine if the month was waived (status is Condonado OR amount paid is 0)
                        const isWaived = status === 'Condonado' || amountPaid === 0;

                        if (isWaived) {
                             // 2. Si es condonado (o monto cero), poner "Condonado" en lugar del monto.
                            visualContent = [dateStr, "Condonado"].filter(Boolean).join("\n");
                        } else {
                            // 1. Si está pagado con monto, poner monto
                            visualContent = [dateStr, amountDisplay].filter(Boolean).join("\n");
                        }
                        
                        bodyRow.push(visualContent);
                    } else {
                        // Mark 'X' if overdue up to the previous month, otherwise '-'
                        const lastMonth = getLastMonthToConsider(ingresoYear); 
                        if (m <= lastMonth) bodyRow.push("X");
                        else bodyRow.push("-");
                    }
                }

                // Add trailing columns: Total Paid, Debt, Comments
                bodyRow.push(formatCurrency(rowTotalPaid));

                const debtText = totalDebtValue > 0
                    ? `${formatCurrency(totalDebtValue)} (${rowMonthsOverdue})`
                    : formatCurrency(totalDebtValue);
                bodyRow.push(debtText);

                bodyRow.push(row.comments || '-');

                return bodyRow;
            });
            
            // Calculate final grand totals
            const grandTotalPaidDisplayed = monthlyCalendarTotals.reduce((sum, val) => sum + val, 0);
            const grandTotalDebt = data.reduce((sum, row) => sum + getRowDebtUpToPrevMonth(row), 0);
            const grandTotalMonthsOverdue = data.reduce((sum, row) => sum + getRowMonthsOverdueUpToPrevMonth(row), 0);

            const finalDebtText = grandTotalDebt > 0
                ? `${formatCurrency(grandTotalDebt)} (${grandTotalMonthsOverdue})`
                : formatCurrency(grandTotalDebt);
                
            // Create the final total row for the income/debtors table
            const totalRow = ["TOTAL INGRESOS MENSUAL (ACUMULADO " + ingresoYear + "):", ""];
            
            // Add monthly total values
            monthlyCalendarTotals.forEach(total => totalRow.push(total > 0 ? formatCurrency(total) : "-"));

            // Add grand totals for Paid and Debt
            totalRow.push(formatCurrency(grandTotalPaidDisplayed));
            totalRow.push(finalDebtText);
            totalRow.push("");

            processedData.push(totalRow);
            
            // Column styles for the income/debtors table
            const currentColumnStyles = {
                0: { halign: "left", cellWidth: 150 }, 1: { halign: "left", cellWidth: 70 },
                2: { halign: "center", cellWidth: 32 }, 3: { halign: "center", cellWidth: 32 },
                4: { halign: "center", cellWidth: 32 }, 5: { halign: "center", cellWidth: 32 },
                6: { halign: "center", cellWidth: 32 }, 7: { halign: "center", cellWidth: 32 },
                8: { halign: "center", cellWidth: 32 }, 9: { halign: "center", cellWidth: 32 },
                10: { halign: "center", cellWidth: 32 }, 11: { halign: "center", cellWidth: 32 },
                12: { halign: "center", cellWidth: 32 }, 13: { halign: "center", cellWidth: 32 },
                14: { halign: "right", fontStyle: "bold", cellWidth: 60 },
                15: { halign: "right", fontStyle: "bold", cellWidth: 70 },
                16: { halign: "left", cellWidth: 90 }
            };

            const finalRowIndex = processedData.length - 1;

            // Generate Income/Debtors table with custom styling for totals and overdue marks
            doc.autoTable({
                head: tableHeaders,
                body: processedData,
                startY,
                theme: "grid",
                tableWidth: "auto", // Automatically calculate table width to fit content
                headStyles: {
                    fillColor: [60, 179, 113], // Medium Sea Green
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
                    [finalRowIndex]: { // Style for the grand total row
                        fontStyle: "bold",
                        fillColor: [220, 220, 220],
                        textColor: [0, 0, 0],
                        fontSize: 8,
                    }
                },
                didParseCell: function (data) {
                    const columnCount = tableHeaders[0].length;
                    const monthIndexStart = 2; // Index where month columns start

                    // --- Final Row Styling ---
                    if (data.row.index === finalRowIndex) { 
                        // ... (Existing Final Row Logic) ...
                        if (data.column.index === 0) {
                            data.cell.colSpan = 2; 
                            data.cell.styles.halign = 'left';
                        } else if (data.column.index === 1) {
                            return false;
                        }

                        if (data.column.index >= monthIndexStart && data.column.index < columnCount - 3) {
                            const monthNum = data.column.index - monthIndexStart + 1;
                            if (monthNum === currentMonthNum && ingresoYear === currentYear) {
                                data.cell.styles.fillColor = [255, 255, 153]; 
                                data.cell.styles.textColor = [0, 0, 0];
                            }
                        }

                        if (data.column.index === 15 && grandTotalDebt > 0) {
                            data.cell.styles.fillColor = [220, 53, 69]; 
                            data.cell.styles.textColor = 255;
                        }

                    } else { 
                        // --- Regular Data Row Styling ---
                        // Debt Column Styling
                        const totalDebtRaw = data.row.raw[15] ? String(data.row.raw[15]).split(' ')[0].replace(/\$|,/g, '') : '0';
                        const totalDebtValue = Number(totalDebtRaw) || 0;

                        if (data.column.index === 15 && totalDebtValue > 0) {
                            data.cell.styles.fillColor = [220, 53, 69]; 
                            data.cell.styles.textColor = 255;
                        }

                        // Monthly Columns Styling (Index 2 to 13)
                        if (data.column.index >= 2 && data.column.index <= 13) {
                            const cellText = String(data.cell.text);
                            
                            // Highlight "X" (overdue mark) cells in red
                            if (cellText && cellText[0] === 'X') {
                                data.cell.styles.fillColor = [220, 53, 69]; 
                                data.cell.styles.textColor = 255;
                            } 
                            // Highlight Condonado in blue/info color
                            else if (cellText.includes('Condonado')) {
                                data.cell.styles.fillColor = [100, 149, 237]; // Cornflower Blue
                                data.cell.styles.textColor = 255;
                            }

                            // Adjust font size/alignment for paid cells (multi-line)
                            if (cellText.includes("\n")) {
                                data.cell.styles.fontSize = 6.5;
                                data.cell.styles.halign = "center";
                                data.cell.styles.valign = "middle";
                            }
                        }
                    }
                },
                didDrawPage: function (data) {
                    // Add page numbering
                    doc.setFontSize(10);
                    doc.text(`Página ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.width - margin, doc.internal.pageSize.height - 20, { align: "right" });
                }
            });

            // ... (3. EXPENSE TABLE GENERATION remains unchanged) ...
            let expenseStartY = doc.autoTable.previous.finalY + 15;
            const expensesToDisplay = (currentMonthExpenses.expenses || []);
            
            // 3. EXPENSE (EGRESOS) TABLE GENERATION 
            if (expensesToDisplay.length > 0) {
                // Expense table title
                doc.setFontSize(14);
                doc.setTextColor(220, 53, 69); // Red
                doc.text(`GASTOS / EGRESOS (${currentMonthExpenses.monthName.toUpperCase()} ${currentMonthExpenses.year})`, margin, expenseStartY);
                expenseStartY += 10;

                const expenseTableHeaders = [
                    ["Categoría", "Descripción", "Fecha", "Monto"]
                ];

                // Map expense data to table body rows
                const expenseTableBody = expensesToDisplay.map(exp => [
                    exp.category?.name || 'N/A', 
                    exp.description || '-', 
                    new Date(exp.expense_date).toLocaleDateString("es-MX", { year: "numeric", month: "2-digit", day: "2-digit" }), 
                    formatCurrency(exp.amount)
                ]);
                
                // Add total row for expenses
                expenseTableBody.push([
                    { content: `TOTAL EGRESOS (${currentMonthExpenses.monthName.toUpperCase()} ${currentMonthExpenses.year}):`, colSpan: 3, styles: { fontStyle: 'bold', halign: 'right', fillColor: [220, 220, 220] } },
                    { content: formatCurrency(currentMonthExpenses.total), styles: { fontStyle: 'bold', halign: 'right', fillColor: [220, 220, 220], textColor: [220, 53, 69] } }
                ]);

                // Generate Expenses table
                doc.autoTable({
                    head: expenseTableHeaders,
                    body: expenseTableBody,
                    startY: expenseStartY,
                    theme: "grid",
                    margin: { left: margin, right: margin },
                    headStyles: {
                        fillColor: [220, 53, 69], // Red
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
                        0: { cellWidth: 100 }, 1: { cellWidth: 350 },
                        2: { cellWidth: 60, halign: 'center' }, 3: { cellWidth: 80, halign: 'right' }
                    },
                    didDrawPage: function (data) {
                        // Add page numbering
                        doc.setFontSize(10);
                        doc.text(`Página ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.width - margin, doc.internal.pageSize.height - 20, { align: "right" });
                    }
                });
                expenseStartY = doc.autoTable.previous.finalY + 15;
            } else {
                expenseStartY += 10;
            }

            // 4. BALANCE (SALDO) ROW
            // Calculate the monthly balance
            const monthlyTotalIndex = Number(gastoMonth) - 1;
            const monthlyIncomeForBalance = monthlyCalendarTotals[monthlyTotalIndex] || 0;
            const saldo = monthlyIncomeForBalance - currentMonthExpenses.total;
            
            // Format for display
            const ingresoFormatted = formatCurrency(monthlyIncomeForBalance);
            const egresoFormatted = formatCurrency(currentMonthExpenses.total);
            const saldoFormatted = formatCurrency(saldo);
            const formulaString = `${ingresoFormatted} - ${egresoFormatted} = ${saldoFormatted}`;
            
            // Draw the balance row background and title
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            
            const saldoBgColor = [200, 200, 200];
            doc.setFillColor(saldoBgColor[0], saldoBgColor[1], saldoBgColor[2]);
            // Draw a rectangle for the background of the SALDO row
            doc.rect(margin, expenseStartY, doc.internal.pageSize.width - (2 * margin), 25, 'F');
            
            // Title text (SALDO) in white
            doc.setTextColor(255, 255, 255);
            doc.text(`SALDO (${currentMonthExpenses.monthName.toUpperCase()} ${currentMonthExpenses.year}):`, margin + 10, expenseStartY + 15);
            
            // Formula text: color-coded based on the balance amount (green for positive, red for negative)
            const saldoTextColor = saldo >= 0 ? [255, 255, 255] : [255, 99, 71];
            doc.setTextColor(saldoTextColor[0], saldoTextColor[1], saldoTextColor[2]);
            doc.text(formulaString, doc.internal.pageSize.width - margin - 10, expenseStartY + 15, { align: "right" });

            // Save the PDF file
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
                                resetFilters(); // Reset year and search when payment type changes
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

                {/* Show date filters only when a paymentType is selected */}
                {paymentType && (
                    <div className="border-top pt-3 mt-3">
                        <h5 className="mb-3 text-secondary">Filtros por Fecha</h5>
                        <div className="row g-2 align-items-end">
                            
                            <div className="col-md-3 col-6">
                                <label className="form-label form-label-sm fw-bold text-primary">Año - Ingresos</label>
                                <select
                                    className="form-control"
                                    value={ingresoYear}
                                    // Parse value as integer and default to currentYear if invalid
                                    onChange={(e) => setIngresoYear(parseInt(e.target.value) || currentYear)}
                                >
                                    {/* Generate options for 11 years centered around the current year */}
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
                                    // Parse value as integer and default to currentMonthNum if invalid
                                    onChange={(e) => setGastoMonth(parseInt(e.target.value) || currentMonthNum)}
                                >
                                    {/* Generate month options */}
                                    {monthNames.map((m, idx) => <option key={idx + 1} value={idx + 1}>{m}</option>)}
                                </select>
                            </div>
                            
                            <div className="col-md-3 col-6">
                                <label className="form-label form-label-sm fw-bold text-danger">Año - Gastos</label>
                                <select
                                    className="form-control"
                                    value={gastoYear}
                                    // Parse value as integer and default to currentYear if invalid
                                    onChange={(e) => setGastoYear(parseInt(e.target.value) || currentYear)}
                                >
                                    {/* Generate options for 11 years centered around the current year */}
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

            {/* Display table/results card only when a paymentType is selected */}
            {paymentType && (
                <div className="card shadow">
                    <div className="card-header bg-dark text-white fw-bold text-center">
                        {reportType === "debtors"
                            ? // Report header displaying current filters and date
                            `Resultados del Reporte: ADEUDOS POR PREDIO - ${currentPaymentDisplayName.toUpperCase()} - Año ${ingresoYear} - Al día: ${new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}`
                            : "Seleccione un Tipo de Pago para generar el Reporte."}
                    </div>

                    <div className="card-body p-0">
                        {loading ? (
                            <div className="p-4 text-center text-muted">Cargando datos...</div>
                        ) : data.length === 0 && reportType === "debtors" ? (
                            <div className="p-4 text-center text-muted">No hay datos disponibles para los filtros seleccionados.</div>
                        ) : reportType === "debtors" ? (
                            <>
                                {/* Search Input */}
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

                                                {/* Monthly column headers */}
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map(monthNum => (
                                                    <th key={monthNum} className="text-center" style={{ width: '50px' }}>
                                                        {/* Down arrow indicator for the current month */}
                                                        {(monthNum === currentMonthNum && ingresoYear === currentYear) &&
                                                            <div className="fw-bold text-danger pb-1" style={{ fontSize: '1.1em', lineHeight: '0.8' }}>⬇️</div>
                                                        }
                                                        {monthNames[monthNum - 1].substring(0, 3)}
                                                    </th>
                                                ))}

                                                {/* Trailing column headers */}
                                                <th className="text-end" style={{ minWidth: '70px' }}>Ingreso anual</th>
                                                <th className="text-end" style={{ minWidth: '90px' }}>Deuda</th>
                                                <th className="text-left" style={{ minWidth: '100px' }}>Comentarios</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {(() => {
                                                // Calculate monthly calendar totals for display in the footer
                                                const monthlyCalendarTotals = Array(12).fill(0); 
                                                
                                                // Map and filter data rows
                                                const rows = filteredData.map((row, i) => {
                                                    let rowTotalPaid = 0;
                                                    const feeAmount = Number(row.fee_amount || 0);
                                                    const totalDebtValue = getRowDebtUpToPrevMonth(row);
                                                    const rowMonthsOverdue = getRowMonthsOverdueUpToPrevMonth(row);

                                                    const cells = [
                                                        <td key={`addr-${i}`} className="text-left">{row.full_address}</td>,
                                                        <td key={`type-${i}`} className="text-left">{row.fee_name || currentPaymentDisplayName}</td>,
                                                    ];

                                                    // Generate monthly cells
                                                    for (let m = 1; m <= 12; m++) {
                                                        const isRegistered = !!row[`month_${m}`]; // Check if it's paid OR condoned
                                                        const paymentDateStr = row[`month_${m}_date`];
                                                        const amountPaid = Number(row[`month_${m}_amount_paid`] ?? feeAmount);
                                                        const status = row[`month_${m}_status`]; // Status: 'Pagado' or 'Condonado'

                                                        if (isRegistered) {
                                                            rowTotalPaid += amountPaid; // Accumulate row total paid
                                                        }
                                                        
                                                        // Accumulate monthly total paid (calendar total)
                                                        const calendarAmount = Number(row[`total_paid_in_month_${m}`] || 0);
                                                        monthlyCalendarTotals[m - 1] += calendarAmount; 
                                                        
                                                        if (isRegistered) {
                                                            
                                                            let content;
                                                            let cellClass = 'text-center';
                                                            
                                                            // Determine if the month was waived (status is Condonado OR amount paid is 0)
                                                            const isWaived = status === 'Condonado' || amountPaid === 0;

                                                            if (isWaived) {
                                                                // Condonado: Show date and the word "condonado"
                                                                const dateText = paymentDateStr ? new Date(paymentDateStr).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' }) : '';
                                                                
                                                                // Usar small para el tamaño de la cantidad y texto en minúsculas
                                                                const statusText = <small className="d-block text-white fw-bold" style={{ fontSize: '0.65em' }}>condonado</small>;

                                                                content = (
                                                                    <div style={{ lineHeight: 1 }}>
                                                                        <div className="text-white fw-bold">✓</div>
                                                                        {dateText && <small className="d-block text-white" style={{ fontSize: '0.65em' }}>{dateText}</small>}
                                                                        {statusText}
                                                                    </div>
                                                                );
                                                                // Clase para fondo azul (info)
                                                                cellClass = 'text-center bg-info text-white'; 
                                                                
                                                            } else {
                                                                // Pagado: Show date and amount
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
                                                            // Unpaid cell: '✗' if overdue, '-' if not due yet
                                                            const lastMonth = getLastMonthToConsider(ingresoYear);
                                                            const isTrulyOverdue = m <= lastMonth;

                                                            if (isTrulyOverdue) {
                                                                cells.push(<td key={`m${m}-${i}`} className="text-center bg-danger text-white fw-bold" style={{ width: '50px' }}>✗</td>);
                                                            } else {
                                                                cells.push(<td key={`m${m}-${i}`} className="text-center text-muted" style={{ width: '50px' }}>-</td>);
                                                            }
                                                        }
                                                    }

                                                    // Calculate display styles for Debt column
                                                    const debtBgClass = totalDebtValue > 0 ? "bg-danger text-white" : "text-dark";

                                                    // Total Paid cell
                                                    cells.push(<td key={`totalpaid-${i}`} className="text-end fw-bold text-success" style={{ minWidth: '70px' }}>{formatCurrency(rowTotalPaid)}</td>);

                                                    // Debt cell: display amount and months overdue count
                                                    const debtDisplay = totalDebtValue > 0
                                                        ? `${formatCurrency(totalDebtValue)} (${rowMonthsOverdue})`
                                                        : formatCurrency(totalDebtValue);

                                                    cells.push(<td key={`totaldebt-${i}`} className={`text-end fw-bold ${debtBgClass}`} style={{ minWidth: '90px' }}>{debtDisplay}</td>);

                                                    // Comments cell
                                                    cells.push(<td key={`comments-${i}`} className="text-left text-wrap" style={{ minWidth: '100px' }}>{row.comments || '-'}</td>);

                                                    return <tr key={i}>{cells}</tr>;
                                                });

                                                // Calculate final totals for the footer row
                                                const grandTotalPaidDisplayed = monthlyCalendarTotals.reduce((sum, val) => sum + val, 0);
                                                const totalDebtSum = filteredData.reduce((s, r) => s + getRowDebtUpToPrevMonth(r), 0);
                                                const grandTotalDebtBgClass = totalDebtSum > 0 ? "bg-danger text-white" : "bg-secondary text-white";
                                                const grandTotalMonthsOverdue = filteredData.reduce((sum, row) => sum + getRowMonthsOverdueUpToPrevMonth(row), 0);
                                                
                                                const finalDebtDisplay = totalDebtSum > 0
                                                    ? `${formatCurrency(totalDebtSum)} (${grandTotalMonthsOverdue})`
                                                    : formatCurrency(totalDebtSum);

                                                // Final row for Income/Debtors Totals
                                                const totalRow = (
                                                    <tr key="final-totals" className="fw-bold bg-light">
                                                        <td colSpan={2} className="text-left text-primary">INGRESOS (ACUMULADO {ingresoYear}):</td>
                                                        {/* Monthly totals display */}
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
                                                        {/* Grand Total Paid */}
                                                        <td key="gtpaid" className="text-end text-success" style={{ minWidth: '70px' }}>
                                                            {formatCurrency(grandTotalPaidDisplayed)}
                                                        </td>
                                                        {/* Grand Total Debt */}
                                                        <td key="gtdebt" className={`text-end fw-bold ${grandTotalDebtBgClass}`} style={{ minWidth: '90px' }}>
                                                            {finalDebtDisplay}
                                                        </td>
                                                        <td key="gtcomments" className="text-left text-muted" style={{ minWidth: '100px' }}></td>
                                                    </tr>
                                                );
                                                
                                                // Expense rows preparation (remains unchanged)
                                                const expenseRows = [];
                                                const expensesToDisplay = (currentMonthExpenses.expenses || []);
                                                
                                                const expenseMonthDisplay = currentMonthExpenses.monthName;
                                                const expenseYearDisplay = currentMonthExpenses.year;
                                                
                                                if ((expensesToDisplay.length > 0) || (currentMonthExpenses.total && currentMonthExpenses.total > 0)) {
                                                    // Expense Header Row
                                                    expenseRows.push(
                                                        <tr key="expenses-header" className="fw-bold bg-dark text-white">
                                                            <td colSpan={17} className="text-center">GASTOS ({expenseMonthDisplay.toUpperCase()} {expenseYearDisplay})</td> 
                                                        </tr>
                                                    );

                                                    // Individual Expense Rows (only display amount in the corresponding month column)
                                                    expensesToDisplay.forEach((expense, expIndex) => {
                                                        const colsBeforeMonth = Number(gastoMonth) - 1; 
                                                        const colsAfterMonth = (totalMonthColumns - Number(gastoMonth)) + totalTrailingColumns; 
                                                        
                                                        expenseRows.push(
                                                            <tr key="expense-expIndex" className="text-muted" style={{ fontSize: '0.85em' }}>
                                                                <td colSpan={2} className="text-left">
                                                                    <span className="fw-bold text-danger">➖ {expense.category?.name || expense.category || 'Gasto'}</span>
                                                                    <span className="d-block text-truncate fst-italic" style={{maxWidth: '200px'}}>{expense.description}</span>
                                                                </td>
                                                                {colsBeforeMonth > 0 && <td colSpan={colsBeforeMonth} className="text-center"></td>}
                                                                <td key="exp-amount-month-expIndex" className="text-end fw-bold text-danger bg-light">
                                                                    {formatCurrency(expense.amount)}
                                                                    <small className="d-block text-muted" style={{fontSize: '0.65em'}}>{new Date(expense.expense_date).toLocaleDateString('es-MX', {day: '2-digit', month: '2-digit', year: 'numeric'})}</small>
                                                                </td>
                                                                {colsAfterMonth > 0 && <td colSpan={colsAfterMonth} className="text-center"></td>}
                                                            </tr>
                                                        );
                                                    });
                                                    
                                                    // Expense Total Row
                                                    const totalTextColSpan = 2 + (Number(gastoMonth) - 1); 
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
                                                    // Show 'no expenses' message if filters are active but no data is returned
                                                    const selectedGastoMonthName = monthNames[Number(gastoMonth) - 1];

                                                    expenseRows.push(
                                                        <tr key="no-expenses">
                                                            <td colSpan={fullTableColSpan} className="text-center text-muted fst-italic p-3">
                                                                No hay gastos registrados para {selectedGastoMonthName} de {gastoYear}.
                                                            </td>
                                                        </tr>
                                                    );
                                                }

                                                // SALDO (BALANCE) ROW
                                                const monthlyIncomeForBalance = monthlyCalendarTotals[Number(gastoMonth) - 1] || 0;
                                                const saldo = monthlyIncomeForBalance - currentMonthExpenses.total;

                                                const ingresoFormatted = formatCurrency(monthlyIncomeForBalance);
                                                const egresoFormatted = formatCurrency(currentMonthExpenses.total);
                                                const saldoFormatted = formatCurrency(saldo);
                                                const formulaString = `${ingresoFormatted} - ${egresoFormatted} = ${saldoFormatted}`;
                                                
                                                // Apply custom blue background class for the SALDO row
                                                const saldoBgClass = saldo >= 0 ? 'bg-success' : 'bg-danger'; 

                                                const saldoRow = (
                                                    <tr key="saldo-total" className={`fw-bold ${saldoBgClass} text-white`}>
                                                        <td colSpan={2} className="text-left fw-bold">
                                                            SALDO ({expenseMonthDisplay.toUpperCase()} {expenseYearDisplay}):
                                                        </td>
                                                        <td colSpan={fullTableColSpan - 2} className="text-end pe-4">
                                                            {/* Apply green or red color based on the balance result */}
                                                            <span className='text-white'>{formulaString}</span>
                                                        </td>
                                                    </tr>
                                                );
                                                
                                                // Combine all rows for rendering
                                                return rows.concat(totalRow, expenseRows, saldoRow);
                                            })()}
                                        </tbody>
                                    </table>

                                    {/* No search results message */}
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

            {/* PDF Generation Button */}
            {paymentType && data.length > 0 && reportType === "debtors" && (
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