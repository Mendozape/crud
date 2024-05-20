import React from 'react';
import { createRoot } from 'react-dom/client'
export default function Show() {
    return (
        <div>
            contents asdadas
        </div>
    );
}
if (document.getElementById('Content')) {
    createRoot(document.getElementById('Content')).render(<Show />)
}