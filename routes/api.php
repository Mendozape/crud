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
use App\Http\Controllers\Api\MessageController;
// --- NEW CONTROLLER IMPORT ---
use App\Http\Controllers\Api\AddressController; // Import the Address Catalog Controller
// ------------------------------
use Illuminate\Support\Facades\Session;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here you can register API routes for your application. These
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
        'user' => $request->user(),  // Return the authenticated user
    ]);
});

// Protected API routes (require auth via Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // ... General API Resources ...
    Route::apiResource('/articles', ArticleController::class);
    Route::get('/users', [ApiController::class, 'users']);
    Route::get('/notis/countNotis', [UserController::class, 'countNotis']);
    Route::get('/notis/notis/{id}', [UserController::class, 'notis']);
    Route::get('/users/count', [UserController::class, 'count']);
    Route::get('/clients/count', [ClientController::class, 'count']);
    Route::get('/roles/count', [RolesController::class, 'count']);

    // Residents and Fees Resources
    Route::apiResource('/residents', ResidentController::class);
    Route::get('/residents/unassigned/search', [ResidentController::class, 'searchUnassigned']);
    Route::apiResource('/fees', FeeController::class);

    // --- ADDRESSES CATALOG ROUTES ---
    Route::get('/addresses/active', [AddressController::class, 'listActive']);
    
    // API Resource for the Address Catalog (CRUD operations and soft deletion)
    Route::apiResource('/addresses', AddressController::class);
    // Addresses Catalog Routes (List Active)
    

    

    // ---------------------------------------------------
    // 1. RESIDENT_PAYMENTS ROUTES (Correct Order for conflict resolution)
    // ---------------------------------------------------

    // SPECIFIC HISTORY ROUTE: Must come FIRST because it includes the fixed segment '/history'
    // This solves the React component receiving the wrong data structure.
    Route::get('resident_payments/history/{residentId}', [ResidentPaymentController::class, 'paymentHistory']);

    // CANCELLATION ROUTE: Must be defined here to ensure it's not shadowed.
    Route::post('resident_payments/cancel/{paymentId}', [ResidentPaymentController::class, 'cancelPayment']);

    // PAID MONTHS ROUTE (More generic two-parameter route)
    Route::get('/resident_payments/{residentId}/{year}', [ResidentPaymentController::class, 'getPaidMonths']);

    // API RESOURCE (General CRUD routes)
    // This must come LAST to ensure the specific routes above take precedence.
    Route::apiResource('/resident_payments', ResidentPaymentController::class);
    // ---------------------------------------------------

    Route::apiResource('permisos', PermisosController::class);
    Route::apiResource('roles', RolesController::class);
    Route::apiResource('usuarios', UserController::class);

    // REPORTS routes (individual GET routes)
    Route::get('reports/debtors', [ReportController::class, 'debtors']); // Residents with X months overdue
    Route::get('reports/payments-by-resident', [ReportController::class, 'paymentsByResident']);
    Route::get('reports/income-by-month', [ReportController::class, 'incomeByMonth']);
    Route::get('/reports/available-years', [ReportController::class, 'paymentYears']);
    Route::get('reports/search-residents', [ReportController::class, 'searchResidents']); // Resident search (autocomplete)

    // --- CHAT API ROUTES ---

    // Fetch the list of users/contacts along with their unread message counts
    Route::get('/chat/contacts', [MessageController::class, 'getContacts']);

    // Fetch the message history for a specific conversation and mark received messages as read
    Route::get('/chat/messages/{receiverId}', [MessageController::class, 'getMessages']);

    // Send a new message, save it to DB, and broadcast it in real-time
    Route::post('/chat/send', [MessageController::class, 'sendMessage']);

    // Get the total number of unread chat messages for the logged-in user
    Route::get('/chat/unread-count', [MessageController::class, 'getGlobalUnreadCount']);

    // Mark all messages from a specific sender as read
    Route::post('/chat/mark-as-read', [MessageController::class, 'markAsRead']);

    // Notify the receiver that the sender is typing (for the "User is typing..." indicator)
    Route::post('/chat/typing', [MessageController::class, 'typing']);
});
