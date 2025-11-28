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

            // Foreign key linking the expense to a category in the catalog.
            // It is nullable because past expenses must survive even if a category is deleted.
            $table->foreignId('expense_category_id')
                  ->nullable()
                  ->constrained('expense_categories')
                  ->nullOnDelete();

            // Total amount of the expense.
            $table->decimal('amount', 10, 2);

            // Date when the expense occurred.
            $table->date('expense_date');

            // NEW FIELD:
            // Stores the ID of the user who deleted the record.
            // This field is filled automatically during soft-delete operations.
            $table->foreignId('deleted_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            // Laravel timestamps (created_at, updated_at).
            $table->timestamps();

            // Soft delete column (deleted_at).
            // Allows restoring records and tracking soft deletions.
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
