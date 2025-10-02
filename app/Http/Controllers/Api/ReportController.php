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

    $startMonth = (int) $request->get('start_month', 1);
    $startYear = (int) $request->get('start_year', date('Y'));
    $endMonth = (int) $request->get('end_month', date('n'));
    $endYear = (int) $request->get('end_year', date('Y'));

    try {
        // Traer residentes
        $residents = Resident::select('id', 'name', 'last_name', 'street', 'street_number')
            ->get();

        $rows = $residents->map(function ($resident) use ($startMonth, $startYear, $endMonth, $endYear, $monthsOverdue, $paymentType) {

            // Contar pagos en el rango
            $paymentsQuery = ResidentPayment::where('resident_id', $resident->id)
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

            if ($paymentType) {
                $paymentsQuery->whereHas('fee', fn($q) => $q->where('name', $paymentType));
            }

            $paidMonths = $paymentsQuery->count();
            $feeAmount = $paymentsQuery->first()?->fee->amount ?? 0;
            $expectedMonths = ($endYear - $startYear) * 12 + ($endMonth - $startMonth + 1);
            $months_overdue = max(0, $expectedMonths - $paidMonths);
            $total = $months_overdue * $feeAmount;

            $lastPayment = $paymentsQuery->orderByDesc('payment_date')->value('payment_date');

            return [
                'name' => $resident->name,
                'last_name' => $resident->last_name,
                'street' => $resident->street,
                'street_number' => $resident->street_number,
                'paid_months' => $paidMonths,
                'fee_amount' => $feeAmount,
                'months_overdue' => $months_overdue,
                'last_payment_date' => $lastPayment ? \Carbon\Carbon::parse($lastPayment)->toDateString() : null,
                'total' => $total,
            ];
        })
        ->filter(fn($r) => $r['months_overdue'] >= $monthsOverdue)
        ->values();

        // Total general
        $grandTotal = $rows->sum('total');

        $rows->push([
            'name' => 'Total',
            'last_name' => '',
            'street' => '',
            'street_number' => '',
            'paid_months' => '',
            'fee_amount' => '',
            'months_overdue' => '',
            'last_payment_date' => '',
            'total' => $grandTotal,
        ]);

        return response()->json([
            'success' => true,
            'data' => $rows
        ]);
    } catch (\Exception $e) {
        \Log::error("Error fetching debtors: ".$e->getMessage());
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

        $query = ResidentPayment::select(
            'month',
            DB::raw('SUM(amount) as total'),
            'fee_id'
        )
            ->with('fee') // Para tener relación con el fee
            ->where('year', $year);

        if ($month) {
            $query->where('month', $month);
        }

        if ($paymentType) {
            $query->whereHas('fee', fn($q) => $q->where('name', $paymentType));
        }

        $income = $query->groupBy('month', 'fee_id')
            ->orderBy('month')
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
