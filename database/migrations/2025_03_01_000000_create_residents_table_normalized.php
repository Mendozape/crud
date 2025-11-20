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
        // ENGLISH CODE COMMENTS
        // 1. CREATE THE TABLE WITH ONLY RESIDENT DATA
        Schema::create('residents', function (Blueprint $table) {
            // ENGLISH CODE COMMENTS
            $table->id();
            
            // Standard resident information
            $table->string('photo')->nullable(); // Resident photo (optional)
            $table->string('name');
            $table->string('last_name');
            $table->string('email')->unique();
            
            // --- CRUCIAL FIX: address_catalog_id IS REMOVED ---
            // The FK is now solely on the 'addresses' table, referencing this ID.
            
            // Field for comments specific to the resident
            $table->text('comments')->nullable()->comment('General comments related to the resident.');
            
            // Timestamps and Soft Deletes
            $table->softDeletes();
            $table->timestamps();
        });
        
        // NOTE: The Schema::table block for adding the FK constraint is removed entirely.
        // The foreign key is now defined in the addresses migration, pointing here.
    }

    /**
     * Reverse the migrations (Drops the table).
     */
    public function down(): void
    {
        // ENGLISH CODE COMMENTS
        // Drops the entire table
        Schema::dropIfExists('residents');
    }
};