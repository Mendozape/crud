<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FeesTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('fees')->insert([
            [
                'name' => 'Monthly Maintenance',
                'amount' => 100.00,
                'description' => 'Monthly maintenance fee',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Parking Fee',
                'amount' => 50.00,
                'description' => 'Monthly parking spot fee',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Late Payment Penalty',
                'amount' => 25.00,
                'description' => 'Penalty for late payment',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
