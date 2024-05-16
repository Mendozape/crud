import React from 'react';
import { createRoot } from 'react-dom/client'
export default function Xxx() {
    return (
        <div>
            content
        </div>
    );
}
if (document.getElementById('yyy')) {
    createRoot(document.getElementById('yyy')).render(<Xxx />)
}