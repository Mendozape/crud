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
     * NOTE: The 'street' text column has been replaced by the 'street_id' foreign key.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'resident_id',
        'street_id',       // <-- NEW FIELD: Foreign key referencing the 'streets' table
        'type',
        'street_number',
        'community',
        'comments',
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
        // We explicitly define the foreign key for clarity, though it follows convention.
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
        // We explicitly define the foreign key for clarity, though it follows convention.
        return $this->belongsTo(Street::class, 'street_id');
    }
    public function payments(): HasMany 
    {
        // the foreign key 'address_id' exist in the table 'address_payments'
        return $this->hasMany(AddressPayment::class, 'address_id');
    }
}