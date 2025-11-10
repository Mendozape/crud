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
     * The message instance being broadcast.
     */
    public $message;

    /**
     * Create a new event instance.
     * 
     * @param Message $message The message that was just sent.
     */
    public function __construct(Message $message)
    {
        // Load sender relationship to include sender details in the broadcast
        $this->message = $message->load('sender');
    }

    /**
     * Determine which channels the event should broadcast on.
     * 
     * This event is broadcast to TWO channels:
     * 1. The private chat channel between sender and receiver (for real-time chat updates)
     * 2. The receiver’s personal notification channel (for updating unread message badges)
     * 
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        $senderId = $this->message->sender_id;
        $receiverId = $this->message->receiver_id;

        // Sort user IDs to generate a consistent chat channel name
        $ids = [$senderId, $receiverId];
        sort($ids);
        
        return [
            // Private channel for the chat conversation between the two users
            new PrivateChannel('chat.' . implode('.', $ids)),

            // Private channel for the receiver's global notifications (e.g., unread badge)
            new PrivateChannel('App.Models.User.' . $receiverId),
        ];
    }

    /**
     * The event name that will be used on the frontend listener.
     * 
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'MessageSent';
    }

    /**
     * Data that will be sent with the broadcast event.
     * 
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'message' => $this->message,
        ];
    }
}
