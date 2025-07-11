<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SpaController extends Controller
{
    // Always return the same view
    public function index()
    {
        return view('app');
    }
}