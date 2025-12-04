<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Street extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['name'];

    /**
     * Get the Addresses for the Street. (1:N relationship)
     * A Street can have many Addresses.
     *
     * @return HasMany
     */
    public function addresses(): HasMany
    {
        // References the foreign key 'street_id' in the 'addresses' table
        return $this->hasMany(Address::class);
    }
}