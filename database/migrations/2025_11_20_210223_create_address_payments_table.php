<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    /**
     * Run the migrations (Creates the table with all payment and audit fields).
     */
    public function up()
    {
        // 1. CREATE THE TABLE WITHOUT FOREIGN KEYS FIRST
        Schema::create('address_payments', function (Blueprint $table) {
            $table->id();

            // --- BASE TRANSACTIONAL FIELDS ---
            // CRITICAL CHANGE: Use address_id instead of resident_id
            $table->unsignedBigInteger('address_id'); 
            
            $table->unsignedBigInteger('fee_id');
            $table->unsignedTinyInteger('month');
            $table->year('year');
            $table->date('payment_date');
            $table->string('status')->default('Pagado');

            // REASON: Stores the justification for cancellation.
            $table->text('cancellation_reason')->nullable();

            // AUDIT (WHEN): Timestamp indicating when the cancellation occurred.
            $table->timestamp('cancelled_at')->nullable();

            // AUDIT (WHO): Define the column for the user who cancelled the payment
            $table->unsignedBigInteger('cancelled_by_user_id')->nullable();

            $table->timestamps();
        });

        // 2. ADD FOREIGN KEYS AFTER ALL PARENT TABLES ARE ASSUMED TO BE CREATED
        Schema::table('address_payments', function (Blueprint $table) {
            // CRITICAL CHANGE: Foreign key references the 'addresses' table
            $table->foreign('address_id')
                ->references('id')->on('addresses')
                ->onDelete('cascade');

            $table->foreign('fee_id')
                ->references('id')->on('fees')
                ->onDelete('cascade');

            $table->foreign('cancelled_by_user_id')
                ->references('id')->on('users')
                ->onDelete('set null');
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