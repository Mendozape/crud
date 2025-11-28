<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Expense extends Model
{
    use HasFactory, SoftDeletes; // Add SoftDeletes trait

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'expense_category_id',
        'amount', 
        'expense_date',
        'deleted_by'
    ];
    
    // NOTE: If you still need a descriptive field, you can keep 'name' in $fillable,
    // but based on your request, we assume the name comes from the category.

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'expense_date' => 'date:Y-m-d', // Keeps the date format fix
    ];

    
    /**
     * Get the category this expense belongs to.
     */
    public function category()
    {
        // One expense belongs to one category.
        return $this->belongsTo(ExpenseCategory::class, 'expense_category_id');
    }
}