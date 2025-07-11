<?php

namespace App\Http\Controllers;

use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Arr;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Spatie\Permission\Models\Permission;
use Barryvdh\DomPDF\Facade\PDF;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification; // Import Notification facade
use App\Notifications\DataBase;               // Your custom notification class
use App\Events\UserRegistered;                // Import your event class

class UsuariosController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:ver-usuario|crear-usuario|editar-usuario|borrar-usuario',['only'=>['index']]);
        $this->middleware('permission:crear-usuario',['only'=>['create','store']]);
        $this->middleware('permission:editar-usuario',['only'=>['edit','update']]);
        $this->middleware('permission:borrar-usuario',['only'=>['destroy']]);
    }

    public function index()
    {
       $usuarios = User::paginate(5);
       $permisos = Permission::pluck('name','id');
       return view('usuarios.index', compact('usuarios', 'permisos'));
    }

    public function create()
    {
        $roles = Role::pluck('name','name')->all();
        return view('usuarios.crear', compact('roles'));
    }

    public function store(Request $request)
    {
        $request->validate([ // 1. Validate input
            'name' => 'required',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|same:confirm-password',
            'roles' => 'required|min:1'
        ]);

        $input = $request->all(); // 2. Prepare data
        $input['password'] = Hash::make($input['password']); // 3. Hash password
        $user = User::create($input); // 4. Create user
        $user->assignRole($request->input('roles')); // 5. Assign roles

        $admins = User::role('Admin')->get(); // 6. Get admins
        Notification::send($admins, new DataBase($user)); // 7. Notify admins

        event(new UserRegistered($user)); // 8. Dispatch broadcast event

        return redirect()->route('usuarios.index') // 9. Redirect with message
            ->with('user_added', 'El usuario ha sido creado con éxito');
    }

    public function show($id)
    {
        //
    }

    public function edit($id)
    {
        $user = User::find($id);
        $roles = Role::pluck('name','id');
        return view('usuarios.editar', compact('user', 'roles'));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name'=>'required',
            'email'=>'required|email|unique:users,email,'.$id,
            'password'=>'same:confirm-password',
            'roles'=>'required|min:1'
        ]);
        $input = $request->all();
        if (!empty($input['password'])) {
            $input['password'] = Hash::make($input['password']);
        } else {
            $input = Arr::except($input, ['password']);
        }
        $user = User::find($id);
        $user->update($input);
        DB::table('model_has_roles')->where('model_id', $id)->delete();
        $user->assignRole($request->input('roles'));
        return redirect()->route('usuarios.index')->with('user_edited','El usuario ha sido editado con éxito');
    }

    public function destroy($id)
    {
        User::find($id)->delete();
        return redirect()->route('usuarios.index')->with('user_deleted','El registro ha sido eliminado con éxito');
    }

    public function pdfUserListado()
    {
        $usuarios = User::all();
        $pdf = PDF::loadView('usuarios.usersPDF', compact('usuarios'));
        return $pdf->download('usuarios.pdf');
    }

    public function invoice()
    {
        $user = User::where('id', 4)->first();
        $pdf = PDF::loadView('usuarios.invoice', compact('user'));
        return $pdf->download('invoice.pdf');
    }
}