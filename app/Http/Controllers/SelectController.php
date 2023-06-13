<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\User;
use GuzzleHttp\Psr7\Response;
use Spatie\Permission\Models\Role;
use spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;

class SelectController extends Controller
{
    function __construct()
    {
        $this->middleware('permission:ver-select',['only'=>['index','create','store','edit','update','destroy']]);
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(){
        $roles = Role::pluck('name','id')->all(); 
        return view('select.index')->with('roles',$roles);
        //return 'asdad';
        //$ab='adsa';
        //return response()->json($ab);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
      $a='it works2';
      return response()->json($a);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
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
        //header('Content-type: application/json; charset=utf-8');
        $roleName = DB::table('roles')->where('roles.id',$id)
        ->pluck('name')
        ->all();
        $role = Role::findByName($roleName[0]);
        $jsondata = array(
            "permissions"            => $role->permissions->pluck('name'),
        );
        return response()->json($jsondata);
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
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
