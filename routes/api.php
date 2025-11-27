<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\ApiController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\RolesController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ResidentController;
use App\Http\Controllers\Api\FeeController;
use App\Http\Controllers\AddressPaymentController;
use App\Http\Controllers\PermisosController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\AddressController; 
use Illuminate\Support\Facades\Session;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
Route::post('/login', [ApiController::class, 'login']);
Route::middleware('auth:sanctum')->get('/get-token', function (Request $request) {
    return response()->json([
        'token' => Session::get('api_token'),
        'user' => $request->user(),
    ]);
});

Route::middleware('auth:sanctum')->group(function () {
    
    // --- GENERAL RESOURCES ---
    Route::apiResource('/articles', ArticleController::class);
    Route::get('/users', [ApiController::class, 'users']);
    Route::get('/users/count', [UserController::class, 'count']);
    Route::get('/clients/count', [ClientController::class, 'count']);
    Route::get('/roles/count', [RolesController::class, 'count']);
    
    // --- RESIDENTS, FEES, ADDRESSES ---
    Route::apiResource('/residents', ResidentController::class);
    Route::get('/residents/unassigned/search', [ResidentController::class, 'searchUnassigned']);
    Route::apiResource('/fees', FeeController::class);
    
    // --- ADDRESSES CATALOG/CRUD ROUTES ---
    Route::get('/addresses/active', [AddressController::class, 'listActive']);
    Route::apiResource('/addresses', AddressController::class);

    // ---------------------------------------------------
    // ADDRESS_PAYMENTS ROUTES - CRITICAL: Custom routes BEFORE resource routes
    // ---------------------------------------------------

    // IMPORTANT: These custom routes must be BEFORE the apiResource to avoid route conflicts
    
    // Get paid months for a specific address/year/fee
    Route::get('/address_payments/paid-months/{addressId}/{year}', [AddressPaymentController::class, 'getPaidMonths']); 
    
    // Payment History for a specific address
    Route::get('/address_payments/history/{addressId}', [AddressPaymentController::class, 'paymentHistory']); 
    
    // Cancel payment
    Route::post('/address_payments/cancel/{paymentId}', [AddressPaymentController::class, 'cancelPayment']);

    // General resource management (CRUD) - This must come AFTER custom routes
    Route::apiResource('/address_payments', AddressPaymentController::class);
    
    Route::apiResource('permisos', PermisosController::class);
    Route::apiResource('roles', RolesController::class);
    Route::apiResource('usuarios', UserController::class);

    // --- REPORTS ROUTES ---
    Route::get('reports/debtors', [ReportController::class, 'debtors']); 
    
    // CRITICAL FIX: Renamed endpoint to be address-focused, mapped to new method
    Route::get('reports/payments-by-address', [ReportController::class, 'paymentsByAddressId']); 
    
    Route::get('reports/income-by-month', [ReportController::class, 'incomeByMonth']);
    Route::get('/reports/available-years', [ReportController::class, 'paymentYears']);
    
    // CRITICAL FIX: Renamed search endpoint and mapped to new method
    Route::get('reports/search-residents', [ResidentController::class, 'searchResidents']); 
    // Defines the API resource routes: GET, POST, GET/{id}, PUT/PATCH/{id}, DELETE/{id}
    
    Route::apiResource('expenses', ExpenseController::class);
    
    //ROUTE FOR MONTHLY EXPENSES
    Route::get('reports/current-month-expenses', [ReportController::class, 'currentMonthExpenses']);

    // --- CHAT API ROUTES ---
    Route::get('/chat/contacts', [MessageController::class, 'getContacts']);
    Route::get('/chat/messages/{receiverId}', [MessageController::class, 'getMessages']);
    Route::post('/chat/send', [MessageController::class, 'sendMessage']);
    Route::get('/chat/unread-count', [MessageController::class, 'getGlobalUnreadCount']);
    Route::post('/chat/mark-as-read', [MessageController::class, 'markAsRead']);
    Route::post('/chat/typing', [MessageController::class, 'typing']);
});