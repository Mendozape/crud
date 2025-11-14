<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateResidentPaymentsTableFinalNormalized extends Migration
{
    /**
     * Run the migrations (Creates the table with all payment and audit fields).
     *
     * @return void
     */
    public function up()
    {
        Schema::create('resident_payments', function (Blueprint $table) {
            $table->id();

            // --- BASE TRANSACTIONAL FIELDS ---
            $table->foreignId('resident_id')
                ->constrained()
                ->onDelete('cascade');

            $table->foreignId('fee_id') // KEY: We rely entirely on this ID for amount/description
                ->constrained('fees')
                ->onDelete('cascade');
            $table->unsignedTinyInteger('month'); // 1 = January, ..., 12 = December
            $table->year('year');
            $table->date('payment_date');
            // STATUS: Default is 'Pagado'.
            $table->string('status')->default('Pagado');

            // REASON: Stores the justification for cancellation.
            $table->text('cancellation_reason')->nullable();

            // AUDIT (WHEN): Timestamp indicating when the cancellation occurred.
            $table->timestamp('cancelled_at')->nullable();

            // AUDIT (WHO): Foreign key to the 'users' table, recording which user performed the cancellation.
            $table->foreignId('cancelled_by_user_id')
                ->nullable()
                ->constrained('users') 
                ->onDelete('set null');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations (Drops the entire table).
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('resident_payments');
    }
}