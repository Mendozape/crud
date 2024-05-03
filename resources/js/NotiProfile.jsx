import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Link } from "react-router-dom";
export default function NotiProfile() {
    const params = useParams();
    let notiId = params.notiId;
    const [notis, setNotis] = useState({});
    //var [notis2, setNotis2] = useState([]);
    let notis2 = [];
    useEffect(() => {
            axios.get(`/api/admin/notis/${notiId}`)
                .then(response => {
                    setNotis(response.data.noti);
                })
                .catch(error => {
                    console.error('Error fetching notis: ', error);
                });
    }, [notiId]);// execute 
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