import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
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