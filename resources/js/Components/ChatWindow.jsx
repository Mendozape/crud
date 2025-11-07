import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
// window.Echo is assumed to be initialized globally (e.g., in bootstrap.js)

const ChatWindow = ({ currentUserId, receiver }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null); 

    // Helper function to create the canonical channel name (sorted IDs)
    const getChannelName = (id1, id2) => {
        const ids = [id1, id2];
        ids.sort((a, b) => a - b);
        return `chat.${ids.join('.')}`;
    };
    
    // Scroll to the latest message whenever messages state updates
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 1. Fetch Historical Messages & 2. Set up Real-Time Listener
    useEffect(() => {
        // --- 1. Fetch History ---
        const fetchMessages = async () => {
            try {
                // API endpoint for fetching messages between current user and receiver
                const response = await axios.get(`/api/chat/messages/${receiver.id}`);
                setMessages(response.data.messages);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();

        // --- 2. Set up Real-Time Listener (Pusher/Echo) ---
        if (!window.Echo) {
            console.error("Laravel Echo is not initialized. Real-time chat disabled.");
            return;
        }
        
        const channelName = getChannelName(currentUserId, receiver.id);
        
        // Subscribe to the private channel for this specific conversation
        window.Echo.private(channelName)
            .listen('.MessageSent', (e) => {
                // Only accept the message if it's from the other person in this chat
                if (e.message.sender_id === receiver.id) { 
                    console.log("Real-time message received:", e.message);
                    setMessages(prevMessages => [...prevMessages, e.message]);
                }
            })
            .error((error) => {
                console.error('Pusher channel authorization error:', error);
            });

        // Cleanup function: Unsubscribe when the component unmounts or receiver changes
        return () => {
            window.Echo.leave(channelName);
        };
        
    }, [currentUserId, receiver.id]);


    // 3. Handle Message Submission
    const handleSend = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const content = newMessage.trim();
        const messageData = {
            receiver_id: receiver.id,
            content: content,
        };
        
        // Optimistic UI Update: Show message instantly to the sender
        const tempMessage = {
            id: Date.now(),
            sender_id: currentUserId,
            content: content,
            created_at: new Date().toISOString(),
            // Simulate the sender object as returned by the API/Event
            sender: { name: 'You' } 
        };
        setMessages(prevMessages => [...prevMessages, tempMessage]);
        setNewMessage('');
        
        try {
            // Send request to Laravel API
            await axios.post('/api/chat/send', messageData);
            
            // Note: The message will be persisted in the DB and broadcasted 
            // to the receiver via Pusher by the Laravel controller.

        } catch (error) {
            console.error("Error sending message:", error);
            // Revert optimistic update if API fails
            setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempMessage.id));
            // NOTE: Use a custom modal/toast instead of alert() in production apps
            alert("Failed to send message."); 
        }
    };
    

    // Render the chat window (AdminLTE styling)
    return (
        <div className="card card-primary card-outline direct-chat direct-chat-primary">
            <div className="card-header">
                <h3 className="card-title">Chat with {receiver.name}</h3>
            </div>
            
            <div className="card-body">
                <div className="direct-chat-messages" style={{ height: '50vh', overflowY: 'scroll' }}>
                    {messages.map(msg => {
                        const isSender = msg.sender_id === currentUserId;
                        // Format time based on current locale
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
                                {/* User Icon Placeholder */}
                                <i className="direct-chat-img fas fa-user-circle"></i> 
                                <div className="direct-chat-text">
                                    {msg.content}
                                </div>
                            </div>
                        );
                    })}
                    {/* Reference for auto-scroll */}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            
            {/* Message Input Form */}
            <div className="card-footer">
                <form onSubmit={handleSend}>
                    <div className="input-group">
                        <input 
                            type="text" 
                            name="message" 
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