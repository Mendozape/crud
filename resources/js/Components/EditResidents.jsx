import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';

import { MessageContext } from './MessageContext';
import { useNavigate, useParams } from 'react-router-dom';
const endpoint = 'http://localhost:8000/api/residents/';
const authHeaders = {
    headers: {
        'Authorization': 'Bearer 16|6Ll4eMbEkYq321VPmLqHOxHjEY2Jls3U9wreBqiE747f93f6',
        'Accept': 'application/json',
    },
};

export default function EditEmployee() {
    const [photo, setPhoto] = useState('');
    const [name, setName] = useState('');
    const [last_name, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [street, setStreet] = useState('');
    const [street_number, setStreetNumber] = useState('');
    const [community, setCommunity] = useState('');
    const [comments, setComments] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();
    const { setSuccessMessage, setErrorMessage } = useContext(MessageContext);
    
    const update = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(
                `${endpoint}${id}`,authHeaders,
                {
                    photo,
                    name,
                    last_name,
                    email,
                    street,
                    street_number,
                    community,
                    comments
                },
            );

            console.log('Update response:', response); // Log response for debugging

            if (response.status === 200) {
                setSuccessMessage('Resident updated successfully.');
                setTimeout(() => {
                    navigate('/resident');
                }, 100); // Small delay to ensure state update before navigation
            } else {
                setErrorMessage('Failed to update resident.');
            }
        } catch (error) {
            console.error('Error updating resident:', error); // Log error for debugging
            setErrorMessage('Failed to update resident.');
        }
    };

    useEffect(() => {
        const getEmployeeById = async () => {
            try {
                const response = await axios.get(`${endpoint}${id}`, authHeaders);

                console.log('Fetch response:', response); // Log response for debugging

                setPhoto(response.data.photo);
                setName(response.data.name);
                setLastName(response.data.last_name);
                setEmail(response.data.email);
                setStreet(response.data.street);
                setStreetNumber(response.data.street_number);
                setCommunity(response.data.community);
                setComments(response.data.comments);
            } catch (error) {
                console.error('Error fetching resident:', error); // Log error for debugging
                setErrorMessage('Failed to fetch resident.');
            }
        };
        getEmployeeById();
    }, [id, setErrorMessage]);

    return (
        
        <div>
            <h2>Edit Resident</h2>
            <form onSubmit={update}>
                <div className='mb-3'>
                    <label className='form-label'>Photo</label>
                    <input 
                        value={photo} 
                        onChange={(e) => setPhoto(e.target.value)}
                        type='text'
                        className='form-control'
                    />
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Name</label>
                    <input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        type='text'
                        className='form-control'
                    />
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Last Name</label>
                    <input 
                        value={last_name} 
                        onChange={(e) => setLastName(e.target.value)}
                        type='text'
                        className='form-control'
                    />
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Email</label>
                    <input 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        type='text'
                        className='form-control'
                    />
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Street</label>
                    <input 
                        value={street} 
                        onChange={(e) => setStreet(e.target.value)}
                        type='text'
                        className='form-control'
                    />
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Street Number</label>
                    <input 
                        value={street_number} 
                        onChange={(e) => setStreetNumber(e.target.value)}
                        type='text'
                        className='form-control'
                    />
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Community</label>
                    <input 
                        value={community} 
                        onChange={(e) => setCommunity(e.target.value)}
                        type='text'
                        className='form-control'
                    />
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Comments</label>
                    <input 
                        value={comments} 
                        onChange={(e) => setComments(e.target.value)}
                        type='text'
                        className='form-control'
                    />
                </div>
                <button type='submit' className='btn btn-success'>Update</button>
            </form>
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
        </div>
    );
}