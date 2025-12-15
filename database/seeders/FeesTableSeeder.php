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
                'name' => 'Mantenimiento',
                'amount' => 500.00,
                'description' => 'Mantenimiento del fraccionamiento',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
