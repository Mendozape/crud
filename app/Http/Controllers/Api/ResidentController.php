<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;

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
        
        $validatedData = $request->validate([
            'photo' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:residents,email',
            'street' => 'required|string|max:255',
            'street_number' => 'required|string|max:10',
            'community' => 'required|string|max:255',
            'comments' => 'nullable|string|max:1000',
        ]);
    
        $resident = Resident::create($validatedData);
    
        return response()->json(['message' => 'Resident created successfully', 'resident' => $resident], 201);
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
        try {
            $resident = Resident::findOrFail($id);
            $resident->photo = $request->photo;
            $resident->name = $request->name;
            $resident->last_name = $request->last_name;
            $resident->email = $request->email;
            $resident->street = $request->street;
            $resident->street_number = $request->street_number;
            $resident->community = $request->community;
            $resident->comments = $request->comments;
            $resident->save();
            return response()->json([
                'success' => true,
                'message' => 'Resident updated successfully',
                'data' => $resident
            ], 200);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update resident',
                    'error' => $e->getMessage()
                ], 500);
            }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $resident = Resident::findOrFail($id);
            $resident->delete();
            return response()->json(['message' => 'Resident deleted successfully.'], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Resident not found.'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete resident.'], 500);
        }
    }

    public function redire()
    {
        //return redirect('http://localhost:8000/frontend/src/components/index.blade.php');
        //return view('../../../frontend/src/index');
        return view('residents.index ');
        //$Residents = Resident::all();
        //return view('residents.index')->with('data',$Residents);
        //return redirect()->away(env('/frontend/src/components/index.blade.php'));
        //return redirect('http://localhost:8000/frontend/src/components/index');
    }
}
