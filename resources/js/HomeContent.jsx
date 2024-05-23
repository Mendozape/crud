/*import React from 'react';
import { createRoot } from 'react-dom/client'
export default function TopNav() {
    return (
        <>
            testing
        </>
    );
}
if (document.getElementById('content')) {
    createRoot(document.getElementById('content')).render(<TopNav />)
}*/

import * as React from "react";
import * as ReactDOM from "react-dom/client";

import NotiPage from './NotiPage';
import NotiProfile from './NotiProfile';
//import example from './example';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
 
  {
    path: '/home',
    element: <NotiPage />,
    children:[
        {
            path: '/home:notiId',
            element: <NotiProfile />,
        },
    ],
  },

]);

ReactDOM.createRoot(document.getElementById("Principal")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

