<?php

namespace Database\Seeders;
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
        $presidente=Role::create(['name'=>'Presidente']);
        $secretario=Role::create(['name'=>'Secretario']);
        $tesorero=Role::create(['name'=>'Tesorero']);
        $residente=Role::create(['name'=>'Residente']);
             
        Permission::create(['name'=>'Ver-usuarios'])->syncRoles([$presidente,$secretario,$tesorero,$admin]);
        Permission::create(['name'=>'Crear-usuarios'])->syncRoles([$presidente,$secretario,$tesorero,$admin]);
        Permission::create(['name'=>'Editar-usuarios'])->syncRoles([$presidente,$secretario,$tesorero,$admin]);
        Permission::create(['name'=>'Eliminar-usuarios'])->syncRoles([$presidente,$secretario,$tesorero,$admin]);

        Permission::create(['name'=>'Ver-roles'])->syncRoles([$presidente,$secretario,$tesorero,$admin]);
        Permission::create(['name'=>'Crear-roles'])->syncRoles([$admin]);
        Permission::create(['name'=>'Editar-roles'])->syncRoles([$admin]);
        Permission::create(['name'=>'Eliminar-roles'])->syncRoles([$admin]);

        Permission::create(['name'=>'Ver-permisos'])->syncRoles([$presidente,$secretario,$tesorero,$admin]);
        Permission::create(['name'=>'Crear-permisos'])->syncRoles([$admin]);
        Permission::create(['name'=>'Editar-permisos'])->syncRoles([$admin]);
        Permission::create(['name'=>'Eliminar-permisos'])->syncRoles([$admin]);

        Permission::create(['name'=>'Ver-calles'])->syncRoles([$presidente,$secretario,$tesorero],$admin);
        Permission::create(['name'=>'Crear-calles'])->syncRoles([$presidente,$secretario,$tesorero,$admin]);
        Permission::create(['name'=>'Editar-calles'])->syncRoles([$presidente,$secretario,$tesorero,$admin]);
        Permission::create(['name'=>'Eliminar-calles'])->syncRoles([$presidente,$secretario,$tesorero,$admin]);
        
        Permission::create(['name'=>'Ver-cuotas'])->syncRoles([$presidente,$secretario,$tesorero,$admin]);
        Permission::create(['name'=>'Crear-cuotas'])->syncRoles([$tesorero,$admin]);
        Permission::create(['name'=>'Editar-cuotas'])->syncRoles([$tesorero,$admin]);
        Permission::create(['name'=>'Eliminar-cuotas'])->syncRoles([$tesorero,$admin]);

        Permission::create(['name'=>'Ver-catalogo-gastos'])->syncRoles([$presidente,$secretario,$tesorero],$admin);
        Permission::create(['name'=>'Crear-catalogo-gastos'])->syncRoles([$presidente,$secretario,$tesorero,$admin]);
        Permission::create(['name'=>'Editar-catalogo-gastos'])->syncRoles([$presidente,$secretario,$tesorero,$admin]);
        Permission::create(['name'=>'Eliminar-catalogo-gastos'])->syncRoles([$presidente,$secretario,$tesorero,$admin]);

        Permission::create(['name'=>'Ver-gastos'])->syncRoles([$presidente,$secretario,$tesorero,$admin]);
        Permission::create(['name'=>'Crear-gastos'])->syncRoles([$tesorero,$admin]);
        Permission::create(['name'=>'Editar-gastos'])->syncRoles([$tesorero,$admin]);
        Permission::create(['name'=>'Eliminar-gastos'])->syncRoles([$tesorero,$admin]);

        Permission::create(['name'=>'Ver-residentes'])->syncRoles([$presidente,$secretario,$tesorero,$admin]);
        Permission::create(['name'=>'Crear-residentes'])->syncRoles([$presidente,$secretario,$tesorero,$admin]);
        Permission::create(['name'=>'Editar-residentes'])->syncRoles([$presidente,$secretario,$tesorero,$admin]);
        Permission::create(['name'=>'Eliminar-residentes'])->syncRoles([$presidente,$secretario,$tesorero,$admin]);

        Permission::create(['name'=>'Ver-predios'])->syncRoles([$presidente,$secretario,$tesorero,$admin]);
        Permission::create(['name'=>'Crear-predios'])->syncRoles([$presidente,$secretario,$tesorero],$admin);
        Permission::create(['name'=>'Editar-predios'])->syncRoles([$presidente,$secretario,$tesorero,$admin]);
        Permission::create(['name'=>'Eliminar-predios'])->syncRoles([$presidente,$secretario,$tesorero]);

        Permission::create(['name'=>'Ver-pagos'])->syncRoles([$presidente,$secretario,$tesorero,$admin]);
        Permission::create(['name'=>'Crear-pagos'])->syncRoles([$tesorero,$admin]);
        Permission::create(['name'=>'Eliminar-pagos'])->syncRoles([$tesorero,$admin]);

        Permission::create(['name'=>'Reportes'])->syncRoles([$presidente,$secretario,$tesorero,$admin]);
        Permission::create(['name'=>'Ver-estado-cuenta'])->syncRoles([$presidente,$secretario,$tesorero,$residente,$admin]);
    }
}
