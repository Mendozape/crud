// Stats.jsx (Final version: returns NULL if no stats permissions are found)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import usePermission from '../hooks/usePermission'; 

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


// The component now accepts 'user' via props from App.jsx
export default function Stats({ user }) { 
    const [userCount, setUserCount] = useState(0);
    const [residentCount, setResidentCount] = useState(0);
    const [roleCount, setRoleCount] = useState(0);

    // 1. Initialize the permission hook
    const { can } = usePermission(user);
    
    // 2. Define specific permission checks
    const canSeeUsers = can('Ver-usuarios');
    const canSeeResidents = can('Ver-residentes');
    const canSeeRoles = can('Ver-roles');
    
    // Check if the user can see AT LEAST ONE box
    const canSeeAnyStats = canSeeUsers || canSeeResidents || canSeeRoles;
    
    // Fetch data only if the user has permission to see ANY stat box
    useEffect(() => {
        // If the user can't see anything, we skip the API call
        if (!canSeeAnyStats) {
            setUserCount(0);
            setResidentCount(0);
            setRoleCount(0);
            return; 
        }

        const fetchCounts = async () => {
            try {
                await getCsrfToken();

                // Make authenticated request to the /api/users/count endpoint
                const response = await axios.get('/api/users/count', {
                    withCredentials: true,
                    headers: {
                        Accept: 'application/json',
                    },
                });

                if (
                    response.data &&
                    response.data.userCount !== undefined &&
                    response.data.residentCount !== undefined &&
                    response.data.roleCount !== undefined
                ) {
                    setUserCount(response.data.userCount);
                    setResidentCount(response.data.residentCount);
                    setRoleCount(response.data.roleCount);
                }
            } catch (error) {
                console.error('Error fetching counts:', error);
                setUserCount(0);
                setResidentCount(0);
                setRoleCount(0);
            }
        };

        fetchCounts();
    }, [canSeeAnyStats]);

    // 3. 🚨 CRITICAL CHANGE: If the user cannot see ANY stats, return NULL.
    // Returning null prevents React from rendering anything in the main content area.
    if (!canSeeAnyStats) {
        return null; 
    }

    // --- Content to display ONLY if the user can see AT LEAST ONE box ---
    return (
        <section className="section" align="center">
            <div className="section-body">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="card">
                            <div className="card-body">
                                <div className="row">
                                    
                                    {/* USER STATS BOX: Only shown if the user has 'Ver-usuarios' */}
                                    {canSeeUsers && (
                                        <div className="col-md-4 col-xl-4">
                                            <div className="card bg-success text-white p-2">
                                                <div className="card-subtitle">
                                                    <h5>Usuarios</h5>
                                                    <h2 className="text-left">
                                                        <i className="fa fa-users fa-1x" />
                                                        <span style={{ float: 'right' }}>{userCount}</span>
                                                    </h2>
                                                    <p className="m-b-0 text-right">
                                                        <a href="/users" className="text-white">Ver más</a>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* RESIDENT STATS BOX: Only shown if the user has 'Ver-residentes' */}
                                    {canSeeResidents && (
                                        <div className="col-md-4 col-xl-4">
                                            <div className="card bg-secondary text-white p-2">
                                                <div className="card-subtitle">
                                                    <h5>Residentes</h5>
                                                    <h2 className="text-left">
                                                        <i className="fa fa-user" />
                                                        <span style={{ float: 'right' }}>{residentCount}</span>
                                                    </h2>
                                                    <p className="m-b-0 text-right">
                                                        <a href="/residents" className="text-white">Ver más</a>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* ROLES STATS BOX: Only shown if the user has 'Ver-roles' */}
                                    {canSeeRoles && (
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
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}