<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address; // Primary Model
use App\Models\AddressPayment; // Transaction Model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    /**
     * Debts per Property (Adeudos por Predio).
     */
    public function debtors(Request $request)
{
    $paymentType = $request->get('payment_type', null);
    $year = (int) $request->get('year', date('Y'));

    try {
        // Get relevant fees
        $fees = [];
        if ($paymentType === 'Todos') {
            $fees = \App\Models\Fee::all();
        } else if ($paymentType) {
            $fee = \App\Models\Fee::where('name', $paymentType)->first();
            if ($fee) {
                $fees = [$fee];
            }
        }

        // Fetch all addresses
        $addresses = Address::select('id', 'street', 'street_number', 'type')->get();

        $allRows = collect();

        foreach ($fees as $fee) {
            $feeAmount = $fee->amount ?? 0;
            $feeName = $fee->name ?? '';

            $rows = $addresses->map(function ($address) use ($year, $feeName, $feeAmount) {

                // Address string is the main identifier
                $fullAddress = "{$address->street} #{$address->street_number} ({$address->type})";

                // Get all paid months for this address, fee, and year
                $paymentsQuery = AddressPayment::where('address_id', $address->id)
                    ->where('status', 'Pagado')
                    ->where('year', $year);

                if ($feeName) {
                    $paymentsQuery->whereHas('fee', fn($q) => $q->where('name', $feeName));
                }

                $paidPayments = $paymentsQuery->get();

                // Create array of paid months (1-12) with payment dates
                $paidMonthsArray = $paidPayments->pluck('month')->toArray();
                $paymentDates = [];
                foreach ($paidPayments as $payment) {
                    $paymentDates[$payment->month] = $payment->payment_date;
                }

                // Calculate total paid months
                $paidMonths = count($paidMonthsArray);

                // Expected months is 12 (full year)
                $expectedMonths = 12;

                $months_overdue = max(0, $expectedMonths - $paidMonths);
                $total = $months_overdue * $feeAmount;

                // Create payment status for each month (1=Enero, 2=Febrero, etc.)
                $monthlyStatus = [];
                $monthlyDates = [];
                for ($m = 1; $m <= 12; $m++) {
                    $isPaid = in_array($m, $paidMonthsArray);
                    $monthlyStatus["month_$m"] = $isPaid;
                    $monthlyDates["month_{$m}_date"] = $isPaid ? $paymentDates[$m] : null;
                }

                return array_merge([
                    'name' => $fullAddress,
                    'full_address' => $fullAddress,
                    'paid_months' => $paidMonths,
                    'fee_amount' => $feeAmount,
                    'fee_name' => $feeName,
                    'months_overdue' => $months_overdue,
                    'total' => $total,
                ], $monthlyStatus, $monthlyDates);
            }); // Show ALL addresses (removed filter)

            $allRows = $allRows->merge($rows);
        }

        $allRows = $allRows->values()
            ->sortBy('fee_name')
            ->sortBy('name')
            ->values();

        $grandTotal = $allRows->sum('total');

        return response()->json(['success' => true, 'data' => $allRows, 'total' => $grandTotal]);
    } catch (\Exception $e) {
        \Log::error('Debtors Report Error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Internal server error while generating debtors report.'
        ], 500);
    }
}

    // --- SEPARATOR ---

    /**
     * Payments filtered by address (formerly paymentsByResident).
     */
    public function paymentsByAddressId(Request $request) // CRITICAL: Renamed method
    {
        $addressId = $request->get('address_id', null);
        $paymentType = $request->get('payment_type', null);
        $startMonth = (int) $request->get('start_month', 1);
        $startYear = (int) $request->get('start_year', date('Y'));
        $endMonth = (int) $request->get('end_month', date('n'));
        $endYear = (int) $request->get('end_year', date('Y'));

        $payments = AddressPayment::select('*')
            ->with(['address', 'fee' => fn($q) => $q->withTrashed()])
            ->when($addressId, fn($q) => $q->where('address_id', $addressId))
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

        if ($paymentType && $paymentType !== 'Todos') {
            $payments->whereHas('fee', fn($q) => $q->where('name', $paymentType));
        }

        $payments = $payments->orderBy('payment_date')->get()
            ->map(fn($p) => [
                'address_id' => $p->address_id,
                'fee_name' => $p->fee->name ?? '',
                'fee_amount' => $p->fee->amount ?? 0,
                'amount' => $p->fee->amount ?? 0,
                'payment_date' => $p->payment_date,
                'month' => $p->month,
                'year' => $p->year,
            ]);

        return response()->json(['success' => true, 'data' => $payments]);
    }

    // --- SEPARATOR ---

    /**
     * Search addresses by street/number for autocomplete (formerly searchResidents).
     */
    public function searchAddresses(Request $request) // CRITICAL: Renamed method
    {
        $search = $request->get('search', '');

        if (!$search) {
            return response()->json(['success' => true, 'data' => []]);
        }

        // Fetch addresses matching street, number, or associated resident's name/last name (for user context)
        $addresses = Address::select('id', 'street', 'street_number', 'type')
            ->where('street', 'like', "%{$search}%")
            ->orWhere('street_number', 'like', "%{$search}%")
            // Temporarily keep resident search criteria for user identification/context
            ->orWhereHas('currentResident', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            })
            ->with('currentResident:id,name,last_name')
            ->limit(10)
            ->get();

        // Map the result to return the Address ID and address details
        $results = $addresses->map(function ($a) {
            $residentName = $a->currentResident->name ?? '';
            $residentLastName = $a->currentResident->last_name ?? '';
            $fullAddress = "{$a->street} #{$a->street_number} ({$a->type})";

            return [
                // CRITICAL: Return the ADDRESS ID as the main ID for filtering payments
                'id' => $a->id, // THIS IS THE ADDRESS ID (for selectedResident.id)
                // Display info for the user to select the correct address
                'name' => $residentName, // Using Resident name temporarily for front-end autocomplete display/search query
                'last_name' => $residentLastName,
                'full_address' => $fullAddress,
            ];
        });

        return response()->json(['success' => true, 'data' => $results->values()]);
    }

    // --- SEPARATOR ---

    public function paymentYears()
    {
        // Use AddressPayment model
        $years = AddressPayment::whereNotNull('payment_date')
            ->select(DB::raw('YEAR(payment_date) as year'))
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year');

        return response()->json(['success' => true, 'data' => $years]);
    }

    // --- SEPARATOR ---

    /**
     * Calculates total valid income grouped by month.
     */
    public function incomeByMonth(Request $request)
    {
        $year = $request->get('year');
        $month = $request->get('month', null);
        $paymentType = $request->get('payment_type', null);

        if (!$year) {
            return response()->json(['success' => false, 'message' => 'Year is required'], 400);
        }

        $query = AddressPayment::query()
            ->join('fees', 'address_payments.fee_id', '=', 'fees.id')
            ->select(
                'address_payments.month',
                DB::raw('SUM(fees.amount) as total'),
                'address_payments.fee_id'
            )
            ->with('fee')
            ->where('address_payments.year', $year)
            ->where('address_payments.status', 'Pagado');

        if ($month) {
            $query->where('address_payments.month', $month);
        }

        if ($paymentType && $paymentType !== 'Todos') {
            $query->whereHas('fee', fn($q) => $q->where('name', $paymentType));
        }

        $income = $query->groupBy('address_payments.month', 'address_payments.fee_id')
            ->orderBy('address_payments.month')
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
