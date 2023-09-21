<?php
namespace App\Providers;
use Illuminate\Support\ServiceProvider;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     * @return void
     */
    public function register()
    {
        //
    }
    /**
     * Bootstrap any application services.
     * @return void
     */
    public function boot()
    {
        Paginator::useBootstrap();
        /*Storage::disk('local')->buildTemporaryUrlsUsing(function ($path, $expiration, $options) {
            return URL::temporarySignedRoute(
                'local.temp',
                $expiration, 
                array_merge($options, ['path' => $path])
            );
        });*/
        /*Storage::disk('local')->buildTemporaryUrlsUsing(function ($path, $expiration, $options) {
            return URL::temporarySignedRoute(
                'download',
                $expiration, 
                array_merge($options, ['path' => $path])
            );
        });*/
    }
}

