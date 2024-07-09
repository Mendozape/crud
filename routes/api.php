<?php
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\ApiController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UsuariosController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\RolesController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ResidentController;
use App\Http\Controllers\FeeController;
use App\Http\Controllers\ResidentPaymentController;


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
/*Route::prefix('V1')->group(function(){
    Route::apiResource('/articles',ArticleController::class);
});*/
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
Route::post('/login',[ApiController::class,'login']);

Route::middleware('auth:sanctum')->group(function(){
    Route::apiResource('/articles',ArticleController::class);
    Route::get('/users', [ApiController::class,'users']);
    Route::get('/admin/isAdmin',  [UserController::class,'isAdmin']);
    Route::get('/admin/notis/{id}',  [UserController::class,'notis']);
    Route::get('/users/count', [UserController::class,'count']);
    Route::get('/clients/count', [ClientController::class,'count']);
    Route::get('/roles/count', [RolesController::class,'count']);
    Route::apiResource('/residents',ResidentController::class);
    Route::apiResource('/fees', FeeController::class);
    Route::apiResource('/resident_payments', ResidentPaymentController::class);
});
    


//Route::middleware('auth:sanctum')->get('/users', [ApiController::class,'users']);

