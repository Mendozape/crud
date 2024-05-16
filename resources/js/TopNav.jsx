import React from 'react';
import { createRoot } from 'react-dom/client'
export default function Xxx() {
    return (
        <div>
            TopNav
        </div>
    );
}
if (document.getElementById('TopNavDiv')) {
    createRoot(document.getElementById('TopNavDiv')).render(<Xxx />)
}