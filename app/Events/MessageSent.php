<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The Message instance being broadcasted.
     * @var \App\Models\Message
     */
    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct(Message $message)
    {
        // Eager load the sender relationship so the frontend receives the sender's name
        $this->message = $message->load('sender'); 
    }

    /**
     * Get the channels the event should broadcast on.
     * This defines the private channel for the conversation.
     *
     * @return array<\Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        // 1. Determine the two user IDs involved
        $senderId = $this->message->sender_id;
        $receiverId = $this->message->receiver_id;

        // 2. Sort the IDs to create a canonical (consistent) channel name.
        // E.g., for users 5 and 12, the channel is always 'chat.5.12'.
        $ids = [$senderId, $receiverId];
        sort($ids);
        
        // Broadcast to a private channel
        return [
            new PrivateChannel('chat.' . implode('.', $ids)),
        ];
    }
    
    /**
     * The name of the event to broadcast.
     * The React frontend will listen for this exact string.
     */
    public function broadcastAs(): string
    {
        return 'MessageSent';
    }

    /**
     * The data to broadcast. By default it sends public properties,
     * but we specify it for clarity.
     */
    public function broadcastWith(): array
    {
        return [
            'message' => $this->message,
        ];
    }
}