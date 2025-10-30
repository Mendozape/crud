<?php 

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
	use HasFactory;
    public $timestamps = true;
    protected $table = 'clients';
    protected $fillable = ['name','due','comments','image'];
}
