import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Link } from "react-router-dom";
export default function NotiProfile() {
    const params = useParams();
    const [setNotis] = useState('');
    //let notis = [];
    useEffect(() => {
        axios.get('/api/admin/isAdmin')
            .then(response => {
                setNotis(response.data);
            })
            .catch(error => {
                console.error('Error fetching notis: ', error);
            });
    }, []);

    if (isAdmin.length >= 1) {
        for (let Key in isAdmin) {
            notis.push(isAdmin[Key]);
        }

    }

    return (
        <div>
            <h1>{params.notiId}</h1>
        </div>
    );
};