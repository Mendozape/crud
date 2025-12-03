<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class UserRegistered implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userName;

    /**
     * Create a new event instance.
     */
    public function __construct($userName)
    {
        $this->userName = $userName;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn()
    {
        return new Channel('notifications'); // Public channel
    }

    /**
     * The data to broadcast.
     */
    public function broadcastWith()
    {
        return [
            'message' => "A new user \"{$this->userName}\" has been registered."
        ];
    }
    public function broadcastAs()
    {
        return 'UserRegistered';
    }
}