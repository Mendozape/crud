import * as React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotiPage from './NotiPage';
import NotiProfile from './NotiProfile';
import Stats from './Stats';
import Navigation from './Navigation';

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

const App = () => {
    return (
      <div>
        
        <RouterProvider router={router} />
        <Stats />
      </div>
    );
  };
export default App;
