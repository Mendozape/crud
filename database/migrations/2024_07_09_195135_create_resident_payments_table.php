<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateResidentPaymentsTable extends Migration
{
    public function up()
    {
        Schema::create('resident_payments', function (Blueprint $table) {
            $table->id(); // Auto-incrementing primary key

            // Foreign key to residents table, deletes payments if resident is deleted
            $table->foreignId('resident_id')
                  ->constrained()
                  ->onDelete('cascade');

            // Foreign key to fees table, deletes payments if fee is deleted
            $table->foreignId('fee_id')
                  ->constrained('fees')
                  ->onDelete('cascade');

            $table->decimal('amount', 8, 2);     // Payment amount
            $table->string('month');             // Month of the payment (e.g., "January")
            $table->string('year');              // Year of the payment (e.g., "2025")
            $table->string('description')->nullable(); // Optional description
            $table->date('payment_date');        // Date the payment was made

            $table->timestamps();                // created_at and updated_at
        });
    }

    public function down()
    {
        Schema::dropIfExists('resident_payments');
    }
}
