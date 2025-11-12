<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Auth;

class UserTyping implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public $sender_id;
    public $receiver_id;

    public function __construct($receiverId)
    {
        $this->sender_id = Auth::id();
        $this->receiver_id = $receiverId;
    }

    public function broadcastOn()
    {
        $ids = [$this->sender_id, $this->receiver_id];
        sort($ids);
        return [new PrivateChannel('chat.' . implode('.', $ids))];
    }

    public function broadcastAs()
    {
        return 'UserTyping';
    }

    public function broadcastWith()
    {
        return [
            'sender_id' => $this->sender_id,
            'receiver_id' => $this->receiver_id,
        ];
    }
}
