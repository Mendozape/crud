
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
const UserCount = () => {
    const [userCount, setUserCount] = useState(0);
    const [clientCount, setClientCount] = useState(0);
    const [roleCount, setRoleCount] = useState(0);
    useEffect(() => {
        axios.get('/api/users/count')
            .then(response => {
                setUserCount(response.data.userCount);
                setClientCount(response.data.clientCount);
                setRoleCount(response.data.roleCount);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
            });
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
export default UserCount;

/*
if (document.getElementById('content')) {
    createRoot(document.getElementById('content')).render(<UserCount />)
}*/