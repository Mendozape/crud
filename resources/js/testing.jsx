import React from 'react';
import { createRoot } from 'react-dom/client'
export default function TopNav() {
    return (
        <>
            testing 2
        </>
    );
}
if (document.getElementById('content')) {
    createRoot(document.getElementById('content')).render(<TopNav />)
}