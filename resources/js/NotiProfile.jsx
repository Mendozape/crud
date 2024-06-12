import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client'
import axios from 'axios';
import { useParams, Link} from 'react-router-dom';
axios.defaults.withCredentials = true;
const getCsrfToken = async () => {
    try {
        await axios.get('/sanctum/csrf-cookie');
        console.log('CSRF token fetched successfully');
    } catch (error) {
        console.error('Error fetching CSRF token: ', error);
    }
};
//import { Link } from "react-router-dom";
export default function NotiProfile() {
    const params = useParams();
    let notiId = params.notiId;
    const [notis, setNotis] = useState({});
    let notis2 = [];
    useEffect(() => {
        const yyy = async () => {
            try {
                await getCsrfToken(); // Fetch CSRF token
                const response = await axios.get(`/api/admin/notis/${notiId}`, {
                    method: 'GET', 
                    headers: {
                        'Authorization': 'Bearer 16|6Ll4eMbEkYq321VPmLqHOxHjEY2Jls3U9wreBqiE747f93f6',
                        'Accept': 'application/json',
                    },
                });
                if (response.data && response.data.notis) {
                    setNotis(response.data.notis);
                } else {
                    setNotis([]); // Handle the case when admin data is not present
                }
            } catch (error) {
                console.error('Error fetching admin: ', error);
                setNotis([]); // Handle the case when there is an error
            }
        };
        yyy();
    }, []);

    for (let Key in notis) {
        notis2.push(notis[Key]);
    }


    return (
        <div key={notiId}>
            {
                //params.notiId
                notis2.map((row) => (
                    row.id
                ))
            }

        </div>
    );
};