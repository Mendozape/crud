import React from 'react';
import { createRoot } from 'react-dom/client';


export default function Xyz() {
    return (
        <>
            lato
        </>
    );
}
if (document.getElementById('Residentes')) {
    createRoot(document.getElementById('Residentes')).render(<Xyz />)
}