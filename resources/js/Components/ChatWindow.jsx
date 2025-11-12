import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatWindow = ({ currentUserId, receiver }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const typingTimeoutRef = useRef(null);
    const messagesEndRef = useRef(null);

    const getChannelName = (id1, id2) => {
        const ids = [id1, id2];
        ids.sort((a, b) => a - b);
        return `chat.${ids.join('.')}`;
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    // 👇 Scroll to bottom when typing indicator appears
    useEffect(() => {
        if (typingUser) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [typingUser]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`/api/chat/messages/${receiver.id}`);
                setMessages(response.data.messages);

                // 👇 NEW: Mark as read when chat is opened
                const hasUnread = response.data.messages.some(
                    msg => msg.receiver_id === currentUserId && !msg.read_at
                );
                if (hasUnread) {
                    await axios.post(`/api/chat/mark-as-read`, { sender_id: receiver.id });
                    window.dispatchEvent(new CustomEvent('chat-messages-read'));
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();

        if (!window.Echo) {
            console.error("Laravel Echo not initialized.");
            return;
        }

        const channelName = getChannelName(currentUserId, receiver.id);

        window.Echo.private(channelName)
            .listen('.MessageSent', async (e) => {
                if (e.message.sender_id === receiver.id) {
                    setMessages(prev => [...prev, e.message]);
                    try {
                        await axios.post(`/api/chat/mark-as-read`, { sender_id: receiver.id });
                        window.dispatchEvent(new CustomEvent('chat-messages-read'));
                    } catch (err) {
                        console.error("Mark as read failed:", err);
                    }
                }
            })
            .listen('.UserTyping', (e) => {
                if (e.sender_id === receiver.id) {
                    setTypingUser(receiver.name);
                    clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => {
                        setTypingUser(null);
                    }, 2500);
                }
            })
            .listen('.MessageRead', (e) => {
                const senderId = e.sender_id;
                const readerId = e.reader_id;
                if (senderId === currentUserId && readerId === receiver.id) {
                    setMessages(prev =>
                        prev.map(msg =>
                            msg.receiver_id === readerId
                                ? { ...msg, read_at: new Date().toISOString() }
                                : msg
                        )
                    );
                }
            })
            .error(err => console.error("Echo error:", err));

        return () => {
            window.Echo.leave(channelName);
            clearTimeout(typingTimeoutRef.current);
        };
    }, [currentUserId, receiver.id]);


    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const tempMessage = {
            id: Date.now(),
            sender_id: currentUserId,
            receiver_id: receiver.id,
            content: newMessage.trim(),
            created_at: new Date().toISOString(),
            sender: { name: 'You' },
        };

        setMessages(prev => [...prev, tempMessage]);
        setNewMessage('');

        try {
            const response = await axios.post('/api/chat/send', {
                receiver_id: receiver.id,
                content: tempMessage.content,
            });

            setMessages(prev =>
                prev.map(msg =>
                    msg.id === tempMessage.id ? response.data.message : msg
                )
            );
        } catch (err) {
            console.error("Error sending message:", err);
            setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
        }
    };

    const handleTyping = async (e) => {
        setNewMessage(e.target.value);
        if (!isTyping) {
            setIsTyping(true);
            try {
                await axios.post('/api/chat/typing', { receiver_id: receiver.id });
            } catch (err) {
                console.error("Typing event failed:", err);
            }
            setTimeout(() => setIsTyping(false), 2000);
        }
    };

    return (
        <div className="card card-primary card-outline direct-chat direct-chat-primary">
            <div className="card-header">
                <h3 className="card-title">Chat with {receiver.name}</h3>
            </div>

            <div className="card-body">
                <div className="direct-chat-messages" style={{ height: '50vh', overflowY: 'scroll' }}>
                    {messages.map(msg => {
                        const isSender = msg.sender_id === currentUserId;
                        const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        // WhatsApp-style bubble colors
                        const bubbleStyle = {
                            backgroundColor: isSender ? '#dcf8c6' : '#f1f0f0',
                            color: '#000',
                            borderRadius: '10px',
                            padding: '8px 10px',
                            display: 'inline-block',
                            maxWidth: '75%',
                        };

                        return (
                            <div key={msg.id} className={`direct-chat-msg ${isSender ? 'right' : ''}`}>
                                <div className="direct-chat-infos clearfix">
                                    <span className={`direct-chat-name ${isSender ? 'float-right' : 'float-left'}`}>
                                        {msg.sender?.name || 'Unknown'}
                                    </span>
                                    <span className={`direct-chat-timestamp ${isSender ? 'float-left' : 'float-right'}`}>
                                        {time}
                                    </span>
                                </div>
                                <i className="direct-chat-img fas fa-user-circle"></i>
                                <div className="direct-chat-text" style={bubbleStyle}>
                                    {msg.content}
                                    {isSender && (
                                        <span className="ml-2" style={{ fontSize: '13px' }}>
                                            {msg.read_at ? (
                                                <span style={{ color: '#34B7F1' }}>✓✓</span> // blue double check (read)
                                            ) : (
                                                <span style={{ color: 'gray' }}>✓</span> // gray single check (sent)
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {typingUser && (
                        <div className="text-muted small ml-3">
                            <i>{typingUser} is typing...</i>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="card-footer">
                <form onSubmit={handleSend}>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Type your message..."
                            className="form-control"
                            value={newMessage}
                            onChange={handleTyping}
                            autoComplete="off"
                        />
                        <span className="input-group-append">
                            <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()}>
                                Send
                            </button>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
