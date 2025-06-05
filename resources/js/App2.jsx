import * as React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import NotiPage from './NotiPage';
import NotiProfile from './NotiProfile';
import Stats from './Stats';

// Siempre enviar cookies con axios
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:8000';

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadAttempted, setReloadAttempted] = useState(false);

  useEffect(() => {
    // Paso 1: Obtener cookie CSRF
    axios.get('/sanctum/csrf-cookie')
      .then(() => {
        // Paso 2: Verificar si el usuario está autenticado
        return axios.get('/api/user');
      })
      .then(response => {
        console.log('Authenticated user:', response.data);
        setAuthenticated(true);
        setLoading(false);
      })
      .catch(error => {
        console.warn('User not authenticated:', error);

        // Detectar error 419 (CSRF token expired)
        if (error.response && error.response.status === 419) {
          if (!reloadAttempted) {
            setReloadAttempted(true);
            // Recargar la página para intentar obtener nuevo token CSRF
            //window.location.reload();
            window.location.href = 'http://localhost:8000/
          }
        } else {
          setAuthenticated(false);
          setLoading(false);
        }
      });
  }, [reloadAttempted]);

  if (loading) return <div>Loading...</div>;

  if (!authenticated) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Session not started</h2>
        <button
          onClick={async () => {
            try {
              await axios.get('/sanctum/csrf-cookie');
              window.location.href = 'http://localhost:8000';
            } catch (error) {
              console.error('CSRF init failed:', error);
            }
          }}
        >
          Login
        </button>
      </div>
    );
  }

  const router = createBrowserRouter([
    {
      path: '/home',
      element: <NotiPage />,
      children: [
        {
          path: ':notiId',
          element: <NotiProfile />,
        },
      ],
    },
    {
      path: '/',
      element: <Navigate to="/home" replace />,
    },
  ]);

  return (
    <div>
      <RouterProvider router={router} />
      <Stats />
    </div>
  );
};

export default App;