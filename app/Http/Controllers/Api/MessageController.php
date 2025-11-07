<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\User;
use App\Events\MessageSent;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    /**
     * Get the total count of unread messages for the authenticated user.
     * Used by the ChatBadgeUpdater component in the top navigation bar.
     */
    public function getGlobalUnreadCount()
    {
        $count = Message::where('receiver_id', Auth::id())
                        ->whereNull('read_at')
                        ->count();

        return response()->json([
            'status' => 'success',
            'count' => $count,
        ]);
    }

    /**
     * Fetch the list of users (contacts) the current user can chat with.
     * Fetches all users and attaches their specific unread message count.
     * Used by ChatPage.jsx to populate the sidebar.
     */
    public function getContacts()
    {
        $currentUserId = Auth::id();

        // 1. Fetch all users excluding the currently authenticated one
        $users = User::where('id', '!=', $currentUserId)
                     ->select('id', 'name') // Select only necessary fields
                     ->get();

        // 2. Calculate the total count of unread messages the current user has received,
        // grouped by the sender's ID.
        $unreadCounts = Message::where('receiver_id', $currentUserId)
                               ->whereNull('read_at')
                               ->select('sender_id', DB::raw('count(*) as unread_count'))
                               ->groupBy('sender_id')
                               ->pluck('unread_count', 'sender_id');

        // 3. Map the unread count onto the user objects
        $users = $users->map(function ($user) use ($unreadCounts) {
            // Get the unread count for this user (default to 0)
            $user->unread_count = $unreadCounts->get($user->id, 0);
            return $user;
        });

        return response()->json([
            'status' => 'success',
            'users' => $users,
        ]);
    }

    /**
     * Fetch the message history for a conversation with a specific user.
     * Also marks all received messages as read.
     * Used by ChatWindow.jsx when opening a conversation.
     * @param int $receiverId The ID of the user the authenticated user is chatting with.
     */
    public function getMessages($receiverId)
    {
        $currentUserId = Auth::id();

        // 1. Fetch messages exchanged between the two users
        $messages = Message::with('sender:id,name') // Eager load sender details
                           ->where(function ($query) use ($currentUserId, $receiverId) {
                               // Messages sent by Auth to Receiver
                               $query->where('sender_id', $currentUserId)
                                     ->where('receiver_id', $receiverId);
                           })
                           ->orWhere(function ($query) use ($currentUserId, $receiverId) {
                               // Messages sent by Receiver to Auth
                               $query->where('sender_id', $receiverId)
                                     ->where('receiver_id', $currentUserId);
                           })
                           ->orderBy('created_at', 'asc')
                           ->get();

        // 2. Mark received messages as read
        Message::where('sender_id', $receiverId)
               ->where('receiver_id', $currentUserId)
               ->whereNull('read_at')
               ->update(['read_at' => now()]);

        return response()->json([
            'status' => 'success',
            'messages' => $messages,
        ]);
    }

    /**
     * Handles sending a new message.
     * Saves to DB, and broadcasts the event in real-time.
     * Used by the ChatWindow form submission.
     */
    public function sendMessage(Request $request)
    {
        // 1. Validation
        $data = $request->validate([
            'receiver_id' => [
                'required', 
                'integer', 
                // Ensure the receiver is a valid user and not the sender
                Rule::exists('users', 'id')->where(function ($query) {
                    return $query->where('id', '!=', Auth::id());
                }),
            ],
            'content' => 'required|string|max:1000',
        ]);

        // 2. Persistence (Save to Database)
        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $data['receiver_id'],
            'content' => $data['content'],
        ]);

        // 3. Broadcasting (Send to Pusher/Reverb)
        // Load the sender relationship before broadcasting so React has the name
        $message->load('sender'); 
        
        // Broadcast the event to the intended receiver
        // toOthers() prevents the sender from receiving their own message via WebSocket
        broadcast(new MessageSent($message))->toOthers();

        // 4. Response
        return response()->json([
            'status' => 'success',
            'message' => $message
        ], 201);
    }
}