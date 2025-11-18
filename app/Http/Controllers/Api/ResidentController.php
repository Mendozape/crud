<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException; 
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage; 

class ResidentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Eager load the address catalog relationship for efficiency
        $Residents = Resident::with('addressCatalog')->get();
        return $Residents;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // --- ADJUSTED VALIDATION FOR NORMALIZED FIELDS ---
            $request->validate([
                'name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|email|unique:residents,email|max:255',
                
                // NEW: Validate the existence of the address ID in the catalog table
                'address_catalog_id' => 'required|exists:addresses,id', 
                
                // OLD fields removed: 'street', 'street_number', 'community'
                'comments' => 'nullable|string|max:255', 
                'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);
            // ----------------------------------------------------

            $input = $request->all();
            
            // Handle the photo upload
            if ($request->hasFile('photo')) {
                // Store photo and get filename
                $photo = Carbon::now()->timestamp.'.'.$request->photo->extension();
                $request->photo->storeAs('/public/images', $photo);
                $input['photo'] = $photo;
            } else {
                // If no photo is uploaded, set photo to null
                $input['photo'] = null;
            }
            
            // Create resident with normalized fields
            $resident = Resident::create([
                'photo' => $input['photo'],
                'name' => $input['name'],
                'last_name' => $input['last_name'],
                'email' => $input['email'],
                'address_catalog_id' => $input['address_catalog_id'], // NEW FIELD
                'comments' => $input['comments'] ?? null, // Renamed field is now just 'comments'
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Residente creado exitosamente', // Resident created successfully
                'data' => $resident
            ], 201);
        } catch (ValidationException $e) {
             return response()->json([
                'success' => false,
                'message' => 'Error de Validación',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fallo al crear residente', 
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Eager load the address catalog relationship
        $resident = Resident::with('addressCatalog')->find($id); 
        return $resident;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Resident $resident)
    {
        try {
            // --- ADJUSTED VALIDATION FOR NORMALIZED FIELDS ---
            $request->validate([
                'name' => 'bail|required|string|max:255',
                'last_name' => 'bail|required|string|max:255',
                'email' => 'bail|required|email|max:255|unique:residents,email,' . $resident->id,
                
                // NEW: Validate the address ID
                'address_catalog_id' => 'required|exists:addresses,id', 
                
                // OLD fields removed: 'street', 'street_number', 'community'
                'comments' => 'nullable|string|max:255',
                'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);
            // ----------------------------------------------------

            // If this is only a validation request, return success here without saving
            if ($request->header('X-Validate-Only') === 'true') {
                return response()->json([
                    'success' => true,
                    'message' => 'Validation passed (no update performed)'
                ], 200);
            }

            // Handle photo upload
            if ($request->hasFile('photo')) {
                if ($resident->photo) {
                    Storage::delete('public/images/' . $resident->photo);
                }
                $photo = Carbon::now()->timestamp . '.' . $request->file('photo')->extension();
                $request->file('photo')->storeAs('/public/images', $photo);
                $resident->photo = $photo;
            }

            // Update resident info
            $resident->name = $request->name;
            $resident->last_name = $request->last_name;
            $resident->email = $request->email;
            
            // ADJUSTED: Update the FK
            $resident->address_catalog_id = $request->address_catalog_id; 
            
            $resident->comments = $request->comments;
            $resident->save();

            return response()->json([
                'success' => true,
                'message' => 'Residente actualizado exitosamente', // Resident updated successfully
                'data' => $resident
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de Validación', 
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fallo al actualizar residente', 
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

            // CRITICAL CHECK: Count if the resident has any associated payments.
            if ($resident->residentPayments()->count() > 0) { 
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el residente porque tiene pagos registrados.' 
                ], 409); // 409 Conflict: Indicates related resource conflict.
            }
            
            // Delete the resident's image from storage 
            if ($resident->photo) {
                Storage::delete('public/images/' . $resident->photo);
            }
            
            $resident->delete();
            return response()->json(['message' => 'Residente eliminado con éxito.'], 200); 
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Residente no encontrado.'], 404); 
        } catch (\Exception $e) {
            return response()->json(['message' => 'Fallo al eliminar el residente.'], 500); 
        }
    }

    public function redire()
    {
        return view('residents.index ');
    }
}