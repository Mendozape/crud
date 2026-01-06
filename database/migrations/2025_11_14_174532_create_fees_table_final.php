<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Eliminamos "class CreateFeesTable" y usamos una clase anónima
return new class extends Migration
{
    /**
     * Run the migrations to create the 'fees' table.
     * This version replaces 'amount' with differentiated house and land values.
     */
    public function up()
    {
        Schema::create('fees', function (Blueprint $table) {
            $table->id();
            // --- CORE FIELDS ---
            $table->string('name')->unique();
            // New specific amount fields for different property types
            $table->decimal('amount_house', 10, 2)->default(0.00);
            $table->decimal('amount_land', 10, 2)->default(0.00);
            $table->text('description')->nullable();
            $table->boolean('active')->default(true);
            // --- SOFT DELETES & AUDIT LOGS ---
            $table->softDeletes();
            $table->text('deletion_reason')->nullable(); 

            // Foreign key to track which user performed the soft delete
            $table->foreignId('deleted_by_user_id')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('fees');
    }
}; 