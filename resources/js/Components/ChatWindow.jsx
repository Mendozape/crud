import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatWindow = ({ currentUserId, receiver }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // ✅ Generate a private channel name between two users in ascending order
    const getChannelName = (id1, id2) => {
        const ids = [id1, id2];
        ids.sort((a, b) => a - b);
        return `chat.${ids.join('.')}`;
    };

    // ✅ Automatically scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                // ✅ Fetch chat history with the selected receiver
                const response = await axios.get(`/api/chat/messages/${receiver.id}`);
                setMessages(response.data.messages);

                // 🔔 Notify other components (like the chat icon) that messages have been read
                window.dispatchEvent(new CustomEvent('chat-messages-read'));
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();

        // ✅ Check if Laravel Echo is available for real-time updates
        if (!window.Echo) {
            console.error("Laravel Echo is not initialized. Real-time chat disabled.");
            return;
        }

        const channelName = getChannelName(currentUserId, receiver.id);

        // ✅ Listen for new messages in real-time using Laravel Echo
        window.Echo.private(channelName)
            .listen('.MessageSent', async (e) => {
                // Only add the message if it was sent by the current receiver
                if (e.message.sender_id === receiver.id) {
                    console.log("Real-time message received:", e.message);
                    setMessages(prevMessages => [...prevMessages, e.message]);

                    try {
                        // 🆕 Mark the received messages as read immediately
                        await axios.post(`/api/chat/mark-as-read`, {
                            sender_id: receiver.id
                        });

                        // 🆕 Update global unread count (e.g., for chat icon)
                        window.dispatchEvent(new CustomEvent('chat-messages-read'));
                    } catch (err) {
                        console.error("Failed to mark message as read:", err);
                    }
                }
            })
            .error((error) => {
                console.error('Pusher channel authorization error:', error);
            });

        // ✅ Cleanup: leave the channel when unmounting or changing receiver
        return () => {
            window.Echo.leave(channelName);
        };

    }, [currentUserId, receiver.id]);

    // ✅ Handle message sending
    const handleSend = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const content = newMessage.trim();
        const messageData = {
            receiver_id: receiver.id,
            content: content,
        };

        // ✅ Create a temporary message to show instantly in the UI
        const tempMessage = {
            id: Date.now(),
            sender_id: currentUserId,
            content: content,
            created_at: new Date().toISOString(),
            sender: { name: 'You' }
        };

        setMessages(prevMessages => [...prevMessages, tempMessage]);
        setNewMessage('');

        try {
            // ✅ Send message to backend
            await axios.post('/api/chat/send', messageData);
        } catch (error) {
            console.error("Error sending message:", error);
            // Remove the temporary message if sending fails
            setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempMessage.id));
            alert("Failed to send message.");
        }
    };

    return (
        <div className="card card-primary card-outline direct-chat direct-chat-primary">
            {/* Chat header */}
            <div className="card-header">
                <h3 className="card-title">Chat with {receiver.name}</h3>
            </div>

            {/* Chat message area */}
            <div className="card-body">
                <div className="direct-chat-messages" style={{ height: '50vh', overflowY: 'scroll' }}>
                    {messages.map(msg => {
                        const isSender = msg.sender_id === currentUserId;
                        const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        return (
                            <div
                                key={msg.id}
                                className={`direct-chat-msg ${isSender ? 'right' : ''}`}
                            >
                                <div className="direct-chat-infos clearfix">
                                    <span className={`direct-chat-name ${isSender ? 'float-right' : 'float-left'}`}>
                                        {msg.sender?.name || 'Unknown User'}
                                    </span>
                                    <span className={`direct-chat-timestamp ${isSender ? 'float-left' : 'float-right'}`}>
                                        {time}
                                    </span>
                                </div>
                                <i className="direct-chat-img fas fa-user-circle"></i>
                                <div className="direct-chat-text">
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })}
                    {/* Scroll anchor to keep latest message visible */}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Chat input area */}
            <div className="card-footer">
                <form onSubmit={handleSend}>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Type your message ..."
                            className="form-control"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            autoComplete="off"
                        />
                        <span className="input-group-append">
                            <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()}>Send</button>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
