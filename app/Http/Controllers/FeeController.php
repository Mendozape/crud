<?php

namespace App\Http\Controllers;

use App\Models\Fee;
use Illuminate\Http\Request;

class FeeController extends Controller
{
    public function index()
    {
        $fees = Fee::all();
        return response()->json($fees);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'description' => 'nullable|string',
        ]);

        $fee = Fee::create($validated);
        return response()->json($fee, 201);
    }

    public function show($id)
    {
        $fee = Fee::findOrFail($id);
        return response()->json($fee);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'description' => 'nullable|string',
        ]);

        $fee = Fee::findOrFail($id);
        $fee->update($validated);

        return response()->json($fee);
    }

    public function destroy($id)
    {
        $fee = Fee::findOrFail($id);
        $fee->delete();

        return response()->json(['message' => 'Fee deleted successfully.'], 200);
    }
    public function redire2()
    {
        return view('fees.index ');
    }
}
