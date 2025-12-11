<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Models\AddressPayment;
use App\Models\Expense;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:reports', ['only' => ['debtors', 'expenses']]);
    }
    
    /**
     * Income Report (Debtors / Adeudos)
     * Filters by year and calculates totals by calendar payment month (payment_date).
     *
     * @param Request $request Contains payment_type and year.
     * @return \Illuminate\Http\JsonResponse
     */
    public function debtors(Request $request)
    {
        $paymentType = $request->get('payment_type', null);
        $year = (int) $request->get('year', date('Y')); // Report Year (ingresoYear from front)

        try {
            // ENGLISH CODE COMMENTS
            // Get relevant fees based on filter selection ('Todos' or specific fee name)
            $fees = [];
            if ($paymentType === 'Todos') {
                $fees = \App\Models\Fee::all();
            } elseif ($paymentType) {
                $fee = \App\Models\Fee::where('name', $paymentType)->first();
                if ($fee) {
                    $fees = [$fee];
                }
            }

            // Get all address records for mapping. 
            // ⭐ ADJUSTMENT: Select 'months_overdue' from the addresses table.
            $addresses = Address::select('id', 'street_id', 'street_number', 'type', 'comments', 'months_overdue')
                ->with('street') // Load the related Street model
                ->get();

            $allRows = collect();

            // Iterate over each fee (or just the selected one) to generate report rows
            foreach ($fees as $fee) {
                $feeAmount = $fee->amount ?? 0;
                $feeName   = $fee->name ?? '';

                $rows = $addresses->map(function ($address) use ($year, $feeName, $feeAmount) {

                    // FIX: Access street name via the relationship: $address->street->name
                    $streetName = $address->street->name ?? 'CALLE NO ASIGNADA'; 
                    $fullAddress = "{$streetName} #{$address->street_number} ({$address->type})";

                    // 1. QUERY for FEE STATUS (month_1, month_2, etc.) - Filtered by FEE MONTH YEAR
                    // This query determines which month squares are checked/paid (and therefore not debt).
                    $monthlyStatusQuery = AddressPayment::where('address_id', $address->id)
                        // Must include 'Pagado' and 'Condonado' to mark the month as covered.
                        ->whereIn('status', ['Pagado', 'Condonado']) 
                        ->where('year', $year); // Fee year

                    if ($feeName) {
                        $monthlyStatusQuery->whereHas('fee', fn($q) => $q->where('name', $feeName));
                    }
                    // Select all relevant fields, including status, date, and amount paid.
                    $monthlyStatusPayments = $monthlyStatusQuery->get();

                    // 2. QUERY for CALENDAR MONTH SUM (Total Row) - Filtered by PAYMENT DATE YEAR
                    // This query determines the actual income RECEIVED per calendar month (for the total row calculation).
                    $calendarPaymentsQuery = AddressPayment::where('address_id', $address->id)
                        // Must include 'Pagado' and 'Condonado' for complete balance tracking.
                        ->whereIn('status', ['Pagado', 'Condonado']) 
                        ->whereYear('payment_date', $year); // Payment Year

                    if ($feeName) {
                        $calendarPaymentsQuery->whereHas('fee', fn($q) => $q->where('name', $feeName));
                    }
                    $calendarPayments = $calendarPaymentsQuery->get();


                    // --- Data extraction for columns ---
                    // Array of month numbers that are registered (used to build the row structure)
                    $paidMonthsArray = $monthlyStatusPayments->pluck('month')->toArray();
                    $paymentDates = [];
                    $paidAmounts  = [];
                    // Store the status ('Pagado'/'Condonado') for each registered month.
                    $monthStatuses = []; 

                    foreach ($monthlyStatusPayments as $payment) {
                        $paymentDates[$payment->month] = $payment->payment_date;
                        $paidAmounts[$payment->month]  = $payment->amount_paid ?? 0;
                        // Store the actual status for display in the frontend.
                        $monthStatuses[$payment->month] = $payment->status; 
                    }

                    // 3. FIX: Calculate total income per calendar month based on payment date (payment_date)
                    $incomeByCalendarMonth = [];
                    for ($m = 1; $m <= 12; $m++) {
                        $incomeByCalendarMonth[$m] = 0; // Initialize array with keys 1-12
                    }

                    foreach ($calendarPayments as $payment) {
                        // Extract month number from the actual payment_date
                        $paymentMonth = Carbon::parse($payment->payment_date)->month;
                        // Accumulate amount in the calendar month of payment
                        $incomeByCalendarMonth[$paymentMonth] += $payment->amount_paid ?? 0;
                    }
                    // --- END FIX LOGIC ---


                    // 4. Data preparation for the monthly columns
                    $registeredMonthsCount = count($paidMonthsArray);

                    $monthData = [];

                    for ($m = 1; $m <= 12; $m++) {
                        $isRegistered = in_array($m, $paidMonthsArray);

                        $monthData["month_{$m}"] = $isRegistered;
                        $monthData["month_{$m}_date"] = $isRegistered ? ($paymentDates[$m] ?? null) : null;
                        $monthData["month_{$m}_amount_paid"] = $isRegistered ? ($paidAmounts[$m] ?? 0) : null;
                        
                        // Pass the exact status ('Pagado' or 'Condonado') to the frontend for display
                        $monthData["month_{$m}_status"] = $isRegistered ? ($monthStatuses[$m] ?? 'Pagado') : null; 
                        
                        // Add the calendar month payment field (for the front-end Total Row)
                        $monthData["total_paid_in_month_{$m}"] = $incomeByCalendarMonth[$m]; 
                    }

                    return array_merge([
                        'name' => $fullAddress,
                        'full_address' => $fullAddress,
                        'paid_months' => $registeredMonthsCount,
                        'fee_amount' => $feeAmount,
                        'fee_name' => $feeName,
                        // ⭐ FIX: Use the actual value from the address model
                        'months_overdue' => $address->months_overdue ?? 0, 
                        'total' => 0,          // Calculated in frontend for temporal accuracy
                        'comments' => $address->comments ?? '',
                    ], $monthData);
                });

                $allRows = $allRows->merge($rows);
            }

            // Sort results
            $allRows = $allRows->values()
                ->sortBy('fee_name')
                ->sortBy('name')
                ->values();

            $grandTotal = $allRows->sum('total');

            return response()->json([
                'success' => true,
                'data' => $allRows,
                'total' => $grandTotal
            ]);
        } catch (\Exception $e) {
            \Log::error('Debtors Report Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Internal server error while generating debtors report.'
            ], 500);
        }
    }
    
    /**
     * Expense Report (Egresos)
     * Filters by requested month and year.
     * @param Request $request Contains month and year.
     * @return \Illuminate\Http\JsonResponse
     */
    public function expenses(Request $request)
    {
        // ENGLISH CODE COMMENTS
        // Get year and month from the request, using current date as fallback.
        $year = (int) $request->get('year', now()->year);
        $month = (int) $request->get('month', now()->month);

        if ($month < 1 || $month > 12) {
            $month = now()->month;
        }

        // Fetch expenses for the given month and year
        $expenses = Expense::with('category')
            ->whereYear('expense_date', $year)
            ->whereMonth('expense_date', $month)
            ->get();

        // Create a Carbon instance to get the month name in Spanish
        $dateForName = Carbon::createFromDate($year, $month, 1)->locale('es');

        return response()->json([
            'month' => $month,
            'year' => $year,
            'month_name' => $dateForName->monthName,
            'expenses' => $expenses,
            'total' => $expenses->sum('amount'),
        ]);
    }
}