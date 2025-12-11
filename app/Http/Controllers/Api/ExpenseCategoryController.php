<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use App\Models\Expense;

class ExpenseCategoryController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view-expenses-catalog', ['only' => ['index', 'show']]);
        $this->middleware('permission:create-expenses-catalog', ['only' => ['store']]);
        $this->middleware('permission:edit-expenses-catalog', ['only' => ['update']]);
        $this->middleware('permission:delete-expenses-catalog', ['only' => ['destroy']]);
    }
    /**
     * Display a listing of the resource (including soft-deleted records for management).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // Fetch all categories, including soft-deleted ones, ordered by name.
        $categories = ExpenseCategory::withTrashed()->orderBy('name')->get();

        return response()->json([
            'message' => 'Lista de categorías de gastos recuperada exitosamente.', // USER-FACING SPANISH TEXT
            'data' => $categories
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            // Validate the name (must be unique).
            $validatedData = $request->validate([
                'name' => 'required|string|max:100|unique:expense_categories,name',
            ]);

            $category = ExpenseCategory::create($validatedData);

            return response()->json([
                'message' => 'Categoría de gasto creada exitosamente.', // USER-FACING SPANISH TEXT
                'data' => $category
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación.', // USER-FACING SPANISH TEXT
                'errors' => $e->errors()
            ], 422);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\ExpenseCategory  $expenseCategory
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(ExpenseCategory $expenseCategory)
    {
        return response()->json([
            'message' => 'Detalles de la categoría recuperados exitosamente.', // USER-FACING SPANISH TEXT
            'data' => $expenseCategory
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\ExpenseCategory  $expenseCategory
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, ExpenseCategory $expenseCategory)
    {
        try {
            // Validate the name (must be unique, ignoring the current category's ID).
            $validatedData = $request->validate([
                'name' => 'required|string|max:100|unique:expense_categories,name,' . $expenseCategory->id,
            ]);

            $expenseCategory->update($validatedData);

            return response()->json([
                'message' => 'Categoría de gasto actualizada exitosamente.', // USER-FACING SPANISH TEXT
                'data' => $expenseCategory
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
     *
     * @param  \App\Models\ExpenseCategory  $expenseCategory
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(ExpenseCategory $expenseCategory)
    {
        // CRITICAL CHECK: Before soft deleting, ensure the category is not actively being used by any expense.

        // Check if there are any active (non-soft-deleted) expenses linked to this category.
        // This relies on the 'expenses()' relationship defined in the ExpenseCategory model.
        if ($expenseCategory->expenses()->count() > 0) {
            // Return 409 Conflict status if linked expenses are found.
            return response()->json([
                // User-facing Spanish text indicating the restriction
                'message' => 'No se puede eliminar la categoría porque tiene gastos asignados. Desvincule o anule los gastos primero.'
            ], 409);
        }

        // If no active expenses are linked, proceed with the soft delete.
        $expenseCategory->delete();

        // Return a successful response.
        return response()->json([
            // User-facing Spanish text confirming successful soft deletion
            'message' => 'Categoría de gasto eliminada suavemente.'
        ], 200);
    }
}
