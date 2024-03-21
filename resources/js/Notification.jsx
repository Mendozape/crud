//import React from 'react';
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client'
import axios from 'axios';
const Notifications = () => {
    const [isAdmin, setIsAdmin] = useState(0);
    const [tifs, setTifs] = useState(0);
    const seasons = ["Spring", "Summer", "Autumn", "Winter"];
    
    //const tifs = {1: 'Joe', 2: 'Jane'};
    //const tifs = {};
    //const tifs2 = {1: 'Joe', 2: 'Jane'};
    //const tifs3 = {1: 'Joe2', 2: 'Jane2'};
    //tifs = tifs2;
    //tifs = tifs3;
    let seasonsList = [];
    let tifOptions = [];

    useEffect(() => {
        axios.get('/api/admin/isAdmin')
            .then(response => {
                setIsAdmin(response.data.admin);
                //setTifs(response.data.notis);
            })
            .catch(error => {
                console.error('Error fetching admin: ', error);
            });
    }, []);

    seasons.forEach((season, index) => {
        seasonsList.push(<li key={index}>{season}</li>);
      });

      Object.keys(tifs).forEach(function(key) {
        //tifOptions.push(<li key={key}>{tifs[key]}</li>);
        tifOptions.push(<li key={tifs.id}>{tifs.name}</li>);
    });


    return (
        <>
            <section className="section">
                <div className="section-header" align="center">
                    <h1>Notifications</h1>
                </div>
                <div className="section-body mt-2">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="card">
                                <div className="card-body" >
                                {tifOptions}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>

    );
};
export default Notifications;

//}
if (document.getElementById('notifications')) {
    createRoot(document.getElementById('notifications')).render(<Notifications />)
}


