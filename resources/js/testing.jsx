import React from 'react';
import { createRoot } from 'react-dom/client';
import Notis from './testing2';
//import Notis from './testing2';
export default function Xyz() {
    return (
        <>
            <Notis />
        </>
    );
}
if (document.getElementById('Principalx')) {
    createRoot(document.getElementById('Principalx')).render(<Xyz />)
}