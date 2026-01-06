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
     *
     * @var array
     */
    protected $fillable = [
        'photo',
        'name',
        'last_name',
        'email',
        // 'comments' is kept as resident-specific data
        'comments',           
    ];

    /**
     * Define the ONE-TO-MANY relationship with the Address model.
     * A Resident HAS MANY Addresses. The foreign key (resident_id) is located on the Address model.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function addresses() // Renamed from address() to plural 'addresses'
    {
        // ENGLISH CODE COMMENTS
        // The foreign key 'resident_id' exists on the related table (addresses)
        return $this->hasMany(Address::class, 'resident_id'); 
    }
    
    /**
     * Define the relationship with Resident Payments.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function residentPayments()
    {
        // ENGLISH CODE COMMENTS
        // Assuming the foreign key in the resident_payments table is 'resident_id'
        return $this->hasMany(ResidentPayment::class);
    }
    
    // NOTE: The previous address() method was removed to avoid conflicting relationships.
}