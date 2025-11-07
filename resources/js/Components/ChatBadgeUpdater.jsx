import { useEffect, useState } from 'react';
import axios from 'axios';

const ChatBadgeUpdater = () => {
    // State to hold the total unread count
    const [unreadCount, setUnreadCount] = useState(0);

    // Get the authenticated user ID from the global Laravel object
    const userId = window.Laravel?.user?.id;
    // Get the DOM element from the Blade file
    const badgeElement = document.getElementById('unread-chat-count');

    // Helper function to update the DOM element visibility and count
    const updateBadge = (count) => {
        if (badgeElement) {
            if (count > 0) {
                badgeElement.textContent = count;
                badgeElement.classList.remove('d-none'); // Show the badge
            } else {
                badgeElement.textContent = '';
                badgeElement.classList.add('d-none'); // Hide the badge
            }
        }
    };

    // 1. Initial Fetch and DOM Update (Runs once on load)
    useEffect(() => {
        if (!userId) return;

        const fetchInitialCount = async () => {
            try {
                // Fetch total unread count from Laravel API
                const response = await axios.get('/api/chat/unread-count');
                const count = response.data.count;
                setUnreadCount(count);
                updateBadge(count);
            } catch (error) {
                console.error("Error fetching initial chat count:", error);
            }
        };

        fetchInitialCount();
    }, [userId]);

    // 2. Real-Time Listener (Listens to the global user channel)
    useEffect(() => {
        if (!userId || !window.Echo) return;

        // The channel name must match the one authorized in routes/channels.php
        // This channel receives any global event targeted at this user.
        const userChannel = `App.Models.User.${userId}`;

        window.Echo.private(userChannel)
            .listen('.MessageSent', (e) => {
                // When a new message is received:
                // Check if the message is directed to the current user AND they are NOT viewing it
                if (e.message.receiver_id === userId) {
                    // Increment the local state and update the DOM
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

        // Cleanup function: Leave the channel when the component unmounts
        return () => {
            window.Echo.leave(userChannel);
        };
    }, [userId]); 
    
    // This component renders nothing, only manages side effects
    return null;
};

export default ChatBadgeUpdater;