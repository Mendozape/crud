<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use \Exception;

class ResidentController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:Ver-residentes', ['only' => ['index', 'show']]);
        $this->middleware('permission:Crear-residentes', ['only' => ['store']]);
        $this->middleware('permission:Editar-residentes', ['only' => ['update']]);
        $this->middleware('permission:Eliminar-residentes', ['only' => ['destroy']]);
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Eager load the addresses relationship
        $Residents = Resident::with('addresses')->get();
        return $Residents;
    }

    public function searchResidents(Request $request)
    {
        $search = $request->get('search', ''); 

        if (!$search) {
            return response()->json(['success' => true, 'data' => []]);
        }

        // EAGER LOAD the 'addresses' relationship (hasMany)
        $residents = Resident::with('addresses') 
            ->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%");
            })
            ->limit(10)
            ->get(); 

        return response()->json([
            'success' => true,
            'data' => $residents
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // Base validation for non-file fields
            $rules = [
                'name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'email' => 'required|email|unique:residents,email|max:255', // Unique validation
                'comments' => 'nullable|string|max:255',
                'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ];
            
            // Custom messages to translate specific errors (like email.unique)
            $messages = [
                'email.unique' => 'El correo electrónico ya se encuentra registrado.',
            ];

            // Validate with custom messages
            $request->validate($rules, $messages);

            $input = $request->all();
            $photoFileName = null;

            // Handle the photo upload
            if ($request->hasFile('photo')) {
                // Store photo and get filename
                $photoFileName = Carbon::now()->timestamp . '.' . $request->photo->extension();
                $request->photo->storeAs('/public/images', $photoFileName);
            } 

            // Create resident with clean fields (no address FK)
            $resident = Resident::create([
                'photo' => $photoFileName, // Use the generated filename or null
                'name' => $input['name'],
                'last_name' => $input['last_name'],
                'email' => $input['email'],
                'comments' => $input['comments'] ?? null, 
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Residente creado exitosamente', // Resident created successfully
                'data' => $resident
            ], 201);
        } catch (ValidationException $e) {
            // If ValidationException occurs, return the errors object
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
        // Eager load the addresses relationship
        $resident = Resident::with('addresses')->find($id);
        return $resident;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Resident $resident)
    {
        try {
            // BASE VALIDATION RULES (Photo rule excluded here)
            $rules = [
                'name' => 'bail|required|string|max:255',
                'last_name' => 'bail|required|string|max:255',
                'email' => 'bail|required|email|max:255|unique:residents,email,' . $resident->id,
                'comments' => 'nullable|string|max:255',
            ];
            
            // Custom messages for update validation
            $messages = [
                'email.unique' => 'El correo electrónico ya se encuentra registrado.',
            ];

            // CRITICAL FIX: Conditionally add the 'photo' rule ONLY if a file is actually present.
            // This prevents validation failure when the 'photo' field is omitted or contains the 'DELETE' string.
            if ($request->hasFile('photo')) {
                $rules['photo'] = 'image|mimes:jpeg,png,jpg,gif|max:2048';
            }

            // Validate the request
            $request->validate($rules, $messages);

            // Handle photo upload and deletion
            if ($request->hasFile('photo')) {
                // CASE A: NEW FILE UPLOADED.
                // Delete old photo and save new one
                if ($resident->photo) {
                    Storage::delete('public/images/' . $resident->photo);
                }
                $photo = Carbon::now()->timestamp . '.' . $request->file('photo')->extension();
                $request->file('photo')->storeAs('/public/images', $photo);
                $resident->photo = $photo; // Update the resident model field
            } else if ($request->input('photo') === 'DELETE') {
                // CASE B: PHOTO DELETED BY USER ('DELETE' flag sent from frontend)
                if ($resident->photo) {
                    Storage::delete('public/images/' . $resident->photo);
                }
                $resident->photo = null; // Set field to null in the database
            } 
            // CASE C: If the 'photo' key is not present, the existing photo remains untouched.

            // Update resident info
            $resident->name = $request->name;
            $resident->last_name = $request->last_name;
            $resident->email = $request->email;
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
    // En ResidentController.php, método destroy

    public function destroy(string $id)
    {
        try {
            // Find the resident, throws ModelNotFoundException if not found
            $resident = Resident::findOrFail($id);

            // ⭐ CRITICAL CHECK 1: Resident Addresses (The primary block condition)
            // Block deletion if the resident is assigned to any active address record.
            if ($resident->addresses()->count() > 0) { 
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar el residente porque tiene direcciones  asignadas.' 
                ], 409); // 409 Conflict
            }

            // --- NOTE: Verification for residentPayments has been REMOVED as per instruction. ---
            
            // Check if the resident has a photo and attempt to delete it
            if ($resident->photo) {
                // We wrap the storage deletion in a nested try-catch block 
                // to give a specific error if file deletion fails.
                try {
                    // Delete the resident's image from storage 
                    if (Storage::exists('public/images/' . $resident->photo)) {
                        Storage::delete('public/images/' . $resident->photo);
                    }
                } catch (\Exception $e) {
                    // Catch file deletion error specifically
                    return response()->json([
                        'message' => 'Fallo al eliminar la foto del residente. Intente de nuevo más tarde.'
                    ], 500); 
                }
            }

            // Delete the resident record (Soft Delete)
            $resident->delete();
            
            // Success response
            return response()->json(['message' => 'Residente eliminado con éxito.'], 200);

        } catch (ModelNotFoundException $e) {
            // Catches error if ID does not exist
            return response()->json(['message' => 'Residente no encontrado.'], 404);
        } catch (\Exception $e) {
            // Fallback for any other unexpected error
            // Log the error for internal review: Log::error($e->getMessage());
            return response()->json(['message' => 'Fallo al eliminar el residente por un error inesperado.'], 500);
        }
    }

    public function redire()
    {
        return view('residents.index ');
    }
}