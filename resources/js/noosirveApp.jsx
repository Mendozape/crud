import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router-dom';

// Import pages
import Stats from './pages/Stats';
import NotiPage from './pages/Notifications/NotiPage';
import NotiProfile from './pages/Notifications/NotiProfile';
import Permissions from './pages/Permissions';
import Users from './pages/Users';
import NotificationBadgeUpdater from './components/NotificationBadgeUpdater';

// Axios configuration
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:8000";

// Component to handle navigation from Blade topnav
const BladeNavigationHandler = () => {
    const location = useLocation();
    
    useEffect(() => {
        // Sync React Router with browser URL
        // This ensures that when you click links in Blade, React Router knows about it
        const handleBladeNavigation = () => {
            // React Router will automatically detect URL changes
        };
        
        window.addEventListener('popstate', handleBladeNavigation);
        return () => window.removeEventListener('popstate', handleBladeNavigation);
    }, []);

    return null;
};

const App = () => {
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check authentication status
    useEffect(() => {
        const checkAuth = async () => {
            try {
                await axios.get("/sanctum/csrf-cookie");
                await axios.get("/api/user");
                setAuthenticated(true);
            } catch (error) {
                setAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) return <div>Loading...</div>;

    if (!authenticated) {
        return (
            <div style={{ padding: 40 }}>
                <h2>Session not started</h2>
                <button onClick={() => window.location.href = "http://localhost:8000"}>
                    Login
                </button>
            </div>
        );
    }

    // Router configuration - React Router maneja TODAS las rutas
    const router = createBrowserRouter([
        {
            path: "/home",
            element: (
                <>
                    <BladeNavigationHandler />
                    <NotificationBadgeUpdater />
                    <Stats />
                </>
            ),
        },
        {
            path: "/notificationsList",
            element: (
                <>
                    <BladeNavigationHandler />
                    <NotificationBadgeUpdater />
                    <NotiPage />
                </>
            ),
            children: [
                {
                    path: ":id",
                    element: <NotiProfile />,
                },
            ],
        },
        {
            path: "/permissions",
            element: (
                <>
                    <BladeNavigationHandler />
                    <NotificationBadgeUpdater />
                    <Permissions />
                </>
            ),
        },
        {
            path: "/users",
            element: (
                <>
                    <BladeNavigationHandler />
                    <NotificationBadgeUpdater />
                    <Users />
                </>
            ),
        },
        {
            path: "/",
            element: <Navigate to="/home" replace />,
        },
        {
            path: "*",
            element: (
                <div style={{ padding: 20 }}>
                    404 - Page Not Found
                    <br />
                    <button onClick={() => window.history.back()}>Go Back</button>
                </div>
            ),
        },
    ]);

    return <RouterProvider router={router} />;
};

export default App;