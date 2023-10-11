<?php
namespace App\Http\Controllers;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Carbon\Carbon;
use App\Events\EmployeesUpdated;
use App\Events\StatusLiked;

class ClientController extends Controller
{
    function __construct()
    {
        $this->middleware('permission:crear-cliente|editar-cliente|borrar-cliente|bienvenida-cliente')->only('index');
        $this->middleware('permission:crear-cliente',['only'=>['create','store']]);
        $this->middleware('permission:editar-cliente',['only'=>['edit','update']]);
        $this->middleware('permission:borrar-cliente',['only'=>['destroy']]);
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
       //$client=Client::paginate(5);
       $client=Client::all();
       //$permisos = Permission::pluck('name','id');
       //$client->fragment('Registros')->SetPageName('Pagina')->withQueryString();
       return view('client.index')->with('clientes',$client);
       //return view('client.index',compact('client','permisos'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return view('client.form');
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
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'name'=>'required|max:40',
            'due'=>'required|numeric|gte:1'
        ]);
        $input=$request->all();
        if($request->hasFile('image')){
            $imageName= Carbon::now()->timestamp.'.'.$request->image->extension();
            $request->image->storeAs('/public/images', $imageName);
            $input['image']=$imageName;
        }
        $clien= Client::create($input);
        $NumNoti=auth()->user()->unreadNotifications->count();
        $unread=auth()->user()->unreadNotifications;
        //$imageName=$request->name;
        //dd($NumNoti);
        //session::flash('user_added','El registro ha sido creado con éxito');
        //event(new EmployeesUpdated($clien));
        event(new EmployeesUpdated($clien,$NumNoti,$unread));
        return redirect()->route('client.index')->with('user_added','El registro ha sido creado con éxito');
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Client  $client
     * @return \Illuminate\Http\Response
     */
    public function show(Client $client)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Client  $client
     * @return \Illuminate\Http\Response
     */
    public function edit(Client $client)
    {
        return view('client.form')->with('client',$client);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Client  $client
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Client $client)
    {
        $request->validate([
            'image' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'due'=>'required|numeric|gte:1'
        ]);
        $client->name    = $request['name'];
        $client->due     = $request['due'];
        $client->comments= $request['comments'];
        if($request->hasFile('image')){
            $image= $request->file('image');
            $image_name = $image->getClientOriginalName();
            $request->image->move(public_path('images'), $image_name);
            $client->image=$image_name;
        }
        $client->save();
        Session::flash('user_edited','El registro ha sido editado con éxito');
        //return redirect()->route('client.index')->with('user_edited','El registro ha sido editado con éxito');
        
        return redirect()->route('client.index');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Client  $client
     * @return \Illuminate\Http\Response
     */
    public function destroy(Client $client)
    {
        $client->delete();
        //Session::flash('user_deleted','El registro ha sido eliminado con éxito');
        return redirect()->route('client.index')->with('user_deleted','El registro ha sido eliminado con éxito');;
    }
    public function welcome()
    {
        return view('client.welcome');
    }
}
