import React, { useState, useEffect } from 'react';
//import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { NavLink, Outlet } from "react-router-dom";

// Set Axios to include credentials (cookies)
axios.defaults.withCredentials = true;
const getCsrfToken = async () => {
    try {
        await axios.get('/sanctum/csrf-cookie');
        console.log('CSRF token fetched successfully');
    } catch (error) {
        console.error('Error fetching CSRF token: ', error);
    }
};

export default function Notifications() {
    const [isAdmin, setIsAdmin] = useState([]);
    let notis = [];
    useEffect(() => {
            const fetchAdminStatus = async () => {
                try {
                    await getCsrfToken(); // Fetch CSRF token
                    const response = await axios.get('/api/admin/isAdmin', {
                        method: 'GET', 
                        headers: {
                            'Authorization': 'Bearer 16|6Ll4eMbEkYq321VPmLqHOxHjEY2Jls3U9wreBqiE747f93f6',
                            'Accept': 'application/json',
                        },
                    });
                    if (response.data && response.data.admin) {
                        setIsAdmin(response.data.admin);
                    } else {
                        setIsAdmin([]); // Handle the case when admin data is not present
                    }
                } catch (error) {
                    console.error('Error fetching admin: ', error);
                    setIsAdmin([]); // Handle the case when there is an error
                }
            };
            fetchAdminStatus();
    }, []);

    if (isAdmin.length >= 1) {
        for (let Key in isAdmin) {
            notis.push(isAdmin[Key]);
        }

    }
    //let notis = [1,2,3,4,5,6];
    return (
        <>

            <div className=''>
                <div className=''>
                    <div className=''>
                        <h1>Notifications</h1>
                    </div>
                </div>
                <div className='d-flex'>
                    <div className=''>
                        <ul>
                            {
                                notis.map((row, index) => (
                                    <li key={index}>
                                        <NavLink
                                            key={row.id} 
                                            to={`/home/${row.id}`}
                                            className={({ isActive }) => {
                                                return isActive ? 'text-danger' : '';
                                            }}
                                        >
                                            {row.data.name}
                                        </NavLink>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                    <div className='ml-4
                    '>
                        <Outlet />
                    </div>
                </div>

            </div>
        </>
    );
};