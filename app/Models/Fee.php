<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Fee extends Model
{
    // The SoftDeletes trait is already correctly used here.
    use HasFactory, SoftDeletes; 
    
    protected $fillable = [
        'name',
        'amount',
        'description',
        'active',
        // 🚨 NEW AUDIT FIELDS ADDED TO $fillable
        'deletion_reason',
        'deleted_by_user_id',
        // 'deleted_at' is handled automatically by SoftDeletes
    ];
    
    // Relationship needed to check for associated payments before soft deleting
    public function residentPayments()
    {
        return $this->hasMany(ResidentPayment::class);
    }
    
    // Relationship to identify the user who performed the soft delete (optional but good for audit)
    public function deleter()
    {
        return $this->belongsTo(\App\Models\User::class, 'deleted_by_user_id');
    }
}