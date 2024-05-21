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
    path: '/home',
    element: <example />,
    children:[
        {
            path: '/home/:notiId',
            element: <NotiProfile />,
        },
    ],
  },

]);

ReactDOM.createRoot(document.getElementById("content")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

