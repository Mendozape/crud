import React, { useState, useContext } from 'react';
import axios from 'axios';
import { MessageContext } from './MessageContext';
import { useNavigate } from 'react-router-dom';

const endpoint = 'http://localhost:8000/api/residents';
const authHeaders = {
    headers: {
        'Authorization': 'Bearer 8|igEN76fA7W3Z9CTD4gM0ZIn2r3OS6bCS4oDAkpTO496bef4d',
        'Accept': 'application/json',
    },
};

export default function CreateResidents() {
    const [photo, setPhoto] = useState('');
    const [name, setName] = useState('');
    const [last_name, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [street, setStreet] = useState('');
    const [street_number, setStreetNumber] = useState('');
    const [community, setCommunity] = useState('');
    const [comments, setComments] = useState('');
    const [formValidated, setFormValidated] = useState(false);

    const { setSuccessMessage, setErrorMessage,errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    const store = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (form.checkValidity() === false) {
            e.stopPropagation();
            setErrorMessage('Please fill out all required fields.');
        } else {
            try {
                await axios.post(
                    endpoint,
                    {
                        photo,
                        name,
                        last_name,
                        email,
                        street,
                        street_number,
                        community,
                        comments,
                    },
                    authHeaders
                );
                setSuccessMessage('Resident created successfully.');
                setErrorMessage('');
                navigate('/resident');
            } catch (error) {
                setErrorMessage('Failed to create resident.');
                console.error('Error creating resident:', error);
            }
        }
        setFormValidated(true);
    };

    return (
        <div>
            <h2>Create a new resident</h2>
            <form onSubmit={store} noValidate className={formValidated ? 'was-validated' : ''}>
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
                        required
                    />
                    <div className="invalid-feedback">
                        Please provide a photo.
                    </div>
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Name</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        type='text'
                        className='form-control'
                        required
                    />
                    <div className="invalid-feedback">
                        Please provide a name.
                    </div>
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Last Name</label>
                    <input
                        value={last_name}
                        onChange={(e) => setLastName(e.target.value)}
                        type='text'
                        className='form-control'
                        required
                    />
                    <div className="invalid-feedback">
                        Please provide a last name.
                    </div>
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Email</label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type='email'
                        className='form-control'
                        required
                    />
                    <div className="invalid-feedback">
                        Please provide a valid email.
                    </div>
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Street</label>
                    <input
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        type='text'
                        className='form-control'
                        required
                    />
                    <div className="invalid-feedback">
                        Please provide a street.
                    </div>
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Street Number</label>
                    <input
                        value={street_number}
                        onChange={(e) => setStreetNumber(e.target.value)}
                        type='text'
                        className='form-control'
                        required
                    />
                    <div className="invalid-feedback">
                        Please provide a street number.
                    </div>
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Community</label>
                    <input
                        value={community}
                        onChange={(e) => setCommunity(e.target.value)}
                        type='text'
                        className='form-control'
                        required
                    />
                    <div className="invalid-feedback">
                        Please provide a community.
                    </div>
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Comments</label>
                    <input
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        type='text'
                        className='form-control'
                        required
                    />
                    <div className="invalid-feedback">
                        Please provide comments.
                    </div>
                </div>
                <button type='submit' className='btn btn-success'>Save</button>
            </form>
        </div>
    );
}
