<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations to create the 'addresses' table.
     * Updated to link directly to 'users' instead of 'residents'.
     */
    public function up(): void
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();

            // --- FOREIGN KEYS ---
            
            // Link to the User who is the resident (Owner of the account)
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null')
                ->comment('Links the address to a specific user/resident account.');

            // Link to the standardized street catalog
            $table->foreignId('street_id')
                ->nullable()
                ->constrained('streets')
                ->onDelete('set null');

            // --- ADDRESS DATA ---
            $table->string('type', 50)->nullable()->comment('CASA or TERRENO');
            $table->string('street_number', 20);
            $table->string('community', 250);
            $table->text('comments')->nullable();
            
            // Financial audit field
            $table->integer('months_overdue')->default(0);

            // --- SYSTEM FIELDS ---
            $table->softDeletes();
            $table->timestamps();

            // Unique constraint: prevent duplicate house numbers on the same street
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