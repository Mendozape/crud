<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Illuminate\Session\TokenMismatchException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     *
     * @return void
     */
    public function register()
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Throwable  $exception
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function render($request, Throwable $exception)
    {
        // Handle CSRF token mismatch (expired session)
        if ($exception instanceof TokenMismatchException) {
            return redirect()->route('login')->with(
                'message',
                'Tu sesión ha expirado. Por favor inicia sesión nuevamente.'
            );
        }

        // Handle permission denied errors (Spatie Permission - 403)
        if ($exception instanceof HttpException && $exception->getStatusCode() === 403) {

            // API / React request
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'No tienes permisos para realizar esta acción.'
                ], 403);
            }

            // Web request (Blade)
            abort(403, 'No tienes permisos para realizar esta acción.');
        }

        return parent::render($request, $exception);
    }
}
