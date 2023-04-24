<?php

namespace Database\Seeders;

use GuzzleHttp\Promise\Create;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        /*
        Admin=>todos
        Manager=> Ver listado de usuarios y ver usuario
        Developer=>dashboard
        */
        $admin=Role::create(['name'=>'Admin']);
        $manager=Role::create(['name'=>'Manager']);
        $developer=Role::create(['name'=>'Developer']);

        Permission::create(['name'=>'client.welcome'])->syncRoles([$admin,$manager,$developer]);
        Permission::create(['name'=>'client.create'])->syncRoles([$admin]);
        Permission::create(['name'=>'client.edit'])->syncRoles([$admin]);
    }
}
