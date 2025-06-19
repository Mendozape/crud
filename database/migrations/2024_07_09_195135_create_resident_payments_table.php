<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateResidentPaymentsTable extends Migration
{
    public function up()
    {
        Schema::create('resident_payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('resident_id')
                ->constrained()
                ->onDelete('cascade');

            $table->foreignId('fee_id')
                ->constrained('fees')
                ->onDelete('cascade');

            $table->decimal('amount', 8, 2);
            $table->unsignedTinyInteger('month'); // 1 = January, ..., 12 = December
            $table->year('year');
            $table->string('description')->nullable();
            $table->date('payment_date');

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('resident_payments');
    }
}
