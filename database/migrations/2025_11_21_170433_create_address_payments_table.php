<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    /**
     * Run the migrations.
     * Creates the 'address_payments' table with standardized deletion audit fields and integrated foreign keys.
     */
    public function up()
    {
        // CREATE THE TABLE AND DEFINE ALL COLUMNS AND FOREIGN KEYS HERE
        Schema::create('address_payments', function (Blueprint $table) {
            $table->id();

            // --- TRANSACTIONAL FIELDS & FOREIGN KEYS ---
            
            // Foreign key to the 'addresses' table
            $table->foreignId('address_id')
                ->constrained('addresses')
                ->onDelete('cascade');
            
            // Foreign key to the 'fees' table
            $table->foreignId('fee_id')
                ->constrained('fees')
                ->onDelete('cascade');
            
            $table->unsignedTinyInteger('month');
            $table->year('year');
            $table->date('payment_date');
            
            // Primary status field (e.g., Pagado, Pendiente, Anulado)
            $table->string('status')->default('Pagado'); 

            // --- STANDARDIZED DELETION/VOID AUDIT FIELDS ---
            
            // Timestamp used for soft deletion (deleted_at equivalent)
            $table->timestamp('deleted_at')->nullable(); 

            // Reason for logically deleting/voiding the payment record
            $table->text('deletion_reason')->nullable(); 

            // Foreign key to the 'users' table, recording who performed the deletion/void.
            $table->foreignId('deleted_by_user_id') 
                ->nullable()
                ->constrained('users') 
                ->onDelete('set null'); // Set to null if the user is deleted

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations (Drops the entire table).
     */
    public function down()
    {
        Schema::dropIfExists('address_payments');
    }
};