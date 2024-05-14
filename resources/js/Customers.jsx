import React from 'react';
import { createRoot } from 'react-dom/client'
export default function Xxx() {
    return (
        <div>
            fsfd
        </div>
    );
}
if (document.getElementById('yyy')) {
    createRoot(document.getElementById('yyy')).render(<Xxx />)
}