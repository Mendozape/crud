import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { MessageContext } from './MessageContext';
import { useNavigate, useParams } from 'react-router-dom';

const endpoint = 'http://localhost:8000/api/residents/';
const authHeaders = {
    headers: {
        'Authorization': 'Bearer 8|igEN76fA7W3Z9CTD4gM0ZIn2r3OS6bCS4oDAkpTO496bef4d',
        'Accept': 'application/json',
    },
};
// Enhanced email validation regex
//const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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
        const form = e.currentTarget;
        /*let validationErrors = {};
        // Check custom email validation
        if (!email) {
            validationErrors.email = 'Email is required.';
        } else if (!emailRegex.test(email)) {
            validationErrors.email = 'Please provide a valid email address.';
            return;
        }
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setErrorMessage('Please fix the errors in the form.');
            return;
        }*/
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setErrorMessage('Please fill out all required fields.');
        } else {
            try {
                const response = await axios.put(
                    `${endpoint}${id}`,
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
                    authHeaders
                );
                //console.log('Update response:', response); // Log response for debugging
                if (response.status === 200) {
                    setSuccessMessage('Resident updated successfully.');
                    setErrorMessage('');
                    navigate('/resident');
                } else {
                    setErrorMessage('Failed to update resident.');
                    //setErrors(response.data.errors || {});
                    //console.log('a');
                }
            } catch (error) {
                console.error('Error updating resident:', error); // Log error for debugging
                //setErrors(error.data.errors);
                //console.log('b');
                /*if (error.response && error.response.data && error.response.data.errors) {
                    setErrors(error.response.data.errors);
                } else {
                    setErrorMessage('Failed to update resident.');
                }*/
            }
        }
        setFormValidated(true);
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
                        Please provide a comment.
                    </div>
                </div>
                <button type='submit' className='btn btn-success'>Update</button>
            </form>
        </div>
    );
}