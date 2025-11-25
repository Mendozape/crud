<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration 
{
    /**
     * Run the migrations.
     * Creates the 'address_payments' table with historical amount tracking.
     */
    public function up()
    {
        Schema::create('address_payments', function (Blueprint $table) {
            $table->id();

            // --- RELATIONSHIPS ---
            $table->foreignId('address_id')
                ->constrained('addresses')
                ->onDelete('cascade');

            $table->foreignId('fee_id')
                ->constrained('fees')
                ->onDelete('cascade');

            // --- PAYMENT PERIOD ---
            $table->unsignedTinyInteger('month');  // 1-12
            $table->year('year');

            $table->date('payment_date');

            // --- NEW CRUCIAL FIELD: stores historical cost ---
            $table->decimal('amount_paid', 8, 2);

            // --- STATUS ---
            $table->string('status')->default('Pagado');

            // --- AUDIT & SOFT DELETE ---
            $table->timestamp('deleted_at')->nullable();
            $table->text('deletion_reason')->nullable();

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
        Schema::dropIfExists('address_payments');
    }
};
