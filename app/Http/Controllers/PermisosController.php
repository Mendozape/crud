<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
//agregamos
use spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;
class PermisosController extends Controller
{
    function __construct()
    {
        $this->middleware('permission:ver-permiso|crear-permiso|editar-permiso|borrar-permiso',['only'=>['index']]);
        $this->middleware('permission:crear-permiso',['only'=>['create','store']]);
        $this->middleware('permission:editar-permiso',['only'=>['edit','update']]);
        $this->middleware('permission:borrar-permiso',['only'=>['destroy']]);
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $permisos=Permission::paginate(10);
        return view('permisos.index',compact('permisos'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $permission = Permission::get();
        return view('permisos.crear',compact('permission'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'=>'required'
        ]);
        //$input=$request->all(); 
        $permiso= Permission::create(['name'=>$request->input('name')]);
        //$permiso->syncPermissions($request->input('permission'));
        return redirect()->route('permisos.index')->with('permiso_added','El permiso ha sido creado con éxito');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $permiso = Permission::find($id);
        $permissions = Permission::get();
        //$rolePermission = DB::table('role_has_permissions')->where('role_has_permissions.role_id',$id)
          //  ->pluck('role_has_permissions.permission_id','role_has_permissions.permission_id')
           // ->all();
            return view('permisos.editar',compact('permiso','permissions'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name'=>'required'
        ]);
        $permiso = Permission::find($id);
        $permiso->name = $request->input('name');
        $permiso->save();
        //$permiso->syncPermissions($request->input('permission'));
        return redirect()->route('permisos.index')->with('permiso_edited','El permiso ha sido actualizado con éxito');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        DB::table('permissions')->where('id',$id)->delete();
        return redirect()->route('permisos.index')->with('permiso_deleted','El permiso ha sido eliminado con éxito');
    }
}
