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

            // --- AJUSTE CRUCIAL: Clave Foránea 1:N (El campo NO es único) ---
            // 1. El campo 'resident_id' se deja repetible, permitiendo 1:N.
            // 2. nullable(): Permite que la dirección esté sin un residente asignado.
            // 3. onDelete('set null'): Si el residente se borra, la dirección queda sin dueño.
            $table->foreignId('resident_id')
                  ->nullable() 
                  ->constrained('residents')
                  ->onDelete('set null')
                  ->comment('ID del residente asignado. Permite duplicados (1:N) y puede ser NULL.');
            // -----------------------------------------------------------------------

            // Address fields for the standardized catalog entry
            $table->text('type')->nullable()->comment('Type of property (e.g., CASA, TERRENO)'); 
            $table->text('street')->comment('Standardized street name of the location'); 
            $table->text('street_number')->comment('House or lot number that is part of the unique address'); 
            $table->text('community')->comment('Standardized name of the Neighborhood or Subdivision'); 
            $table->text('comments')->nullable()->comment('General comments about this location entry'); 

            // SOFT DELETES: Adds the 'deleted_at' timestamp column
            $table->softDeletes(); 

            // Timestamps
            $table->timestamps();
            
            // UNIQUE CONSTRAINT: Ensures no two catalog entries have the same Community, Street, and Number.
            $table->unique(['community', 'street', 'street_number', 'deleted_at'], 'unique_full_address');
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