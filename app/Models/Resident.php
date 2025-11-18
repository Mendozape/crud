<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // Added for soft deletion functionality

class Resident extends Model
{
    use HasFactory, SoftDeletes; // Added SoftDeletes trait

    /**
     * The attributes that are mass assignable.
     * Only fields that exist in the normalized database schema are included.
     *
     * @var array
     */
    protected $fillable = [
        'photo',
        'name',
        'last_name',
        'email',
        'address_catalog_id', // NEW: Foreign key to the addresses catalog
        'comments',           // Original field name for resident-specific comments
    ];

    /**
     * Define the inverse one-to-many relationship with the Address Catalog.
     * A Resident belongs to one specific Address catalog entry.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function addressCatalog()
    {
        return $this->belongsTo(Address::class, 'address_catalog_id');
    }
    
    /**
     * Define the relationship with Resident Payments.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function residentPayments()
    {
        // Assuming the foreign key in the resident_payments table is 'resident_id'
        return $this->hasMany(ResidentPayment::class);
    }
}