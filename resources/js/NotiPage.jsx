import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client'
import axios from 'axios';
import {Link} from "react-router-dom";

export default function Notifications() {
    /*const [isAdmin, setIsAdmin] = useState('');
    let notis = [ ];
    let notis2 = '';
    let notis3 = '';
    useEffect(() => {
        axios.get('/api/admin/isAdmin')
            .then(response => {
                setIsAdmin(response.data.admin);
                //setNotis(response.data);
            })
            .catch(error => {
                console.error('Error fetching admin: ', error);
            });
    }, []);

    if(isAdmin.length>=1){
        for (let Key in isAdmin) {
            notis.push(isAdmin[Key]);
        }
        
    }*/
    const notis=[1,2,3,4,5];
    return (
        <div className="flex flex-col gap-2">
            {notis.map((row) => (
                    <Link key={row} to={`/profiles/${row}`}>Noti {row} </Link>
            ))}
        </div>
    );
};