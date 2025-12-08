<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates the addresses table with foreign keys for both resident and street, 
     * including the new 'months_overdue' field.
     */
    public function up(): void
    {
        Schema::create('addresses', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // --- Foreign Key: Resident (1:N) ---
            // Links an address to a resident. Multiple addresses can link to the same resident (1:N).
            $table->foreignId('resident_id')
                  ->nullable() 
                  ->constrained('residents')
                  ->onDelete('set null')
                  ->comment('ID of the assigned resident. Allows duplicates (1:N) and can be NULL.');
            
            // --- Foreign Key: Street (1:N) ---
            // Links an address to a standardized street entry.
            $table->foreignId('street_id')
                  ->nullable() // Decide if an address must have a street ID
                  ->constrained('streets') 
                  ->onDelete('set null') // If the referenced street is soft deleted, set this ID to NULL
                  ->comment('ID of the street. Foreign key to the streets table (1:N).');
            // ------------------------------------

            // Address fields
            $table->text('type')->nullable()->comment('Type of property (e.g., CASA, TERRENO)'); 
            // The 'street' text column is REMOVED, replaced by 'street_id'.
            $table->text('street_number')->comment('House or lot number that is part of the unique address'); 
            $table->text('community')->comment('Standardized name of the Neighborhood or Subdivision'); 
            $table->text('comments')->nullable()->comment('General comments about this location entry'); 

            // --- New Field for Overdue Payments ---
            $table->integer('months_overdue')
                  ->default(0)
                  ->comment('Count of payment months currently overdue for this address.');
            // ---------------------------------------

            // SOFT DELETES: Adds the 'deleted_at' timestamp column
            $table->softDeletes(); 

            // Timestamps
            $table->timestamps();
            
            // UNIQUE CONSTRAINT: Ensures no two catalog entries have the same Community, Street (by ID), and Number.
            // NOTE: The constraint is updated to use 'street_id' instead of 'street'.
            $table->unique(['community', 'street_id', 'street_number', 'deleted_at'], 'unique_full_address_v2');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};