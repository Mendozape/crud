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
     */
  public function debtors(Request $request)
{
    $monthsOverdue = (int) $request->get('months', 1);
    $paymentType = $request->get('payment_type', null);
    $endMonth = (int) $request->get('end_month', date('n'));
    $endYear = (int) $request->get('end_year', date('Y'));
    $startMonth = 1; 
    $startYear = $endYear;

    $queryDebug = "
        SELECT COUNT(*) 
        FROM resident_payments rp
        JOIN fees f ON f.id = rp.fee_id
        WHERE rp.resident_id = :resident_id
        AND ((rp.year > {$startYear}) OR (rp.year = {$startYear} AND rp.month >= {$startMonth}))
        AND ((rp.year < {$endYear}) OR (rp.year = {$endYear} AND rp.month <= {$endMonth}))
        " . ($paymentType ? "AND f.name = '{$paymentType}'" : "");

    Log::info("Debtors subquery", ['query' => $queryDebug]);

    try {
        $debtors = Resident::select(
                'residents.id',
                'residents.name',
                'residents.last_name',
                'residents.street',
                'residents.street_number' // CORREGIDO: antes era 'number'
            )
            ->addSelect(DB::raw("
                (
                    SELECT COUNT(*) 
                    FROM resident_payments rp
                    JOIN fees f ON f.id = rp.fee_id
                    WHERE rp.resident_id = residents.id
                    AND ((rp.year > {$startYear}) OR (rp.year = {$startYear} AND rp.month >= {$startMonth}))
                    AND ((rp.year < {$endYear}) OR (rp.year = {$endYear} AND rp.month <= {$endMonth}))
                    " . ($paymentType ? "AND f.name = '{$paymentType}'" : "") . "
                ) as paid_months
            "))
            ->addSelect(DB::raw("
                (
                    SELECT f.amount
                    FROM fees f
                    " . ($paymentType ? "WHERE f.name = '{$paymentType}'" : "LIMIT 1") . "
                    LIMIT 1
                ) as fee_amount
            "))
            ->get()
            ->map(function ($resident) use ($startMonth, $endMonth, $monthsOverdue) {
                $expectedMonths = $endMonth - $startMonth + 1;
                $owedMonths = $expectedMonths - $resident->paid_months;
                $resident->months_overdue = $owedMonths;
                $resident->total = $owedMonths * $resident->fee_amount;
                return $resident;
            })
            ->filter(fn($r) => $r->months_overdue >= $monthsOverdue)
            ->values();

        return response()->json([
            'success' => true,
            'data' => $debtors
        ]);

    } catch (\Exception $e) {
        Log::error("Error fetching debtors: " . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => $e->getMessage()
        ], 500);
    }
}



    /**
     * Payments filtered by date range and optional fee type.
     */
    public function paymentsByDate(Request $request)
    {
        $start = $request->get('start_date') ?: now()->startOfMonth()->toDateString();
        $end = $request->get('end_date') ?: now()->toDateString();
        $paymentType = $request->get('payment_type', null);

        Log::info("Fetching paymentsByDate", [
            'start' => $start,
            'end' => $end,
            'paymentType' => $paymentType
        ]);

        $query = ResidentPayment::with(['resident', 'fee'])
            ->whereBetween('payment_date', [$start, $end]);

        if ($paymentType) {
            $query->whereHas('fee', fn($q) => $q->where('name', $paymentType));
        }

        $payments = $query->orderBy('payment_date', 'desc')->get();

        Log::info("Payments fetched", ['count' => $payments->count()]);

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    /**
     * Monthly income report, optionally filtered by fee type.
     */
    public function incomeByMonth(Request $request)
    {
        $year = $request->get('year', date('Y'));
        $paymentType = $request->get('payment_type', null);

        $query = ResidentPayment::select(
            DB::raw('MONTH(payment_date) as month'),
            DB::raw('SUM(amount) as total')
        )
            ->whereYear('payment_date', $year);

        if ($paymentType) {
            $query->whereHas('fee', fn($q) => $q->where('name', $paymentType));
        }

        $income = $query->groupBy(DB::raw('MONTH(payment_date)'))
            ->orderBy('month')
            ->get()
            ->map(fn($i) => [
                'month' => date('F', mktime(0, 0, 0, $i->month, 1)),
                'total' => $i->total
            ]);

        return response()->json([
            'success' => true,
            'year' => $year,
            'data' => $income
        ]);
    }
}
