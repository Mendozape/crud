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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            
            // Sender of the message (Foreign key to users table)
            $table->foreignId('sender_id')
                  ->constrained('users')
                  ->onDelete('cascade');

            // Receiver of the message (Foreign key to users table)
            $table->foreignId('receiver_id')
                  ->constrained('users')
                  ->onDelete('cascade');
                  
            // The actual message content (text is good for long messages)
            $table->text('content'); 
            
            // Status tracking: NULL means unread, timestamp means read date
            $table->timestamp('read_at')->nullable(); 
            
            $table->timestamps(); // creates created_at and updated_at
            
            // Optimization for message lookups
            $table->index(['sender_id', 'receiver_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};