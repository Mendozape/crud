<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Resident extends Model
{
    use HasFactory;
    //public $timestamps = true;
    //protected $table = 'residents';
    protected $fillable = ['photo','name','last_name', 'email', 'street', 'street_number', 'community', 'comments'];
}
