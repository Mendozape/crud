<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use App\Models\ResidentPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    /**
     * Residents with more than X months overdue.
     * Source of amount: Fee model (Current Fee amount).
     */
    public function debtors(Request $request)
    {
        $monthsOverdue = (int) $request->get('months', 1);
        $paymentType = $request->get('payment_type', null);

        $startMonth = (int) $request->get('start_month', 1);
        $startYear = (int) $request->get('start_year', date('Y'));
        $endMonth = (int) $request->get('end_month', date('n'));
        $endYear = (int) $request->get('end_year', date('Y'));

        try {
            // Get all fees if "Todos" is selected
            $fees = [];
            if ($paymentType === 'Todos') {
                // Ensure we get only active fees for current debtors report
                $fees = \App\Models\Fee::all(); 
            } else if ($paymentType) {
                $fee = \App\Models\Fee::where('name', $paymentType)->first();
                if ($fee) {
                    $fees = [$fee];
                }
            }

            $residents = Resident::select('id', 'name', 'last_name')
                ->get();

            $allRows = collect();

            foreach ($fees as $fee) {
                // Get current fee amount and name from the Fee object
                $feeAmount = $fee->amount ?? 0;
                $feeName = $fee->name ?? '';

                $rows = $residents->map(function ($resident) use ($startMonth, $startYear, $endMonth, $endYear, $monthsOverdue, $feeName, $feeAmount) {

                    $paymentsQuery = ResidentPayment::where('resident_id', $resident->id)
                        // CRUCIAL FILTER: Only count Paid payments to calculate valid debt
                        ->where('status', 'Pagado') 
                        ->where(function ($q) use ($startMonth, $startYear, $endMonth, $endYear) {
                            $q->where(function ($q2) use ($startMonth, $startYear) {
                                $q2->whereYear('payment_date', '>', $startYear)
                                    ->orWhere(function ($q3) use ($startMonth, $startYear) {
                                        $q3->whereYear('payment_date', $startYear)
                                            ->whereMonth('payment_date', '>=', $startMonth);
                                    });
                            })->where(function ($q2) use ($endMonth, $endYear) {
                                $q2->whereYear('payment_date', '<', $endYear)
                                    ->orWhere(function ($q3) use ($endMonth, $endYear) {
                                        $q3->whereYear('payment_date', $endYear)
                                            ->whereMonth('payment_date', '<=', $endMonth);
                                    });
                            });
                        });

                    if ($feeName) {
                        $paymentsQuery->whereHas('fee', fn($q) => $q->where('name', $feeName));
                    }

                    $paidMonths = $paymentsQuery->count();
                    $expectedMonths = ($endYear - $startYear) * 12 + ($endMonth - $startMonth );
                    $months_overdue = max(0, $expectedMonths - $paidMonths);
                    $total = $months_overdue * $feeAmount; // Calculation uses Fee amount

                    $lastPayment = $paymentsQuery->orderByDesc('payment_date')->value('payment_date');

                    return [
                        'name' => $resident->name,
                        'last_name' => $resident->last_name,
                        'paid_months' => $paidMonths,
                        'fee_amount' => $feeAmount, 
                        'fee_name' => $feeName,
                        'months_overdue' => $months_overdue,
                        'last_payment_date' => $lastPayment ? \Carbon\Carbon::parse($lastPayment)->toDateString() : null,
                        'total' => $total,
                    ];
                })
                ->filter(fn($r) => $r['months_overdue'] >= $monthsOverdue);

                $allRows = $allRows->merge($rows);
            }

            $allRows = $allRows->values()
            ->sortBy('fee_name')    // 3. Tertiary sort (Payment Type)
            ->sortBy('name')        // 2. Secondary sort (Name)
            ->sortBy('last_name')   // 1. Primary sort (Last Name)
            ->values();
            
            $grandTotal = $allRows->sum('total');

            $allRows->push([
                'name' => 'Total',
                'last_name' => '',
                'street' => '',
                'street_number' => '',
                'paid_months' => '',
                'fee_amount' => '',
                'fee_name' => '',
                'months_overdue' => '',
                'last_payment_date' => '',
                'total' => $grandTotal,
            ]);

            return response()->json([
                'success' => true,
                'data' => $allRows
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // --- SEPARATOR ---

    /**
     * Payments filtered by resident.
     * Source of amount/description: Fee model (Current Fee amount/description).
     */
    public function paymentsByResident(Request $request)
    {
        $residentId = $request->get('resident_id', null);
        $paymentType = $request->get('payment_type', null);
        $startMonth = (int) $request->get('start_month', 1);
        $startYear = (int) $request->get('start_year', date('Y'));
        $endMonth = (int) $request->get('end_month', date('n'));
        $endYear = (int) $request->get('end_year', date('Y'));

        // Select all columns from resident_payments and eager load Fee relationship
        $payments = ResidentPayment::select('*') 
            ->with('resident', 'fee') // Load Fee relationship
            ->when($residentId, fn($q) => $q->where('resident_id', $residentId))
            
            // CRUCIAL FILTER: Only include valid, paid payments in the report
            ->where('status', 'Pagado') 
            
            ->where(function ($q) use ($startMonth, $startYear, $endMonth, $endYear) {
                $q->where(function ($q2) use ($startMonth, $startYear) {
                    $q2->whereYear('payment_date', '>', $startYear)
                        ->orWhere(function ($q3) use ($startMonth, $startYear) {
                            $q3->whereYear('payment_date', $startYear)
                                ->whereMonth('payment_date', '>=', $startMonth);
                        });
                })
                    ->where(function ($q2) use ($endMonth, $endYear) {
                        $q2->whereYear('payment_date', '<', $endYear)
                            ->orWhere(function ($q3) use ($endMonth, $endYear) {
                                $q3->whereYear('payment_date', $endYear)
                                    ->whereMonth('payment_date', '<=', $endMonth);
                            });
                    });
            });

        // Only filter by payment type if not "Todos"
        if ($paymentType && $paymentType !== 'Todos') {
            $payments->whereHas('fee', fn($q) => $q->where('name', $paymentType));
        }

        $payments = $payments->orderBy('payment_date')->get()
            ->map(fn($p) => [
                'name' => $p->resident->name,
                'last_name' => $p->resident->last_name,
                'street' => $p->resident->street,
                'street_number' => $p->resident->street_number,
                
                // SOURCE FIX: Get amount and description from the Fee relationship
                'fee_name' => $p->fee->name ?? '',
                'fee_amount' => $p->fee->amount ?? 0,
                'fee_description' => $p->fee->description ?? '', // Include description from Fee
                
                // 'amount' key is used for the display value in the frontend
                'amount' => $p->fee->amount ?? 0, 
                
                'concept' => $p->concept ?? '',
                'payment_date' => $p->payment_date,
                'month' => $p->month, 
                'year' => $p->year,  
            ]);

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    // --- SEPARATOR ---

    /**
     * Search residents by name or last name for autocomplete
     */
    public function searchResidents(Request $request)
    {
        $search = $request->get('search', '');

        if (!$search) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $residents = Resident::where('name', 'like', "%{$search}%")
            ->orWhere('last_name', 'like', "%{$search}%")
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $residents
        ]);
    }

    // --- SEPARATOR ---

    public function paymentYears()
    {
        $years = ResidentPayment::whereNotNull('payment_date')
            ->select(DB::raw('YEAR(payment_date) as year'))
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year');

        return response()->json([
            'success' => true,
            'data' => $years
        ]);
    }

    // --- SEPARATOR ---

    /**
     * Calculates total valid income grouped by month.
     * CRITICAL FIX: Joins 'fees' table to sum the current fee amount.
     */
    public function incomeByMonth(Request $request)
    {
        $year = $request->get('year');
        $month = $request->get('month', null);
        $paymentType = $request->get('payment_type', null);

        if (!$year) {
            return response()->json([
                'success' => false,
                'message' => 'Year is required'
            ], 400);
        }

        $query = ResidentPayment::query()
            // 1. Explicitly Join ResidentPayment with Fees
            ->join('fees', 'resident_payments.fee_id', '=', 'fees.id')
            
            // 2. Select grouping fields and sum the fee amount
            ->select(
                'resident_payments.month',
                DB::raw('SUM(fees.amount) as total'), // CRUCIAL FIX: Sum the amount from the FEES table
                'resident_payments.fee_id'
            )
            ->with('fee') // Eager load the fee relationship
            
            ->where('resident_payments.year', $year)
            // CRUCIAL FILTER: Only calculate income from Paid payments
            ->where('resident_payments.status', 'Pagado'); 

        if ($month) {
            $query->where('resident_payments.month', $month);
        }

        // Only filter by payment type if not "Todos"
        if ($paymentType && $paymentType !== 'Todos') {
            // Apply filter on the fee relationship
            $query->whereHas('fee', fn($q) => $q->where('name', $paymentType));
        }

        $income = $query->groupBy('resident_payments.month', 'resident_payments.fee_id')
            ->orderBy('resident_payments.month')
            ->get()
            ->map(fn($i) => [
                'month' => date('F', mktime(0, 0, 0, $i->month, 1)),
                'total' => $i->total,
                'payment_type' => $i->fee->name ?? ''
            ]);

        return response()->json([
            'success' => true,
            'year' => $year,
            'data' => $income
        ]);
    }
}