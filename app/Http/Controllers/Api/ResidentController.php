<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use Illuminate\Http\Request;

class ResidentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $Residents = Resident::all();
        return $Residents;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $resident = new Resident();
        $resident->photo = $request->photo;
        $resident->name = $request->name;
        $resident->last_name = $request->last_name;
        $resident->email = $request->email;
        $resident->street = $request->street;
        $resident->street_number = $request->street_number;
        $resident->community = $request->community;
        $resident->comments = $request->comments;
        $resident->save();

    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $resident = Resident::find($id);
        return $resident;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $resident = Resident::findOrFail($request->id);
        $resident->name = $request->name;
        $resident->last_name = $request->last_name;
        $resident->email = $request->email;
        $resident->street = $request->street;
        $resident->street_number = $request->street_number;
        $resident->community = $request->community;
        $resident->comments = $request->comments;
        $resident->save();
        return $resident;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //testing
        $resident = Resident::destroy($id);
        return $resident;
    }
}
