<?php
namespace App\Http\Controllers;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Carbon\Carbon;
use App\Events\EmployeesUpdated;


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
        $client=Client::all();
        /*$data = [
        'client'   => $client
        ];*/
        //$this->create($data);
        /*$notifications = auth()->user()->unreadNotifications;
       $client=Client::all();
       $data = [
        'notifications'  => $notifications,
        'client'   => $client
       ];*/
       return view('client.index')->with('data',$client);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //dd($x);
        //return view('client.form')->with('data',$data);
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
        $NumNoti=auth()->user()->unreadNotifications->count()+1;
        $notifications=auth()->user()->unreadNotifications;

        $unread='';
        
        foreach($notifications as $notification){
            $unread.='<div class="card bg-light text-white p-2 text-center">'.$notification->created_at.' User '.$notification->data['name'].' has just registered.</div>';
            
            /*$unread2.='<a href=\"route(\"NotiUpdate\",$notification->id)\" class=\"float-right mark-as-read\" data-id=\"'.$notification->id.'\">Mark as read</a><br>';
            $refer=intval($unread2);
            $unread.=$unread2;*/
        }
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
