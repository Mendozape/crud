import { useEffect, useState } from 'react';
import axios from 'axios';

const ChatBadgeUpdater = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const userId = window.Laravel?.user?.id;
    const badgeElement = document.getElementById('unread-chat-count');

    const updateBadge = (count) => {
        if (badgeElement) {
            if (count > 0) {
                badgeElement.textContent = count;
                badgeElement.classList.remove('d-none');
            } else {
                badgeElement.textContent = '';
                badgeElement.classList.add('d-none');
            }
        }
    };

    // Reusable function to refresh the counter
    const refreshCount = async () => {
        try {
            const response = await axios.get('/api/chat/unread-count');
            const count = response.data.count;
            setUnreadCount(count);
            updateBadge(count);
        } catch (error) {
            console.error("Error fetching chat count:", error);
        }
    };

    // 1. Initial Fetch
    useEffect(() => {
        if (!userId) return;
        refreshCount();
    }, [userId]);

    // 2. Real-Time Listener
    useEffect(() => {
        if (!userId || !window.Echo) return;

        const userChannel = `App.Models.User.${userId}`;

        window.Echo.private(userChannel)
            .listen('.MessageSent', (e) => {
                if (e.message.receiver_id === userId) {
                    setUnreadCount(prevCount => {
                        const newCount = prevCount + 1;
                        updateBadge(newCount);
                        return newCount;
                    });
                }
            })
            .error((error) => {
                console.error('Pusher global channel error:', error);
            });

        return () => {
            window.Echo.leave(userChannel);
        };
    }, [userId]); 

    // 3. Listener for custom event (when messages are read)
    useEffect(() => {
        if (!userId) return;

        const handleMessagesRead = () => {
            console.log('Event chat-messages-read received, refreshing count...');
            refreshCount();
        };

        window.addEventListener('chat-messages-read', handleMessagesRead);

        return () => {
            window.removeEventListener('chat-messages-read', handleMessagesRead);
        };
    }, [userId]);
    
    return null;
};

export default ChatBadgeUpdater;