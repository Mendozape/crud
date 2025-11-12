<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageRead implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public $sender_id;
    public $reader_id;

    public function __construct($senderId, $readerId)
    {
        $this->sender_id = $senderId;
        $this->reader_id = $readerId;
    }

    public function broadcastOn()
    {
        $ids = [$this->sender_id, $this->reader_id];
        sort($ids);
        return [new PrivateChannel('chat.' . implode('.', $ids))];
    }

    public function broadcastAs()
    {
        return 'MessageRead';
    }

    public function broadcastWith()
    {
        return [
            'sender_id' => $this->sender_id,
            'reader_id' => $this->reader_id,
        ];
    }
}
