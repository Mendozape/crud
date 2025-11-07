import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatWindow from '../../components/ChatWindow'; // Necesitaremos crear este
// Asumo que tienes un componente Layout o wrapper para el contenido. 
// Usaremos un div simple por ahora.

const ChatPage = ({ user }) => {
    // Estado para el usuario que está chateando actualmente (la "conversación activa")
    const [activeContact, setActiveContact] = useState(null); 
    // Estado para la lista de usuarios/contactos
    const [contacts, setContacts] = useState([]);
    // Estado para saber si la lista de contactos está cargando
    const [isLoading, setIsLoading] = useState(true);

    // 1. Fetch de Contactos Iniciales
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                // Aquí usamos la API que definimos en el paso anterior (pero sin implementar la lógica en Laravel aún)
                // Usaremos /api/chat/contacts
                const response = await axios.get('/api/chat/contacts');
                setContacts(response.data.users); // Asumiendo que Laravel regresa un objeto { users: [...] }
            } catch (error) {
                console.error("Error fetching chat contacts:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContacts();
    }, []);

    // La interfaz del chat de dos columnas
    return (
        <div className="content-wrapper" style={{ minHeight: '80vh' }}>
            <section className="content pt-3">
                <div className="row">
                    
                    {/* Columna de Contactos (Sidebar) */}
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
                                            onClick={() => setActiveContact(contact)} // <-- Función para seleccionar contacto
                                        >
                                            <a 
                                                href="#" 
                                                className={`nav-link ${activeContact && activeContact.id === contact.id ? 'active' : ''}`}
                                            >
                                                <i className="fas fa-user mr-2"></i> {contact.name}
                                                {/* Aquí se podría añadir un badge con mensajes no leídos */}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Columna de Conversación (Main Window) */}
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