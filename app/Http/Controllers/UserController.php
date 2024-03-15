<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\ImportUser;
use App\Exports\ExportUser;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;


class UserController extends Controller
{
    function __construct()
    {
        $this->middleware('permission:ver-usuario|crear-usuario|editar-usuario|borrar-usuario',['only'=>['importView','import','exportUsers']]);
    }

    public function count()
    {
        $userCount = User::count();
        return response()->json(['count' => $userCount]);
    }
    public function isAdmin()
    {
        $admin = auth()->user();
        return response()->json(['admin' => $admin]);
    }
    

    public function importView(Request $request){
        return view('excel.importFile');
    }

    public function import(Request $request){
        $request->validate([
            'file' => 'required|file |mimes:xlsx,csv|max:2048'
        ]);
        Excel::import(new ImportUser, $request->file('file')->store('files'));
        return redirect()->back()->with('users_added','The users have been added');;
    }

    public function exportUsers(Request $request){
        return Excel::download(new ExportUser, 'users.xlsx');
    }
}
