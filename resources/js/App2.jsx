import * as React from "react";
import { useEffect } from "react";
import axios from "axios";
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
            path: ':notiId',
            element: <NotiProfile />,
        },
    ],
  },
]);

const App = () => {
  useEffect(() => {
    const storedToken = localStorage.getItem('api_token');
    if (!storedToken) {
      // No token found, perform login to get it
      axios.post('http://localhost:8000/api/login', {
        email: 'admin@gmail.com',
        password: '12345678'
      })
      .then(response => {
        const token = response.data.token;
        if (token) {
          localStorage.setItem('api_token', token);
          console.log('Token obtained and saved:', token);
        } else {
          console.warn('No token received in login response.');
        }
      })
      .catch(error => {
        console.error('Error during login to obtain token:', error);
      });
    } else {
      console.log('Token already exists in localStorage:', storedToken);
    }
  }, []); // <-- Aquí están los corchetes de dependencias vacíos, para que se ejecute solo una vez

  return (
    <div>
      <RouterProvider router={router} />
      <Stats />
    </div>
  );
};

export default App;