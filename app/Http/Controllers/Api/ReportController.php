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

        // Rango seleccionado
        $startMonth = (int) $request->get('start_month', 1);
        $startYear = (int) $request->get('start_year', date('Y'));
        $endMonth = (int) $request->get('end_month', date('n'));
        $endYear = (int) $request->get('end_year', date('Y'));

        try {
            $debtors = Resident::select(
                'residents.id',
                'residents.name',
                'residents.last_name',
                'residents.street',
                'residents.street_number'
            )
            ->addSelect(DB::raw("(
                SELECT COUNT(*) 
                FROM resident_payments rp
                JOIN fees f ON f.id = rp.fee_id
                WHERE rp.resident_id = residents.id
                AND ((rp.year > {$startYear}) OR (rp.year = {$startYear} AND rp.month >= {$startMonth}))
                AND ((rp.year < {$endYear}) OR (rp.year = {$endYear} AND rp.month <= {$endMonth}))
                " . ($paymentType ? "AND f.name = '{$paymentType}'" : "") . "
            ) as paid_months"))
            ->addSelect(DB::raw("(
                SELECT f.amount
                FROM fees f
                " . ($paymentType ? "WHERE f.name = '{$paymentType}'" : "LIMIT 1") . "
                LIMIT 1
            ) as fee_amount"))
            ->get()
            ->map(function ($resident) use ($startMonth, $startYear, $endMonth, $endYear, $monthsOverdue, $paymentType) {
                // Calcular meses esperados considerando años y meses
                $expectedMonths = ($endYear - $startYear) * 12 + ($endMonth - $startMonth + 1);
                $owedMonths = $expectedMonths - $resident->paid_months;
                $resident->months_overdue = $owedMonths;
                $resident->total = $owedMonths * $resident->fee_amount;

                // Obtener fecha del último pago
                $resident->last_payment_date = ResidentPayment::where('resident_id', $resident->id)
                    ->when($paymentType, fn($q) => $q->whereHas('fee', fn($q2) => $q2->where('name', $paymentType)))
                    ->orderByDesc('payment_date')
                    ->value('payment_date');

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
     * Payments filtered by resident.
     * Optional: filter by resident_id for autocomplete selection
     */
    public function paymentsByResident(Request $request)
    {
        $residentId = $request->get('resident_id', null);
        $paymentType = $request->get('payment_type', null);
        $startMonth = (int) $request->get('start_month', 1);
        $startYear = (int) $request->get('start_year', date('Y'));
        $endMonth = (int) $request->get('end_month', date('n'));
        $endYear = (int) $request->get('end_year', date('Y'));

        $payments = ResidentPayment::with('resident', 'fee')
            ->when($residentId, fn($q) => $q->where('resident_id', $residentId))
            ->where(function($q) use ($startMonth, $startYear, $endMonth, $endYear) {
                $q->where(function($q2) use ($startMonth, $startYear) {
                    $q2->whereYear('payment_date', '>', $startYear)
                       ->orWhere(function($q3) use ($startMonth, $startYear) {
                           $q3->whereYear('payment_date', $startYear)
                              ->whereMonth('payment_date', '>=', $startMonth);
                       });
                })
                ->where(function($q2) use ($endMonth, $endYear) {
                    $q2->whereYear('payment_date', '<', $endYear)
                       ->orWhere(function($q3) use ($endMonth, $endYear) {
                           $q3->whereYear('payment_date', $endYear)
                              ->whereMonth('payment_date', '<=', $endMonth);
                       });
                });
            });

        if ($paymentType) {
            $payments->whereHas('fee', fn($q) => $q->where('name', $paymentType));
        }

        $payments = $payments->orderBy('payment_date')->get()
            ->map(fn($p) => [
                'name' => $p->resident->name,
                'last_name' => $p->resident->last_name,
                'street' => $p->resident->street,
                'street_number' => $p->resident->street_number,
                'fee_name' => $p->fee->name ?? '',
                'amount' => $p->amount,
                'payment_date' => $p->payment_date, // <-- agregado
            ]);

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
}
