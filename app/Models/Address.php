<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany; 
use App\Models\AddressPayment;

class Address extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'addresses';

    /**
     * The attributes that are mass assignable.
     * Includes the new 'months_overdue' field.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'resident_id',
        'street_id',       // <-- Foreign key referencing the 'streets' table
        'type',
        'street_number',
        'community',
        'comments',
        'months_overdue',  // <-- NEW FIELD: Count of payment months currently overdue
    ];

    /**
     * The attributes that should be cast.
     * Ensures 'months_overdue' is handled as an integer.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'months_overdue' => 'integer',
    ];

    /**
     * Get the Resident that owns the Address. (Inverse 1:N relationship)
     * An Address belongs to ONE Resident.
     *
     * @return BelongsTo
     */
    public function resident(): BelongsTo
    {
        // This relationship uses the 'resident_id' column on the current 'addresses' table
        return $this->belongsTo(Resident::class, 'resident_id');
    }
    
    /**
     * Get the Street that owns the Address. (Inverse 1:N relationship)
     * An Address belongs to ONE Street.
     *
     * @return BelongsTo
     */
    public function street(): BelongsTo
    {
        // This relationship uses the 'street_id' column on the current 'addresses' table
        return $this->belongsTo(Street::class, 'street_id');
    }
    
    /**
     * Get the payments associated with the Address. (1:N relationship)
     * An Address has many payments.
     *
     * @return HasMany
     */
    public function payments(): HasMany 
    {
        // Uses AddressPayment::class as the payment model, aligning with the 'addressPayments' system.
        return $this->hasMany(AddressPayment::class, 'address_id');
    }
}