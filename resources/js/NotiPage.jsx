import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client'
import axios from 'axios';
import { NavLink, Outlet } from "react-router-dom";

export default function Notifications() {
    const [isAdmin, setIsAdmin] = useState('');
    let notis = [];
    useEffect(() => {
        axios.get('/api/admin/isAdmin')
            .then(response => {
                setIsAdmin(response.data.admin);
            })
            .catch(error => {
                console.error('Error fetching admin: ', error);
            });
    }, []);

    if (isAdmin.length >= 1) {
        for (let Key in isAdmin) {
            notis.push(isAdmin[Key]);
        }

    }
    return (
        <div className='flex gap-2'>
            <div className='flex flex-col gap-2'>
                <h1>Users</h1>
                <ul>
                    {notis.map((row) => (
                        <li>
                            <NavLink  to={`/home/${row.id}`}
                            >
                            {row.data.name}</NavLink>
                        </li>
                    ))}
                </ul>
            </div>

            <Outlet />
        </div>
    );
};