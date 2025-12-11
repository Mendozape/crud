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
        $presidente=Role::create(['name'=>'Presidente']);
        $secretario=Role::create(['name'=>'Secretario']);
        $tesorero=Role::create(['name'=>'Tesorero']);
        $residente=Role::create(['name'=>'Residente']);
             
        Permission::create(['name'=>'view-users'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'create-users'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'edit-users'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'delete-users'])->syncRoles([$presidente,$secretario,$tesorero]);

        Permission::create(['name'=>'view-roles'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'create-roles'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'edit-roles'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'delete-roles'])->syncRoles([$presidente,$secretario,$tesorero]);

        Permission::create(['name'=>'view-permissions'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'create-permissions'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'edit-permissions'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'delete-permissions'])->syncRoles([$presidente,$secretario,$tesorero]);

        Permission::create(['name'=>'view-streets'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'create-streets'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'edit-streets'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'delete-streets'])->syncRoles([$presidente,$secretario,$tesorero]);
        
        Permission::create(['name'=>'view-fees'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'create-fees'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'edit-fees'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'delete-fees'])->syncRoles([$presidente,$secretario,$tesorero]);

        Permission::create(['name'=>'view-expenses-catalog'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'create-expenses-catalog'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'edit-expenses-catalog'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'delete-expenses-catalog'])->syncRoles([$presidente,$secretario,$tesorero]);

        Permission::create(['name'=>'view-expenses'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'create-expenses'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'edit-expenses'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'delete-expenses'])->syncRoles([$presidente,$secretario,$tesorero]);

        Permission::create(['name'=>'view-residents'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'create-residents'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'edit-residents'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'delete-residents'])->syncRoles([$presidente,$secretario,$tesorero]);

        Permission::create(['name'=>'view-properties'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'create-properties'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'edit-properties'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'delete-properties'])->syncRoles([$presidente,$secretario,$tesorero]);

        Permission::create(['name'=>'view-addresses'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'create-addresses'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'edit-addresses'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'delete-addresses'])->syncRoles([$presidente,$secretario,$tesorero]);

        Permission::create(['name'=>'view-payments'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'create-payments'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'edit-payments'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'delete-payments'])->syncRoles([$presidente,$secretario,$tesorero]);

        Permission::create(['name'=>'reports'])->syncRoles([$presidente,$secretario,$tesorero]);
        Permission::create(['name'=>'stats'])->syncRoles([$presidente,$secretario,$tesorero]);
    }
}
