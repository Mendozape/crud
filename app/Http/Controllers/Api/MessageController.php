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
     * ✅ Get the total number of unread messages for the logged-in user.
     * This is used to display the unread badge count in the top navigation.
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
     * ✅ Get all contacts (other users) and show how many unread messages each has.
     * This helps display a list of users with their unread message count.
     */
    // En app/Http/Controllers/Api/MessageController.php

    public function getContacts(Request $request)
    {
        $currentUserId = Auth::id();
        $searchTerm = $request->input('search', '');
        $perPage = 10; // You can make this configurable

        $query = User::where('id', '!=', $currentUserId)
            ->select('id', 'name');

        // Apply search filter
        if (!empty($searchTerm)) {
            $query->where('name', 'like', '%' . $searchTerm . '%');
        }

        // Use Laravel pagination
        $usersPaginator = $query->paginate($perPage);
        $users = $usersPaginator->items(); // Get only the users of the current page

        // Count unread messages (only for the users on the current page)
        $userIds = collect($users)->pluck('id');

        $unreadCounts = Message::where('receiver_id', $currentUserId)
            ->whereIn('sender_id', $userIds) // Count only for visible users
            ->whereNull('read_at')
            ->select('sender_id', DB::raw('count(*) as unread_count'))
            ->groupBy('sender_id')
            ->pluck('unread_count', 'sender_id');

        // Attach unread count to each user
        $users = collect($users)->map(function ($user) use ($unreadCounts) {
            $user->unread_count = $unreadCounts->get($user->id, 0);
            return $user;
        });

        return response()->json([
            'status' => 'success',
            'users' => $users,
            'pagination' => [ // Return pagination metadata
                'total' => $usersPaginator->total(),
                'per_page' => $usersPaginator->perPage(),
                'current_page' => $usersPaginator->currentPage(),
                'last_page' => $usersPaginator->lastPage(),
            ]
        ]);
    }


    /**
     * ✅ Get all messages exchanged between the logged-in user and a specific receiver.
     * When loading this chat, mark all messages from the receiver as "read".
     */
    public function getMessages($receiverId)
    {
        $currentUserId = Auth::id();

        // Retrieve all messages (sent and received) between the two users
        $messages = Message::with('sender:id,name')
            ->where(function ($query) use ($currentUserId, $receiverId) {
                $query->where('sender_id', $currentUserId)
                    ->where('receiver_id', $receiverId);
            })
            ->orWhere(function ($query) use ($currentUserId, $receiverId) {
                $query->where('sender_id', $receiverId)
                    ->where('receiver_id', $currentUserId);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        // ✅ Mark all messages from this contact as "read"
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
     * ✅ Send a new message from the logged-in user to another user.
     * The message is also broadcasted in real-time using Laravel Echo.
     */
    public function sendMessage(Request $request)
    {
        // Validate input data
        $data = $request->validate([
            'receiver_id' => [
                'required',
                'integer',
                // The receiver must exist and must not be the same as the sender
                Rule::exists('users', 'id')->where(function ($query) {
                    return $query->where('id', '!=', Auth::id());
                }),
            ],
            'content' => 'required|string|max:1000',
        ]);

        // Create the new message record
        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $data['receiver_id'],
            'content' => $data['content'],
        ]);

        // Load sender relationship for front-end use
        $message->load('sender');

        // Broadcast message to other users in real-time
        broadcast(new MessageSent($message))->toOthers();

        return response()->json([
            'status' => 'success',
            'message' => $message
        ], 201);
    }

    /**
     * ✅ Mark all unread messages from a specific sender as "read" for the current user.
     * This method is called in real-time when the chat window is open or receives new messages.
     */
    public function markAsRead(Request $request)
    {
        $data = $request->validate([
            'sender_id' => 'required|integer|exists:users,id',
        ]);

        $receiverId = Auth::id();

        Message::where('sender_id', $data['sender_id'])
            ->where('receiver_id', $receiverId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        // 🔔 Broadcast the "MessageRead" event in real time
        broadcast(new \App\Events\MessageRead($data['sender_id'], $receiverId))->toOthers();

        return response()->json(['status' => 'success']);
    }


    public function typing(Request $request)
    {
        $data = $request->validate([
            'receiver_id' => 'required|integer|exists:users,id',
        ]);

        broadcast(new \App\Events\UserTyping($data['receiver_id']))->toOthers();

        return response()->json(['status' => 'ok']);
    }
}
