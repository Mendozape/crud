<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResidentPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'resident_id',
        'fee_id',
        'payment_date',
        'month',
        'year',
        'status', 
        'cancellation_reason',
        'cancelled_at',
        'cancelled_by_user_id',
    ];

    /**
     * ACCESSOR: Gets the amount from the related Fee record.
     * Required for reports/history where the resident_payments.amount column was removed.
     */
    public function getAmountAttribute()
    {
        // Fallback to 0 if the fee relationship is somehow not loaded or fee is missing
        return $this->fee->amount ?? 0; 
    }

    /**
     * ACCESSOR: Gets the description from the related Fee record.
     * Required for reports/history where the resident_payments.description column was removed.
     */
    public function getDescriptionAttribute()
    {
        return $this->fee->description ?? null;
    }

    // --- RELATIONSHIPS ---

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }

    public function fee()
    {
        // This relationship is crucial for accessing the amount/description via the Accessors.
        return $this->belongsTo(Fee::class);
    }
    
    // Optional: Add the relationship to the User who performed the cancellation audit
    public function canceller()
    {
        return $this->belongsTo(\App\Models\User::class, 'cancelled_by_user_id');
    }
}