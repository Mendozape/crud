<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\ImportUser;
use App\Exports\ExportUser;
use App\Models\User;
use App\Models\Client;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
//use Illuminate\Support\Facades\Notification;
use Illuminate\Notifications\Notification;


class UserController extends Controller
{
    /*function __construct()
    {
        $this->middleware('permission:ver-usuario|crear-usuario|editar-usuario|borrar-usuario',['only'=>['importView','import','exportUsers']]);
    }*/
    public function __construct()
    {
        $this->middleware('auth');
    }


    public function count()
    {
        $userCount = User::count();
        $clientCount = Client::count();
        $roleCount = Role::count();
        return response()->json(['userCount' => $userCount,
                                 'clientCount' => $clientCount,
                                 'roleCount' => $roleCount,
                                ]);
    }
    public function isAdmin()
    {
        //$admin = Auth()->user()->isAdmin;
        //Auth::user()->isAdmin()
        //$admin = (Auth()->user()->isAdmin) ? 'Yes' : 'No';
        $admin = auth()->user()->unreadNotifications;
        //$noti = auth()->user()->unreadNotifications->where('id',$id);
        /*$data = [
            'notifications'  => $notifications
        ];*/

        //$admin = Auth()->user()->unreadNotifications;
        return response()->json([
            'admin' => $admin
        ]);
    }
    public function notis ($id) {
        $noti = auth()->user()->unreadNotifications->where('id',$id);
        //dd($noti);
        return response()->json(['noti' => $noti]);
    }

    public function importView(Request $request){
        return view('excel.importFile');
    }

    public function import(Request $request){
        $request->validate([
            'file' => 'required|file |mimes:xlsx,csv|max:2048'
        ]);
        Excel::import(new ImportUser, $request->file('file')->store('files'));
        return redirect()->back()->with('users_added','The users have been added');
    }

    public function exportUsers(Request $request){
        return Excel::download(new ExportUser, 'users.xlsx');
    }
}
