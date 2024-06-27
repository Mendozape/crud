import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { MessageContext } from './MessageContext';
import { useNavigate, useParams } from 'react-router-dom';

const endpoint = 'http://localhost:8000/api/residents/';
const authHeaders = {
    headers: {
        'Authorization': 'Bearer 18|WGDD3jEWLmoJf72usSGuInbrVYTqX9b9CtsAV0kfaa8c1bae',
        'Accept': 'application/json',
    },
};
//in this file i am  using backend  validation (laravel) and bootstrap to show the invalid messages in the frontend
export default function EditEmployee() {
    const [photo, setPhoto] = useState('');
    const [name, setName] = useState('');
    const [last_name, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [street, setStreet] = useState('');
    const [street_number, setStreetNumber] = useState('');
    const [community, setCommunity] = useState('');
    const [comments, setComments] = useState('');
    const [formValidated, setFormValidated] = useState(false);
    const [errors, setErrors] = useState({});
    const { id } = useParams();
    const { setSuccessMessage, setErrorMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    const update = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(
                `${endpoint}${id}`,
                {
                    photo: photo || null,
                    name,
                    last_name,
                    email,
                    street,
                    street_number,
                    community,
                    comments: comments || null
                },
                authHeaders
            );
            if (response.status === 200) {
                setSuccessMessage('Resident updated successfully.');
                setErrorMessage('');
                navigate('/resident');
            } else {
                setErrorMessage('Failed to update resident.');
            }
        } catch (error) {
            console.error('Error updating resident:', error);
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrorMessage('Failed to update resident.');
            }
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
            <form onSubmit={update} noValidate className={formValidated ? 'was-validated' : ''}>
                <div className="col-md-12 mt-4">
                    {errorMessage && (
                        <div className="alert alert-danger text-center">
                            {errorMessage}
                        </div>
                    )}
                </div>
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
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name[0]}</div>}
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Last Name</label>
                    <input 
                        value={last_name} 
                        onChange={(e) => setLastName(e.target.value)}
                        type='text'
                        className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                    />
                    {errors.last_name && <div className="invalid-feedback">{errors.last_name[0]}</div>}
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Email</label>
                    <input 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        type='email'
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email[0]}</div>}
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Street</label>
                    <input
                        value={street} 
                        onChange={(e) => setStreet(e.target.value)}
                        type='text'
                        className={`form-control ${errors.street ? 'is-invalid' : ''}`}
                    />
                    {errors.street && <div className="invalid-feedback">{errors.street[0]}</div>}
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Street Number</label>
                    <input 
                        value={street_number} 
                        onChange={(e) => setStreetNumber(e.target.value)}
                        type='text'
                        className={`form-control ${errors.street_number ? 'is-invalid' : ''}`}
                    />
                    {errors.street_number && <div className="invalid-feedback">{errors.street_number[0]}</div>}
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Community</label>
                    <input 
                        value={community} 
                        onChange={(e) => setCommunity(e.target.value)}
                        type='text'
                        className={`form-control ${errors.community ? 'is-invalid' : ''}`}
                    />
                   {errors.community && <div className="invalid-feedback">{errors.community[0]}</div>}
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
        </div>
    );
}