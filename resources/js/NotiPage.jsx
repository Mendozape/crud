import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { NavLink, Outlet } from "react-router-dom";
//import './bootstrap';

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
    //let notis = [1,2,3,4,5,6];
    return (
        <div className='flex gap-2'>
            <div className='flex flex-col gap-2'>
                <h1>Notifications</h1>
                <ul>
                    {
                        notis.map((row) => (
                            <li>
                                <NavLink key={row.id} to={`/home/${row.id}`}
                                    className={({ isActive }) => {
                                        return isActive ? '' : 'text-primary-700';
                                    }}
                                >
                                    {row.data.name}</NavLink>
                            </li>
                        ))
                    }
                </ul>
            </div>
            <Outlet />
        </div>
    );
};