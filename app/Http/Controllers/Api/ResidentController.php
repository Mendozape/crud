<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException; // Import ValidationException
use Carbon\Carbon;
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
        try {
            $input = $request->all();
            // Handle the photo upload
            if ($request->hasFile('photo')) {
                $request->validate([
                    'photo' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
                ]);
                $photo= Carbon::now()->timestamp.'.'.$request->photo->extension();
                $request->photo->storeAs('/public/images', $photo);
                $input['photo'] = $photo;
            }
            $resident = Resident::create($input);
            return response()->json([
                'success' => true,
                'message' => 'Resident created successfully',
                'data' => $resident
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create resident',
                'error' => $e->getMessage()
            ], 500);
        }
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
    public function update(Request $request, Resident $resident)
{
    try {
        // Validate fields
        $request->validate([
            'name' => 'bail|required|string|max:255',
            'last_name' => 'bail|required|string|max:255',
            'email' => 'bail|required|email|max:255',
            'street' => 'bail|required|string|max:255',
            'street_number' => 'bail|required|string|max:255',
            'community' => 'bail|required|string|max:255',
            'comments' => 'nullable|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // If this is only a validation request, return success here without saving
        if ($request->header('X-Validate-Only') === 'true') {
            return response()->json([
                'success' => true,
                'message' => 'Validation passed (no update performed)'
            ], 200);
        }

        // Handle photo upload
        if ($request->hasFile('photo')) {
            $photo = Carbon::now()->timestamp . '.' . $request->file('photo')->extension();
            $request->file('photo')->storeAs('/public/images', $photo);
            $resident->photo = $photo;
        }

        // Update resident info
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

    } catch (ValidationException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Validation Error',
            'errors' => $e->errors(),
        ], 422);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to update resident',
            'error' => $e->getMessage(),
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
            // Delete the resident's image from storage
            if ($resident->photo) {
                $imagePath = storage_path('app/public/images/' . $resident->photo);
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
            }
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
        return view('residents.index ');
    }
}
