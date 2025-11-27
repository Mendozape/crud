<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            
            // Link the expense to a user. This assumes you have a 'users' table.
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Name or description of the expense.
            $table->string('name', 100); 
            
            // The monetary amount of the expense. Use 'decimal' for financial data.
            $table->decimal('amount', 10, 2); 
            
            // The date the expense occurred.
            $table->date('expense_date');

            $table->timestamps();
            
            // For soft deletion, as requested by the user.
            $table->softDeletes(); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};