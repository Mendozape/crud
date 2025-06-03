<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Fee;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException; // Import ValidationException
use Illuminate\Database\Eloquent\ModelNotFoundException;
class FeeController extends Controller
{
    public function index()
    {
        $fees = Fee::all();
        return response()->json($fees);
    }

    public function store(Request $request)
    {
        try {
            $input = $request->all();
            $resident = Fee::create($input);
            return response()->json([
                'success' => true,
                'message' => 'Fee created successfully',
                'data' => $resident
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create fee',
                'error' => $e->getMessage()
            ], 500);
        }

    }

    public function show($id)
    {
        $fee = Fee::findOrFail($id);
        return response()->json($fee);
    }

    public function update(Request $request, Fee $fee)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'amount' => 'required|numeric',
                'description' => 'required|string|max:255',
            ]);
            $fee->name = $request->name;
            $fee->amount = $request->amount;
            $fee->description = $request->description;
            $fee->save();
            return response()->json([
                'success' => true,
                'message' => 'Resident updated successfully',
                'data' => $fee
            ], 200);

        } catch (ValidationException $e) {
            // Validation errors
            return response()->json([
                'success' => false,
                'message' => 'Validation Error',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // Other exceptions
            return response()->json([
                'success' => false,
                'message' => 'Failed to update fee',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $fee = Fee::findOrFail($id);
            // Delete the resident's image from storage
            $fee->delete();
            return response()->json(['message' => 'Fee deleted successfully.'], 200);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Fee not found.'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete fee.'], 500);
        }
    }
    public function redire2()
    {
        return view('fees.index');
    }
}
