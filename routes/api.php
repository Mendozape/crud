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
use App\Http\Controllers\ResidentPaymentController;
use App\Http\Controllers\PermisosController;
use App\Http\Controllers\Api\ReportController; 
use App\Http\Controllers\Api\MessageController; // NEW: Import the chat controller
use Illuminate\Support\Facades\Session;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Return authenticated user data (default route)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Custom login route (if not using Jetstream's form)
Route::post('/login', [ApiController::class, 'login']);

// Return the token saved in session after login (used by Jetstream login flow)
Route::middleware('auth:sanctum')->get('/get-token', function (Request $request) {
    return response()->json([
        'token' => Session::get('api_token'), // Get the token from session
        'user' => $request->user(),           // Return the authenticated user
    ]);
});

// Protected API routes (require auth via Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('/articles', ArticleController::class);
    Route::get('/users', [ApiController::class, 'users']);
    Route::get('/notis/countNotis', [UserController::class, 'countNotis']);
    Route::get('/notis/notis/{id}', [UserController::class, 'notis']);
    Route::get('/users/count', [UserController::class, 'count']);
    Route::get('/clients/count', [ClientController::class, 'count']);
    Route::get('/roles/count', [RolesController::class, 'count']);
    Route::apiResource('/residents', ResidentController::class);
    Route::apiResource('/fees', FeeController::class);
    Route::apiResource('/resident_payments', ResidentPaymentController::class);

    // Route to get already-paid months for a resident and year
    Route::get('/resident_payments/{residentId}/{year}', [ResidentPaymentController::class, 'getPaidMonths']);
    
    Route::apiResource('permisos', PermisosController::class);
    Route::apiResource('roles', RolesController::class);
    Route::apiResource('usuarios', UserController::class);

    // REPORTS routes (individual GET routes)
    Route::get('reports/debtors', [ReportController::class, 'debtors']); // Residents with more than X months overdue
    Route::get('reports/payments-by-resident', [ReportController::class, 'paymentsByResident']); // Payments filtered by resident
    Route::get('reports/income-by-month', [ReportController::class, 'incomeByMonth']); // Monthly income report
    Route::get('/reports/available-years', [ReportController::class, 'paymentYears']);

    // New route for resident search (autocomplete)
    Route::get('reports/search-residents', [ReportController::class, 'searchResidents']);

    // --- NEW CHAT API ROUTES ---
    
    // Fetch the list of users/contacts along with their unread message counts
    // Used by ChatPage.jsx to populate the sidebar
    Route::get('/chat/contacts', [MessageController::class, 'getContacts']);
    
    // Fetch the message history for a specific conversation and mark received messages as read
    // Used by ChatWindow.jsx when a contact is selected
    Route::get('/chat/messages/{receiverId}', [MessageController::class, 'getMessages']);
    
    // Send a new message, save it to DB, and broadcast it in real-time
    // Used by the ChatWindow form submission
    Route::post('/chat/send', [MessageController::class, 'sendMessage']);
    
    // Get the global total unread chat count (for the top navigation badge)
    Route::get('/chat/unread-count', [MessageController::class, 'getGlobalUnreadCount']);
});