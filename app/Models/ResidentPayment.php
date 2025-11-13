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
        'amount',
        'description',
        'payment_date',
        'month',
        'year',
        
        //NEW CANCELLATION FIELDS ADDED
        'status', 
        'cancellation_reason',
        'cancelled_at',
        'cancelled_by_user_id',
    ];

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }

    public function fee()
    {
        // This relationship is crucial for the PaymentHistoryPage React component.
        return $this->belongsTo(Fee::class);
    }
    
    // Optional: Add the relationship to the User who performed the cancellation audit
    public function canceller()
    {
        return $this->belongsTo(\App\Models\User::class, 'cancelled_by_user_id');
    }
}