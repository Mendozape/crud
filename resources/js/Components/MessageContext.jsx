import React, { createContext, useState } from 'react';

export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    return (
        <MessageContext.Provider value={{ successMessage, setSuccessMessage, errorMessage, setErrorMessage }}>
            {children}
        </MessageContext.Provider>
    );
};