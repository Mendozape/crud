<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

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
     *
     * @var array<int, string>
     */
    protected $fillable = [
        // NEW: Foreign key added to this table
        'resident_id',
        'type',
        'street',
        'street_number',
        'community',
        'comments',
    ];

    /**
     * Define the inverse relationship.
     * An Address belongs to ONE Resident. This is the 'belongsTo' side of the 1:1 relationship.
     * Since resident_id is unique and nullable in the addresses table, it's 1:1 Optional.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function resident()
    {
        // This relationship uses the 'resident_id' column on the current 'addresses' table
        return $this->belongsTo(Resident::class, 'resident_id');
    }
    
    // NOTE: The old residents() method (HasMany) was removed because the table no longer acts as a general catalog 
    // where many residents point to it. Instead, this address points to one resident (resident()).
}