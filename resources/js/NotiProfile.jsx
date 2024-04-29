import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Link } from "react-router-dom";
export default function NotiProfile() {
    const params = useParams();
    //const x = 'sdsdf';
    const [notis, setNotis] = useState('');
    let notis2 = [];
    useEffect(() => {
        axios.get('/api/admin/notis', {
            headers: {
                'id': '63a7cdfd-5b4a-4ad2-97cb-c21936bd8c7d',
            },
        })
            .then(response => {
                setNotis(response.data.noti);
            })
            .catch(error => {
                console.error('Error fetching notis: ', error);
            });
    }, []);
    //if (notis.length >= 1) {
        for (let Key in notis) {
            notis2.push(notis[Key]);
        }

    //}
   

    return (
        <div>
           <ul>
                    {notis2.map((row) => (
                        <li>
                            {row.id}
                        </li>
                    ))}
            </ul>
        </div>
    );
};