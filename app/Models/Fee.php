<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fee extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'amount',
        'description',
    ];

    public function residentPayments()
    {
        return $this->hasMany(ResidentPayment::class);
    }
}
