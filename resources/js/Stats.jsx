
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import axios from 'axios';
axios.defaults.withCredentials = true;
const getCsrfToken = async () => {
    try {
        await axios.get('/sanctum/csrf-cookie');
        console.log('CSRF token fetched successfully');
    } catch (error) {
        console.error('Error fetching CSRF token: ', error);
    }
};
export default function UserCount() {
    const [userCount, setUserCount] = useState(0);
    const [clientCount, setClientCount] = useState(0);
    const [roleCount, setRoleCount] = useState(0);
    useEffect(() => {
        const xxx = async () => {
            try {
                await getCsrfToken(); // Fetch CSRF token
                const response = await axios.get('/api/users/count', {
                    method: 'GET', 
                    headers: {
                        'Authorization': 'Bearer 1|2dROElpPtCeRHJafIp7Kb1CqKa5i3lQaf8uDW4NK49262ad6',
                        'Accept': 'application/json',
                    },
                });
                if (response.data && response.data.userCount && response.data.clientCount && response.data.roleCount) {
                    setUserCount(response.data.userCount);
                    setClientCount(response.data.clientCount);
                    setRoleCount(response.data.roleCount);
                } else {
                    setUserCount([]); // Handle the case when admin data is not present
                    setClientCount([]); // Handle the case when admin data is not present
                    setRoleCount([]); // Handle the case when admin data is not present
                }
            } catch (error) {
                console.error('Error fetching admin: ', error);
                setUserCount([]); // Handle the case when there is an error
                setClientCount([]); // Handle the case when there is an error
                setRoleCount([]); // Handle the case when there is an error
            }
        };
        xxx();
    }, []);
    return (
        <>
            <section className="section" align="center">
                <div className="section-header" align="center">
                    <h1>Dashboard</h1>
                </div>
                <div className="section-body">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="card">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-4 col-xl-4">
                                            <div className="card bg-success text-white p-2">
                                                <div className="card-subtitle">
                                                    <h5>Usuario</h5>
                                                    <h2 className="text-left"><i className="fa fa-users fa-1x " /><span style={{ float: 'right' }}>{userCount}</span></h2>
                                                    <p className="m-b-0 text-right"> <a href="/usuarios" className="text-white">Ver más</a></p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4 col-xl-4">
                                            <div className="card bg-secondary text-white p-2">
                                                <div className="card-subtitle ">
                                                    <h5>Personal</h5>
                                                    <h2 className="text-left"><i className="fa fa-user " /><span style={{ float: 'right' }}>{clientCount}</span></h2>
                                                    <p className="m-b-0 text-right"> <a href="/client" className="text-white">Ver más</a></p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4 col-xl-4">
                                            <div className="card bg-info text-white p-2">
                                                <div className="card-subtitle">
                                                    <h5>Roles</h5>
                                                    <h2 className="text-left"><i className="fa fa-user-lock " /><span style={{ float: 'right' }}>{roleCount}</span></h2>
                                                    <p className="m-b-0 text-right"> <a href="/roles" className="text-white">Ver más</a></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </>

    );
};
//export default UserCount;

/*
if (document.getElementById('content')) {
    createRoot(document.getElementById('content')).render(<UserCount />)
}*/