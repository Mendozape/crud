/*import React from 'react';
import ReactDOM from 'react-dom';
import App from './example';

ReactDOM.render(
<App />,
document.getElementById('notifications')
);*/

import * as React from "react";
import * as ReactDOM from "react-dom/client";
import NotiPage from './NotiPage';
import NotiProfile from './NotiProfile';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/home",
    element: <NotiPage />,
    children:[
        {
            path: "/home/:notiId",
            element: <NotiProfile />,
        },
    ],
  },

]);

ReactDOM.createRoot(document.getElementById("notifications")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);


