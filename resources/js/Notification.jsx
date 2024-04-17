//import React from 'react';
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client'
import axios from 'axios';
const Notifications = () => {
    const [isAdmin, setIsAdmin] = useState('');
    let x='sasdfsf';
    let xx=1;
    let notis = [ ];
    useEffect(() => {
        axios.get('/api/admin/isAdmin')
            .then(response => {
                setIsAdmin(response.data.admin);
                //setNotis(response.data);
            })
            .catch(error => {
                console.error('Error fetching admin: ', error);
            });
    }, []);

    if(isAdmin.length>=1){
        for (let movieKey in isAdmin) {
            notis.push(isAdmin[movieKey]);
        }
        
        notis = notis.map(row => (
            <>
                <li key={row.id}>[ { row.updated_at } ] User { row.data.name } has just registered.<a href='' class='float-right mark-as-read' data-id='{{ row.id }}'> Mark as read</a></li>
                
            </>
            
        ));
    }else{
        notis='no records found';
    }

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
                                {
                                xx
                                }
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


