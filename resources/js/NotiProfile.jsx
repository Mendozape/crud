import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link} from 'react-router-dom';
axios.defaults.withCredentials = true;
const getCsrfToken = async () => {
    try {
        await axios.get('/sanctum/csrf-cookie');
    } catch (error) {
        console.error('Error fetching CSRF token: ', error);
    }
};
export default function NotiProfile() {
    const params = useParams();
    let notiId = params.notiId;
    const [notis, setNotis] = useState({});
    let notis2 = [];
    useEffect(() => {
        const fetchNotification  = async () => {
            try {
                await getCsrfToken(); // Fetch CSRF token
                const response = await axios.get(`/api/admin/notis/${notiId}`, {
                    method: 'GET', 
                    headers: {
                        'Authorization': 'Bearer 7|ug88Mtx7ClbpdxQUayEY8HY0z8sw6mGsWZeQAQNPe275265b',
                        'Accept': 'application/json',
                    },
                });
                if (response.data && response.data.noti) {
                    setNotis(response.data.noti);
                } else {
                    setNotis([]); // Handle the case when admin data is not present
                }
            } catch (error) {
                console.error('Error fetching admin: ', error);
                setNotis([]); // Handle the case when there is an error
            }
        };
        fetchNotification ();
    }, [notiId]);
    for (let Key in notis) {
        notis2.push(notis[Key]);
    }
    return (
        <div >
            {
                notis2.map((row) => (
                    row.id
                ))
            }

        </div>
    );
};