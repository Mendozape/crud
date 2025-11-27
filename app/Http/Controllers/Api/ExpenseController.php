<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class ExpenseController extends Controller
{
    /**
     * Display a listing of the resource.
     * Returns JSON of all expenses for the authenticated user.
     */
    public function index()
    {
        $expenses = Auth::user()->expenses()->withTrashed()->orderBy('expense_date', 'desc')->get();

        // Return the collection of expenses as a JSON response.
        return response()->json([
            'message' => 'Lista de gastos recuperada exitosamente.', // USER-FACING SPANISH TEXT
            'data' => $expenses
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     * Returns the created expense as JSON.
     */
    public function store(Request $request)
    {
        try {
            // Validate the incoming request data.
            $validatedData = $request->validate([
                'name' => 'required|string|max:100',
                'amount' => 'required|numeric|min:0.01',
                'expense_date' => 'required|date',
            ]);

            // Create the expense and associate it with the authenticated user.
            $expense = Auth::user()->expenses()->create($validatedData);

            // Return the created expense with a 201 Created status.
            return response()->json([
                'message' => 'Gasto creado exitosamente.', // USER-FACING SPANISH TEXT
                'data' => $expense
            ], 201);
            
        } catch (ValidationException $e) {
            // Return validation errors with a 422 Unprocessable Entity status.
            return response()->json([
                'message' => 'Error de validación.', // USER-FACING SPANISH TEXT
                'errors' => $e->errors()
            ], 422);
        }
    }

    /**
     * Display the specified resource.
     * Returns the specific expense as JSON.
     */
    public function show(Expense $expense)
    {
        // Policy check: Ensure the authenticated user owns the expense.
        if (Auth::id() !== $expense->user_id) {
            // USER-FACING SPANISH TEXT: 'Acceso no autorizado.'
            return response()->json([
                'message' => 'Acceso no autorizado. El gasto no pertenece al usuario.'
            ], 403); 
        }

        // Return the specific expense as a JSON response.
        return response()->json([
            'message' => 'Detalles del gasto recuperados exitosamente.', // USER-FACING SPANISH TEXT
            'data' => $expense
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     * Returns the updated expense as JSON.
     */
    public function update(Request $request, Expense $expense)
    {
        // Policy check: Ensure the authenticated user owns the expense.
        if (Auth::id() !== $expense->user_id) {
            // USER-FACING SPANISH TEXT: 'Acceso no autorizado.'
            return response()->json([
                'message' => 'Acceso no autorizado. El gasto no pertenece al usuario.'
            ], 403); 
        }

        try {
            // Validate the request data.
            $validatedData = $request->validate([
                'name' => 'required|string|max:100',
                'amount' => 'required|numeric|min:0.01',
                'expense_date' => 'required|date',
            ]);

            $expense->update($validatedData);

            // Return the updated expense as a JSON response.
            return response()->json([
                'message' => 'Gasto actualizado exitosamente.', // USER-FACING SPANISH TEXT
                'data' => $expense
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación.', // USER-FACING SPANISH TEXT
                'errors' => $e->errors()
            ], 422);
        }
    }

    /**
     * Remove the specified resource from storage (Soft Delete).
     * Returns a 204 No Content status on success.
     */
    public function destroy(Expense $expense)
    {
        // Policy check: Ensure the authenticated user owns the expense.
        if (Auth::id() !== $expense->user_id) {
            // USER-FACING SPANISH TEXT: 'Acceso no autorizado.'
            return response()->json([
                'message' => 'Acceso no autorizado. El gasto no pertenece al usuario.'
            ], 403); 
        }
        
        $expense->delete(); // This performs the soft delete.

        // Return a 204 No Content status, which is standard for successful deletions.
        return response()->json([
            'message' => 'Gasto eliminado exitosamente.' // USER-FACING SPANISH TEXT
        ], 204); 
    }
}