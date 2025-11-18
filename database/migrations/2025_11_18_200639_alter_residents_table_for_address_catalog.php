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
        Schema::create('residents', function (Blueprint $table) {
            $table->id();
            
            // Standard resident information
            $table->string('photo')->nullable(); // Resident photo (optional)
            $table->string('name');
            $table->string('last_name');
            $table->string('email')->unique();
            
            // --- NORMALIZED ADDRESS LINK ---
            // Foreign Key linking the resident to the standardized entry in the 'addresses' catalog.
            $table->foreignId('address_catalog_id')
                  ->constrained('addresses') // Ensures the ID exists in the addresses table
                  ->onDelete('restrict'); // Prevents deleting an address if a resident is linked

            // Field for comments specific to the resident (keeping the original name: 'comments')
            $table->text('comments')->nullable()->comment('General comments related to the resident (e.g., specific needs, private notes, etc.).');
            
            // Timestamps and Soft Deletes
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations (Drops the new table).
     */
    public function down(): void
    {
        // ENGLISH CODE COMMENTS
        // Drops the entire new residents table
        Schema::dropIfExists('residents');
    }
};