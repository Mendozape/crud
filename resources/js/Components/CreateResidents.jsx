import React, { useState, useContext } from 'react';
import axios from 'axios';
import { MessageContext } from './MessageContext';
import { useNavigate } from 'react-router-dom';

const endpoint = 'http://localhost:8000/api/residents';

// Axios options with credentials
const axiosOptions = {
    withCredentials: true,
    headers: {
        Accept: 'application/json',
    },
};

export default function CreateResidents() {
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [name, setName] = useState('');
    const [last_name, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [street, setStreet] = useState('');
    const [street_number, setStreetNumber] = useState('');
    const [community, setCommunity] = useState('');
    const [comments, setComments] = useState('');
    const [formValidated, setFormValidated] = useState(false);

    const { setSuccessMessage, setErrorMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    const store = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (form.checkValidity() === false) {
            e.stopPropagation();
            setErrorMessage('Please fill out all required fields.');
        } else {
            const formData = new FormData();
            formData.append('photo', photo);
            formData.append('name', name);
            formData.append('last_name', last_name);
            formData.append('email', email);
            formData.append('street', street);
            formData.append('street_number', street_number);
            formData.append('community', community);
            formData.append('comments', comments);

            try {
                await axios.post(endpoint, formData, axiosOptions);
                setSuccessMessage('Resident created successfully.');
                setErrorMessage('');
                navigate('/residents');
            } catch (error) {
                setErrorMessage('Failed to create resident.');
                console.error('Error creating resident:', error);
            }
        }
        setFormValidated(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const handleRemoveImage = () => {
        setPhoto(null);
        setPhotoPreview(null);
    };

    return (
        <div>
            <h2>Crear residente</h2>
            <form onSubmit={store} noValidate className={formValidated ? 'was-validated' : ''}>
                <div className="col-md-12 mt-4">
                    {errorMessage && (
                        <div className="alert alert-danger text-center">
                            {errorMessage}
                        </div>
                    )}
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Photo</label><br />
                    <input
                        onChange={handleFileChange}
                        type='file'
                        id='fileInput'
                        className='form-control d-none'
                    />
                    <div className="invalid-feedback">
                        Please provide a photo.
                    </div>
                    <label htmlFor='fileInput' className='btn btn-primary'>Selecciona la imagen</label> <br />
                    {photoPreview && (
                        <div className='position-relative mt-3' style={{ display: 'inline-block' }}>
                            <img
                                src={photoPreview}
                                alt="New photo"
                                style={{ width: '100px', borderRadius: '50%' }}
                            />
                            <button
                                type="button"
                                className="btn btn-sm btn-danger position-absolute top-0 end-0 border-0 bg-transparent text-dark"
                                style={{
                                    transform: 'translate(50%, -50%)',
                                    borderRadius: '50%',
                                    fontSize: '1.5rem',
                                    color: '#000'
                                }}
                                onClick={handleRemoveImage}
                            >
                                &times;
                            </button>
                        </div>
                    )}
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
                    />
                </div>
                <button type='submit' className='btn btn-success'>Save</button>
            </form>
        </div>
    );
}
