<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Models\Address;
use App\Models\Fee;
use App\Models\User;

class AddressPayment extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'address_payments';

    /**
     * Mass assignable attributes.
     *
     * @var array
     */
    protected $fillable = [
        'address_id',
        'fee_id',
        'month',
        'year',
        'payment_date',
        'amount_paid',          
        'status',

        // --- AUDIT FIELDS ---
        'deletion_reason',
        'deleted_by_user_id',
    ];

    /**
     * The attributes that should be mutated to dates.
     */
    protected $dates = [
        'payment_date',
        'deleted_at',
    ];

    /**
     * Address relationship (Belongs To)
     */
    public function address()
    {
        return $this->belongsTo(Address::class, 'address_id');
    }

    /**
     * Fee relationship (Belongs To, including soft-deleted fees)
     */
    public function fee()
    {
        return $this->belongsTo(Fee::class, 'fee_id')->withTrashed();
    }

    /**
     * User who performed the logical deletion
     */
    public function deletedBy()
    {
        return $this->belongsTo(User::class, 'deleted_by_user_id');
    }
}
