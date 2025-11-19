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
        // 'address_catalog_id' is removed from here because the FK is now on the 'addresses' table
        'comments',           // Original field name for resident-specific comments
    ];

    /**
     * Define the ONE-TO-ONE relationship with the Address model.
     * A Resident HAS ONE Address. The foreign key (resident_id) is located on the Address model.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function address()
    {
        // ENGLISH CODE COMMENTS
        // The second parameter specifies the foreign key on the Address model.
        return $this->hasOne(Address::class, 'resident_id'); 
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
}