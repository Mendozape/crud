<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// **CAMBIO AQUI:** Modificamos el canal del modelo por defecto a nuestro canal de usuario específico.
// Este canal se usa para notificaciones o, en nuestro caso, para actualizar el contador (badge) del usuario.
Broadcast::channel('App.User.{userId}', function ($user, $userId) {
    // Verifica que el usuario autenticado ($user->id) sea el mismo que el ID en el canal.
    return (int) $user->id === (int) $userId;
});

/**
 * Authorization for the private chat channel.
 * Channel format: 'chat.[user_id_1].[user_id_2]'
 * This callback verifies that the currently authenticated user ($user) 
 * is one of the two participants in the channel name.
 */
Broadcast::channel('chat.{firstUserId}.{secondUserId}', function ($user, $firstUserId, $secondUserId) {
    // Convert IDs to integers
    $u1 = (int) $firstUserId;
    $u2 = (int) $secondUserId;
    
    // The authenticated user MUST be either the first ID OR the second ID.
    return $user->id === $u1 || $user->id === $u2;
});