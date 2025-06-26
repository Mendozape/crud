import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, Outlet } from "react-router-dom";

// Configure Axios to include cookies in requests (needed for Laravel Sanctum)
axios.defaults.withCredentials = true;

// Function to get CSRF token from Laravel Sanctum
const getCsrfToken = async () => {
    try {
        await axios.get('/sanctum/csrf-cookie');
        console.log('CSRF token fetched successfully');
    } catch (error) {
        console.error('Error fetching CSRF token: ', error);
    }
};

export default function Notifications() {
    const [countNotis, setCountNotis] = useState([]);
    let notis = [];

    useEffect(() => {
        const fetchNotiStatus = async () => {
            try {
                // First, get the CSRF cookie (required by Sanctum)
                await getCsrfToken();

                // Then fetch countNotis status from the API
                const response = await axios.get('/api/notis/countNotis', {
                    withCredentials: true,
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                // If admin data exists, store it in state
                if (response.data && response.data.countNotis) {
                    setCountNotis(response.data.countNotis);
                } else {
                    setCountNotis([]); // If no countNotis data, set an empty array
                }
            } catch (error) {
                console.error('Error fetching admin:', error);
                setCountNotis([]); // On error, set empty array
            }
        };

        fetchNotiStatus();
    }, []);

    // Convert countNotis object to array (if needed)
    if (countNotis.length >= 1) {
        for (let key in countNotis) {
            notis.push(countNotis[key]);
        }
    }

    return (
        <div>
            <div>
                <h1>Notifications</h1>
            </div>

            <div className='d-flex'>
                {/* Sidebar with list of notifications */}
                <div>
                    <ul>
                        {notis.map((row, index) => (
                            <li key={index}>
                                <NavLink
                                    key={row.id}
                                    to={`/home/${row.id}`}
                                    className={({ isActive }) =>
                                        isActive ? 'text-danger' : ''
                                    }
                                >
                                    {row.data.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Outlet for rendering nested route */}
                <div className='ml-4'>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}