<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use LengthException;
use LogicException;

class FileController extends Controller
{
    /*public function getUrl(string $path){
        //return Storage::temporaryUrl($path, now()->addMinutes(5));
        return Storage::disk('local')->download($path);;
        
    }*/
 
    public function download(Request $request){
        //abort_if(!$request->hasValidSignature(),404);
        //return Storage::download($request->query('path'));
        //$disk = Storage::disk('local');
        //return Storage::temporaryUrl($path, now()->addMinutes(5));
        Storage::download($request);
        //$disk = Storage::disk('releases-local');
        return Storage::temporaryUrl($request, now()->addMinutes(5));

    }

}
