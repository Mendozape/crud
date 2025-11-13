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
                // Store photo and get filename
                $photo = Carbon::now()->timestamp.'.'.$request->photo->extension();
                $request->photo->storeAs('/public/images', $photo);
                $input['photo'] = $photo;
            }
            $resident = Resident::create($input);
            return response()->json([
                'success' => true,
                'message' => 'Residente creado exitosamente', // Resident created successfully
                'data' => $resident
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fallo al crear residente', // Failed to create resident
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
                'message' => 'Residente actualizado exitosamente', // Resident updated successfully
                'data' => $resident
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de Validación', // Validation Error
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Fallo al actualizar residente', // Failed to update resident
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
                // If payments are found, forbid deletion to maintain transactional history.
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el residente porque tiene pagos registrados.' // Cannot delete resident because they have registered payments.
                ], 409); // 409 Conflict: Indicates related resource conflict.
            }
            
            // Delete the resident's image from storage (using Storage facade is safer)
            if ($resident->photo) {
                // Assuming photo is stored in storage/app/public/images
                Storage::delete('public/images/' . $resident->photo);
            }
            
            $resident->delete();
            return response()->json(['message' => 'Residente eliminado con éxito.'], 200); // Resident deleted successfully.
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Residente no encontrado.'], 404); // Resident not found.
        } catch (\Exception $e) {
            return response()->json(['message' => 'Fallo al eliminar el residente.'], 500); // Failed to delete resident.
        }
    }

    public function redire()
    {
        return view('residents.index ');
    }
}