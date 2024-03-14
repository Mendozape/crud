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
        $developer=Role::create(['name'=>'Developer']);
        Permission::create(['name'=>'bienvenida-cliente'])->syncRoles([$admin,$developer]);
        Permission::create(['name'=>'crear-cliente'])->syncRoles([$admin]);
        Permission::create(['name'=>'editar-cliente'])->syncRoles([$admin]);
        Permission::create(['name'=>'borrar-cliente'])->syncRoles([$admin]);

        Permission::create(['name'=>'Ver-rol'])->syncRoles([$admin,$developer]);
        Permission::create(['name'=>'crear-rol'])->syncRoles([$admin]);
        Permission::create(['name'=>'editar-rol'])->syncRoles([$admin]);
        Permission::create(['name'=>'borrar-rol'])->syncRoles([$admin]);

        Permission::create(['name'=>'ver-permiso'])->syncRoles([$admin]);
        Permission::create(['name'=>'crear-permiso'])->syncRoles([$admin]);
        Permission::create(['name'=>'editar-permiso'])->syncRoles([$admin,$developer]);
        Permission::create(['name'=>'borrar-permiso'])->syncRoles([$admin]);

        Permission::create(['name'=>'ver-usuario'])->syncRoles([$admin]);
        Permission::create(['name'=>'crear-usuario'])->syncRoles([$admin]);
        Permission::create(['name'=>'editar-usuario'])->syncRoles([$admin,$developer]);
        Permission::create(['name'=>'borrar-usuario'])->syncRoles([$admin]);
    }
}
