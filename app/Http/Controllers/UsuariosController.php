<?php

namespace App\Http\Controllers;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Arr;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use spatie\Permission\Models\Permission;
use Barryvdh\DomPDF\Facade\PDF;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;


class UsuariosController extends Controller
{
    function __construct()
    {
        $this->middleware('permission:ver-usuario|crear-usuario|editar-usuario|borrar-usuario',['only'=>['index']]);
        $this->middleware('permission:crear-usuario',['only'=>['create','store']]);
        $this->middleware('permission:editar-usuario',['only'=>['edit','update']]);
        $this->middleware('permission:borrar-usuario',['only'=>['destroy']]);
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
       $usuarios=User::paginate(5);
       $permisos = Permission::pluck('name','id');
        return view('usuarios.index',compact('usuarios','permisos'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        $roles = Role::pluck('name','name')->all();
        return view('usuarios.crear',compact('roles'));
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
            'name'=>'required',
            'email'=>'required | email | unique:users,email',
            'password'=>'required | same:confirm-password',
            'roles'=>'required|min:1'
        ]);
        $input = $request->all();
        $input['password'] = Hash::make($input['password']);
        $user = User::create($input);
        $user->assignRole($request->input('roles'));
        return redirect()->route('usuarios.index')->with('user_added','El usuario ha sido creado con éxito');
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
        $user = User::find($id);
        $roles = Role::pluck('name','id');  
        return view('usuarios.editar',compact('user','roles'));
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
            'name'=>'required',
            'email'=>'required | email | unique:users,email,'.$id,
            'password'=>'same:confirm-password',
            'roles'=>'required|min:1'
        ]);
        $input = $request->all();
        if(!empty($input['password'])){
            $input['password'] = Hash::make($input['password']);
        }else{
            $input = Arr::except($input,array('password'));
        }
        $user = User::find($id);
        $user->update($input);
        DB::table('model_has_roles')->where('model_id',$id)->delete();
        $user->assignRole($request->input('roles'));
        return redirect()->route('usuarios.index')->with('user_edited','El usuario ha sido editado con éxito');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        User::find($id)->delete();
        return redirect()->route('usuarios.index')->with('user_deleted','El registro ha sido eliminado con éxito');
    }               
    public function pdfUserListado(){
        $usuarios= User::all();
        $pdf= PDF::loadView('usuarios.usersPDF',compact('usuarios'));
        return $pdf->download('usuarios.pdf'); 

    }
    public function invoice(){
        $user= User::where('id','4') -> first();
        $pdf= PDF::loadView('usuarios.invoice',compact('user'));
        return $pdf->download('invoice.pdf'); 
    }
}
