<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Address;
use App\Models\Fee;
use App\Models\User;

class AddressPayment extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'address_payments';

    /**
     * The attributes that are mass assignable.
     *
     * IMPORTANT FIX: Using standardized deletion fields from the migration.
     *
     * @var array
     */
    protected $fillable = [
        'address_id',
        'fee_id',
        'month',
        'year',
        'payment_date',
        'status',
        
        // --- CORRECTED AUDIT FIELDS (Matching 'fees' table and migration) ---
        'deletion_reason',      // FIX
        'deleted_at',           // FIX
        'deleted_by_user_id',   // FIX
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
     * The fee must use withTrashed() to view fees that were soft-deleted later.
     */
    public function fee()
    {
        return $this->belongsTo(Fee::class, 'fee_id')->withTrashed();
    }
    
    /**
     * Get the user who logically deleted/annulled the payment (Belongs To).
     * FIX: Relationship renamed to match the audit column.
     */
    public function deletedBy()
    {
        return $this->belongsTo(User::class, 'deleted_by_user_id');
    }
}