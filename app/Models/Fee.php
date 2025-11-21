<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

// Import the correct payment model
use App\Models\AddressPayment; 

class Fee extends Model
{
    // The SoftDeletes trait is already correctly used here.
    use HasFactory, SoftDeletes; 
    
    protected $fillable = [
        'name',
        'amount',
        'description',
        'active',
        // AUDIT FIELDS (Now correct in fillable)
        'deletion_reason',
        'deleted_by_user_id',
    ];
    
    // KEY CORRECTION: Defines the relationship the controller expects (addressPayments())
    public function addressPayments()
    {
        return $this->hasMany(AddressPayment::class);
    }
    
    // Relationship to identify the user who performed the soft delete (optional but good for audit)
    public function deleter()
    {
        return $this->belongsTo(\App\Models\User::class, 'deleted_by_user_id');
    }
}