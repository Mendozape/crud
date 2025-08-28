import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Enable Axios to send cookies automatically
axios.defaults.withCredentials = true;

// Function to get CSRF token for Laravel Sanctum
const getCsrfToken = async () => {
    try {
        await axios.get('/sanctum/csrf-cookie');
        console.log('CSRF token fetched successfully');
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
    }
};

export default function UserCount() {
    const [userCount, setUserCount] = useState(0);
    const [clientCount, setClientCount] = useState(0);
    const [roleCount, setRoleCount] = useState(0);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                // Get CSRF token first
                await getCsrfToken();

                // Make authenticated request with cookies
                const response = await axios.get('/api/users/count', {
                    withCredentials: true,
                    headers: {
                        Accept: 'application/json',
                    },
                });

                if (
                    response.data &&
                    response.data.userCount !== undefined &&
                    response.data.clientCount !== undefined &&
                    response.data.roleCount !== undefined
                ) {
                    setUserCount(response.data.userCount);
                    setClientCount(response.data.clientCount);
                    setRoleCount(response.data.roleCount);
                } else {
                    // If the response is missing expected values
                    setUserCount(0);
                    setClientCount(0);
                    setRoleCount(0);
                }
            } catch (error) {
                console.error('Error fetching user count:', error);
                setUserCount(0);
                setClientCount(0);
                setRoleCount(0);
            }
        };

        fetchCounts();
    }, []);

    return (
        <section className="section" align="center">
            <div className="section-body">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="card">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-4 col-xl-4">
                                        <div className="card bg-success text-white p-2">
                                            <div className="card-subtitle">
                                                <h5>Usuarios</h5>
                                                <h2 className="text-left">
                                                    <i className="fa fa-users fa-1x" />
                                                    <span style={{ float: 'right' }}>{userCount}</span>
                                                </h2>
                                                <p className="m-b-0 text-right">
                                                    <a href="/usuarios" className="text-white">Ver más</a>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4 col-xl-4">
                                        <div className="card bg-secondary text-white p-2">
                                            <div className="card-subtitle">
                                                <h5>Personal</h5>
                                                <h2 className="text-left">
                                                    <i className="fa fa-user" />
                                                    <span style={{ float: 'right' }}>{clientCount}</span>
                                                </h2>
                                                <p className="m-b-0 text-right">
                                                    <a href="/client" className="text-white">Ver más</a>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4 col-xl-4">
                                        <div className="card bg-info text-white p-2">
                                            <div className="card-subtitle">
                                                <h5>Roles</h5>
                                                <h2 className="text-left">
                                                    <i className="fa fa-user-lock" />
                                                    <span style={{ float: 'right' }}>{roleCount}</span>
                                                </h2>
                                                <p className="m-b-0 text-right">
                                                    <a href="/roles" className="text-white">Ver más</a>
                                                </p>
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
    );
}