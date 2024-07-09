<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResidentPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'resident_id',
        'fee_id',
        'amount',
        'description',
        'payment_date',
    ];

    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }

    public function fee()
    {
        return $this->belongsTo(Fee::class);
    }
}
