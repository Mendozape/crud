<?php
namespace App\Http\Controllers;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

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
       $client=Client::paginate(5);
//$client->fragment('Registros')->SetPageName('Pagina')->withQueryString();
        return view('client.index')
        ->with('clientes',$client);
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
            'name'=>'required|max:40',
            'due'=>'required|numeric|gte:1'
        ]);
        $input=$request->all();
        if($request->hasFile('image')){
            $destination_path = 'public/images/products';
            $image= $request->file('image');
            $image_name = $image->getClientOriginalName();
            $path=$request->file('image')->storeAs($destination_path,$image_name);
            $input['image']=$image_name;
        }
        
        //$clien= Client::create($request->only('name','due','comments','image'));
        $clien= Client::create($input);
        //session::flash('user_added','El registro ha sido creado con éxito');
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
        return view('client.form')
                    ->with('client',$client);
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
            'name'=>'required|max:40',
            'due'=>'required|numeric|gte:1'
        ]);
        $client->name    = $request['name'];
        $client->due     = $request['due'];
        $client->comments= $request['comments'];
        $client->save();
        //Session::flash('user_edited','El registro ha sido editado con éxito');
        return redirect()->route('client.index')->with('user_edited','El registro ha sido editado con éxito');
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
