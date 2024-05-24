import * as React from "react";
import * as ReactDOM from "react-dom/client";
import NotiPage from './NotiPage';
import NotiProfile from './NotiProfile';
import Stats from './Stats';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
const notis = createBrowserRouter([
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
    <RouterProvider router={notis} />
    <Stats />
  </React.StrictMode>
);

