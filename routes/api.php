<?php
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\ApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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
/*Route::middleware(['auth'])->group(function(){
    Route::get('/users',[ApiController::class, 'users'])->name('users');
});*/
//public API
//Route::get('/users',[ApiController::class,'users']);//public
//Route::middleware('auth:api')->get('/users','ApiController@users'); //private
Route::post('/login',[ApiController::class,'login']);
Route::apiResource('/articles',ArticleController::class);

Route::middleware('auth.basic')->group(function (): void {
    Route::get('/users',[ApiController::class,'users']);
});