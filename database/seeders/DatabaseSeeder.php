<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        //Roles y permisos
        //usuarios base
        $this->call(RoleSeeder::class);
        $this->call(UserSeeder::class);
        // \App\Models\User::factory(10)->create();
        
        /*User::factory(10)->create()->each(function($user){
            $user->assignRole('Developer');
        });*/

    }
}
