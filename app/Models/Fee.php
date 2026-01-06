<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\AddressPayment; 

class Fee extends Model
{
    use HasFactory, SoftDeletes; 
    
    protected $fillable = [
        'name',
        'amount_house',
        'amount_land',
        'description',
        'active',
        'deletion_reason',
        'deleted_by_user_id',
    ];

    /**
     * Relationship with AddressPayment.
     * Updated to follow your instruction regarding the addressPayments model.
     */
    public function addressPayments()
    {
        return $this->hasMany(AddressPayment::class);
    }
    
    /**
     * Relationship to identify the user who performed the soft delete.
     */
    public function deleter()
    {
        return $this->belongsTo(\App\Models\User::class, 'deleted_by_user_id');
    }

    /**
     * Optional: Helper to get the correct amount based on an Address type.
     * This is useful if you want to determine the price dynamically.
     */
    public function getAmountByType(string $type)
    {
        return $type === 'house' ? $this->amount_house : $this->amount_land;
    }
}