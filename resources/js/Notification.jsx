//import React from 'react';
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client'
import axios from 'axios';
const Notifications = () => {
    const [isAdmin, setIsAdmin] = useState(0);
	useEffect(() => {
		axios.get('/api/admin/isAdmin')
			.then(response => {
				setIsAdmin(response.data.admin);
			})
			.catch(error => {
				console.error('Error fetching admin: ', error);
			});
	}, []);
    
    let x,loop;
    if (isAdmin) {
        notis.forEach((user, index) => {
            loop += `s`
        });
      } else {
        x = 'No es admin';
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
                                <div className="card-body" id="notis">
                                    {loop}
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


