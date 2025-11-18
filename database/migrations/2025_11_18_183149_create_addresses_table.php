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
        Schema::create('addresses', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Address fields for the standardized catalog entry
            $table->text('type')->nullable()->comment('Type of community (e.g., Residential, Commercial)'); 
            $table->text('street')->comment('Standardized street name of the location'); 
            $table->text('street_number')->comment('House or lot number that is part of the unique address'); 
            $table->text('community')->comment('Standardized name of the Neighborhood or Subdivision'); 
            $table->text('comments')->nullable()->comment('General comments about this location entry'); 

            // SOFT DELETES: Adds the 'deleted_at' timestamp column
            $table->softDeletes(); 

            // Timestamps
            $table->timestamps();
            
            // UNIQUE CONSTRAINT: Ensures no two catalog entries have the same Community, Street, and Number.
            $table->unique(['community', 'street', 'street_number'], 'unique_full_address');
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