<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class ExpenseController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:Ver-gastos', ['only' => ['index', 'show']]);
        $this->middleware('permission:Crear-gastos', ['only' => ['store']]);
        $this->middleware('permission:Editar-gastos', ['only' => ['update']]);
        $this->middleware('permission:Eliminar-gastos', ['only' => ['destroy']]);
    }
    /**
     * Display a listing of the resource.
     * Returns ALL expenses (including soft deleted) for ALL users.
     * Because user_id no longer exists, we cannot filter by user.
     */
    public function index()
    {
        // Load categories and include soft deleted items
        $expenses = Expense::with(['category'])->withTrashed()->orderBy('expense_date', 'desc')->get();

        return response()->json([
            'message' => 'Lista de gastos recuperada exitosamente.',
            'data' => $expenses
        ], 200);
    }

    /**
     * Store a newly created resource.
     * Creates a new expense.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'expense_category_id' => 'required|exists:expense_categories,id',
                'amount' => 'required|numeric|min:0.01',
                'expense_date' => 'required|date',
            ]);
            $validatedData['deleted_by'] = null;
            // ✔ Since there's no user_id anymore, we only save the validated fields
            Expense::create($validatedData);

            return response()->json([
                'message' => 'Gasto creado exitosamente.',
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación.',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear el gasto.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified expense.
     */
    public function show(Expense $expense)
    {
        // ✔ No user_id check since the field no longer exists

        // Load the related category
        $expense->load('category');

        return response()->json([
            'message' => 'Detalles del gasto recuperados exitosamente.',
            'data' => $expense
        ], 200);
    }

    /**
     * Update an existing expense.
     */
    public function update(Request $request, Expense $expense)
    {
        // ✔ No ownership check (user_id removed)

        try {
            $validatedData = $request->validate([
                'expense_category_id' => 'required|integer|exists:expense_categories,id',
                'amount' => 'required|numeric|min:0.01',
                'expense_date' => 'required|date',
            ]);

            $expense->update($validatedData);

            return response()->json([
                'message' => 'Gasto actualizado exitosamente.',
                'data' => $expense
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación.',
                'errors' => $e->errors()
            ], 422);
        }
    }

    /**
     * Soft delete an expense.
     */
    public function destroy(Expense $expense)
    {
        // ✔ No user check because user_id no longer exists

        // Save who deleted the record
        $expense->deleted_by = Auth::id();
        $expense->save();

        // Perform soft delete
        $expense->delete();

        return response()->json([
            'message' => 'Gasto eliminado exitosamente.'
        ], 204);
    }
}
