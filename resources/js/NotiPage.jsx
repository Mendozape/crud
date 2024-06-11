import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { NavLink, Outlet } from "react-router-dom";

// Set Axios to include credentials (cookies)
axios.defaults.withCredentials = true;
const getCsrfToken = async () => {
    //await axios.get('/sanctum/csrf-cookie');
    try {
        await axios.get('/sanctum/csrf-cookie');
    } catch (error) {
        console.error('Error fetching CSRF token: ', error);
    }
};

export default function Notifications() {
    const [isAdmin, setIsAdmin] = useState('');
    let notis = [];
    useEffect(() => {
        /*axios.get('/api/admin/isAdmin')
            .then(response => {
                setIsAdmin(response.data.admin);
            })
            .catch(error => {
                console.error('Error fetching admin: ', error);
            });*/
            const fetchAdminStatus = async () => {
                try {
                    await getCsrfToken(); // Fetch CSRF token
                    const token = localStorage.getItem('authToken');
                    const response = await axios.get('/api/admin/isAdmin', { 
                        method: 'GET',
                        mode: 'cors',
                        headers: new Headers({
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Headers': '*',
                            'Access-Control-Allow-Credentials': false,
                            //'Host': 'http://crud.mendodevelopments.com',
                            'Accept': 'application/json',
                            'Access-Control-Allow-Methods': '*',
                            'Content-Type': '*',
                            //'Content-Type': 'application/x-www-form-urlencoded',
                            //'Authorization': 'Basic '+btoa('admin@gmail.com:12345678'),
                            'Authorization': 'Bearer 13|FwQXNINKB43gniatBPZQ8fHKTZUjrWzUX8aJOZ4Da0192861',
                            //'Authorization': 'Basic '+ base64.encode('admin@gmail.com:12345678')
                        }),
                    });
                    setIsAdmin(response.data.admin);
                } catch (error) {
                    console.error('Error fetching admin: ', error);
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
                                notis.map((row) => (
                                    <li>
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