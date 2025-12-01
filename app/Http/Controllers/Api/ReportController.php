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
    /**
     * Income Report (Debtors / Adeudos)
     * Filters by year and calculates totals by calendar payment month (payment_date).
     * @param Request $request Contains payment_type and year.
     * @return \Illuminate\Http\JsonResponse
     */
    public function debtors(Request $request)
    {
        $paymentType = $request->get('payment_type', null);
        $year = (int) $request->get('year', date('Y')); // Report Year (ingresoYear from front)

        try {
            // Get relevant fees
            $fees = [];
            if ($paymentType === 'Todos') {
                $fees = \App\Models\Fee::all();
            } elseif ($paymentType) {
                $fee = \App\Models\Fee::where('name', $paymentType)->first();
                if ($fee) {
                    $fees = [$fee];
                }
            }

            // Get all addresses
            $addresses = Address::select('id', 'street', 'street_number', 'type', 'comments')->get();

            $allRows = collect();

            foreach ($fees as $fee) {
                $feeAmount = $fee->amount ?? 0;
                $feeName   = $fee->name ?? '';

                $rows = $addresses->map(function ($address) use ($year, $feeName, $feeAmount) {

                    $fullAddress = "{$address->street} #{$address->street_number} ({$address->type})";

                    // 1. QUERY for FEE STATUS (month_1, month_2, etc.) - Filtered by FEE MONTH YEAR
                    // This query determines which month squares are checked/paid.
                    $monthlyStatusQuery = AddressPayment::where('address_id', $address->id)
                        ->where('status', 'Pagado')
                        ->where('year', $year); // Fee year

                    if ($feeName) {
                         $monthlyStatusQuery->whereHas('fee', fn($q) => $q->where('name', $feeName));
                    }
                    $monthlyStatusPayments = $monthlyStatusQuery->get();

                    // 2. QUERY for CALENDAR MONTH SUM (Total Row) - Filtered by PAYMENT DATE YEAR
                    // This query determines the total income RECEIVED per calendar month (for the total row).
                    $calendarPaymentsQuery = AddressPayment::where('address_id', $address->id)
                        ->where('status', 'Pagado')
                        ->whereYear('payment_date', $year); // Payment Year

                    if ($feeName) {
                        $calendarPaymentsQuery->whereHas('fee', fn($q) => $q->where('name', $feeName));
                    }
                    $calendarPayments = $calendarPaymentsQuery->get();


                    // --- Data extraction for columns ---
                    $paidMonthsArray = $monthlyStatusPayments->pluck('month')->toArray();
                    $paymentDates = [];
                    $paidAmounts  = [];

                    foreach ($monthlyStatusPayments as $payment) {
                        $paymentDates[$payment->month] = $payment->payment_date;
                        $paidAmounts[$payment->month]  = $payment->amount_paid ?? 0;
                    }

                    // --- FIX: Calculate total income per calendar month based on payment date (payment_date) ---
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


                    // Debt Calculation (based on FEE MONTH status)
                    $paidMonths = count($paidMonthsArray);
                    $expectedMonths = 12;
                    $months_overdue = max(0, $expectedMonths - $paidMonths);
                    $total = $months_overdue * $feeAmount;

                    // Build monthly dataset
                    $monthData = [];

                    for ($m = 1; $m <= 12; $m++) {
                        $isPaid = in_array($m, $paidMonthsArray);

                        $monthData["month_{$m}"] = $isPaid;
                        $monthData["month_{$m}_date"] = $isPaid ? ($paymentDates[$m] ?? null) : null;
                        $monthData["month_{$m}_amount_paid"] = $isPaid ? ($paidAmounts[$m] ?? 0) : null;
                        
                        // Add the calendar month payment field (for the front-end Total Row)
                        $monthData["total_paid_in_month_{$m}"] = $incomeByCalendarMonth[$m]; 
                    }

                    return array_merge([
                        'name' => $fullAddress,
                        'full_address' => $fullAddress,
                        'paid_months' => $paidMonths,
                        'fee_amount' => $feeAmount,
                        'fee_name' => $feeName,
                        'months_overdue' => $months_overdue,
                        'total' => $total,
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
        // Get year and month from the request, using current date as fallback.
        $year = (int) $request->get('year', now()->year);
        $month = (int) $request->get('month', now()->month);

        if ($month < 1 || $month > 12) {
            $month = now()->month;
        }

        $expenses = Expense::with('category')
            ->whereYear('expense_date', $year)
            ->whereMonth('expense_date', $month)
            ->get();

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