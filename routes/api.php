<?php
use app\Http\Controllers\Api\V1\ArticleController;
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

//public API
Route::get('/users',[ApiController::class,'users']);
Route::post('/login',[ApiController::class,'login']);
