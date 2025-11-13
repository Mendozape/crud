<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddCancellationFieldsToResidentPaymentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('resident_payments', function (Blueprint $table) {
            
            // 1. STATUS: Tracks the payment state (e.g., 'Paid', 'Cancelled'). Default should be 'Paid'.
            $table->string('status')->default('Pagado')->after('payment_date');

            // 2. REASON: Stores the text justification for why the payment was cancelled.
            $table->text('cancellation_reason')->nullable()->after('status');

            // 3. AUDIT (WHEN): Timestamp indicating when the cancellation occurred.
            $table->timestamp('cancelled_at')->nullable()->after('cancellation_reason');

            // 4. AUDIT (WHO): Foreign key to the 'users' table, recording which user performed the cancellation.
            // set null ensures payments aren't deleted if the user who cancelled is removed.
            $table->foreignId('cancelled_by_user_id')
                  ->nullable()
                  ->constrained('users') 
                  ->onDelete('set null')
                  ->after('cancelled_at');
        });
    }

    /**
     * Reverse the migrations (Used for rollback).
     *
     * @return void
     */
    public function down()
    {
        Schema::table('resident_payments', function (Blueprint $table) {
            // Drop columns in reverse order of addition
            $table->dropForeign(['cancelled_by_user_id']); 
            $table->dropColumn('cancelled_by_user_id');
            $table->dropColumn('cancelled_at');
            $table->dropColumn('cancellation_reason');
            $table->dropColumn('status');
        });
    }
}