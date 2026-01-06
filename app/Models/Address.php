<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany; 
// Importamos el modelo User para la relación
use App\Models\User;

class Address extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'addresses';

    /**
     * The attributes that are mass assignable.
     * UPDATED: Changed resident_id to user_id and removed legacy resident_user/password.
     */
    protected $fillable = [
        'user_id',       // Links directly to the Users table
        'street_id',
        'type',
        'street_number',
        'community',
        'comments',
        'months_overdue',
    ];

    protected $casts = [
        'months_overdue' => 'integer',
    ];

    /**
     * Relationship with the User (Resident).
     * An Address belongs to a User who has the 'Residente' role.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    
    /**
     * Relationship with the Street catalog.
     */
    public function street(): BelongsTo
    {
        return $this->belongsTo(Street::class, 'street_id');
    }
    
    /**
     * Relationship with AddressPayment.
     */
    public function payments(): HasMany 
    {
        return $this->hasMany(AddressPayment::class, 'address_id');
    }

    /**
     * Note: generateResidentCredentials was removed because residents 
     * now use their official User email/password for authentication.
     */
}