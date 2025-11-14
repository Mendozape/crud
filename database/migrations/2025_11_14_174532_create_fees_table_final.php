<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFeesTableFinal extends Migration
{
    /**
     * Creates the fees table, including soft deletes and audit fields.
     */
    public function up()
    {
        Schema::create('fees', function (Blueprint $table) {
            $table->id();

            // --- EXISTING BASE FIELDS (Not changed) ---
            $table->string('name')->unique();
            $table->decimal('amount', 8, 2);
            $table->text('description')->nullable();
            $table->boolean('active')->default(true);
            
            // --- EXISTING SOFT DELETES FIELD (Creates 'deleted_at') ---
            $table->softDeletes();
            
            // --- NEW AUDIT FIELDS FOR CANCELLATION ---
            
            // 1. REASON: Stores the justification for why the fee was logically deleted.
            $table->text('deletion_reason')->nullable(); 

            // 2. AUDIT (WHO): Foreign key to the 'users' table, recording which user performed the deletion.
            $table->foreignId('deleted_by_user_id')
                  ->nullable()
                  ->constrained('users') // Assumes a 'users' table exists
                  ->onDelete('set null');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations (Drops the entire table).
     */
    public function down()
    {
        Schema::dropIfExists('fees');
    }
}