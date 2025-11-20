<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AddressPayment extends Model // NEW MODEL NAME
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'address_payments'; // NEW TABLE NAME

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'address_id', // CRITICAL CHANGE
        'fee_id',
        'month',
        'year',
        'payment_date',
        'status',
        'cancellation_reason',
        'cancelled_at',
        'cancelled_by_user_id',
    ];

    /**
     * Get the address record associated with the payment (Belongs To).
     */
    public function address()
    {
        return $this->belongsTo(Address::class, 'address_id');
    }

    /**
     * Get the fee record associated with the payment (Belongs To).
     */
    public function fee()
    {
        return $this->belongsTo(Fee::class, 'fee_id')->withTrashed();
    }
    
    /**
     * Get the user who cancelled the payment (Belongs To).
     */
    public function cancelledBy()
    {
        return $this->belongsTo(User::class, 'cancelled_by_user_id');
    }
    
    // NOTE: You might need to add accessors here later if needed, 
    // similar to how ResidentPayment might have defined them.
}