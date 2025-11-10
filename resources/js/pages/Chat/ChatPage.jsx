import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatWindow from '../../components/ChatWindow';

const ChatPage = ({ user }) => {
    const [activeContact, setActiveContact] = useState(null); 
    const [contacts, setContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Contacts Fetch
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await axios.get('/api/chat/contacts');
                setContacts(response.data.users);
            } catch (error) {
                console.error("Error fetching chat contacts:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContacts();
    }, []);

    // Real-time Listener to update contact badges
    useEffect(() => {
        if (!user?.id || !window.Echo) return;

        const userChannel = `App.Models.User.${user.id}`;

        window.Echo.private(userChannel)
            .listen('.MessageSent', (e) => {
                // When I receive a message, I increment the counter of the contact who sent it to me
                if (e.message.receiver_id === user.id) {
                    // CHANGE: Only increment if I am NOT currently viewing that contact's chat
                    const isViewingThisChat = activeContact && activeContact.id === e.message.sender_id;
                    
                    if (!isViewingThisChat) {
                        setContacts(prevContacts => 
                            prevContacts.map(contact => {
                                if (contact.id === e.message.sender_id) {
                                    return {
                                        ...contact,
                                        unread_count: (contact.unread_count || 0) + 1
                                    };
                                }
                                return contact;
                            })
                        );
                    }
                }
            });

        return () => {
            window.Echo.leave(userChannel);
        };
    }, [user?.id, activeContact]); // IMPORTANT: Add activeContact as a dependency

    // Function to handle when a contact is selected
    const handleSelectContact = (contact) => {
        setActiveContact(contact);
        
        // Reset the selected contact's counter immediately (optimistic UI)
        setContacts(prevContacts => 
            prevContacts.map(c => 
                c.id === contact.id ? { ...c, unread_count: 0 } : c
            )
        );

        // Dispatch custom event so that ChatBadgeUpdater updates the global badge
        console.log('Dispatching chat-messages-read event...');
        window.dispatchEvent(new CustomEvent('chat-messages-read'));
    };

    return (
        <div className="content-wrapper" style={{ minHeight: '80vh' }}>
            <section className="content pt-3">
                <div className="row">
                    
                    {/* Contacts Column (Sidebar) */}
                    <div className="col-md-4">
                        <div className="card card-primary card-outline">
                            <div className="card-header">
                                <h3 className="card-title">👥 Contactos</h3>
                            </div>
                            <div className="card-body p-0">
                                {isLoading && <p className="text-center p-3">Cargando usuarios...</p>}
                                <ul className="nav nav-pills flex-column">
                                    {contacts.map(contact => (
                                        <li 
                                            className="nav-item" 
                                            key={contact.id}
                                            onClick={() => handleSelectContact(contact)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <a 
                                                href="#" 
                                                className={`nav-link ${activeContact && activeContact.id === contact.id ? 'active' : ''}`}
                                                onClick={(e) => e.preventDefault()}
                                            >
                                                <i className="fas fa-user mr-2"></i> 
                                                {contact.name}
                                                
                                                {/* Unread message badge per contact */}
                                                {contact.unread_count > 0 && (
                                                    <span className="badge badge-danger float-right">
                                                        {contact.unread_count}
                                                    </span>
                                                )}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Conversation Column (Main Window) */}
                    <div className="col-md-8">
                        {activeContact ? (
                            <ChatWindow 
                                currentUserId={user.id} 
                                receiver={activeContact} 
                            />
                        ) : (
                            <div className="card card-primary card-outline">
                                <div className="card-body">
                                    <p className="text-center text-muted">Selecciona un contacto para iniciar la conversación.</p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </section>
        </div>
    );
};

export default ChatPage;