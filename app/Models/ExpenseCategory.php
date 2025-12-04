<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Expense;

class ExpenseCategory extends Model
{
    use HasFactory, SoftDeletes; // Enables soft deletion

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
    ];

    /**
     * Get the expenses that belong to this category.
     */
    public function expenses(): HasMany
    {
        // One category can have many expense transactions.
        // It correctly assumes the foreign key is 'expense_category_id' in the 'expenses' table.
        return $this->hasMany(Expense::class);
    }
}