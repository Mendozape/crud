import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { MessageContext } from './MessageContext';
import { useNavigate, useParams } from 'react-router-dom';

const endpoint = 'http://localhost:8000/api/residents/';
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
const authHeaders = {
    headers: {
        'Authorization': 'Bearer 10|EJMHhmbcokzK3qxHHjOwypwB1r0RqXwv264VnP4r3068ecb9',
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
        'X-CSRF-TOKEN': csrfToken
    },
};

export default function EditEmployee() {
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // New state for loading status
    const [name, setName] = useState('');
    const [last_name, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [street, setStreet] = useState('');
    const [street_number, setStreetNumber] = useState('');
    const [community, setCommunity] = useState('');
    const [comments, setComments] = useState('');
    const [formValidated, setFormValidated] = useState(false);
    const [errors, setErrors] = useState({});
    const [showModal, setShowModal] = useState(false);
    const { id } = useParams();
    const { setSuccessMessage, setErrorMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        if (photo) {
            formData.append('photo', photo);
        }
        formData.append('name', name);
        formData.append('last_name', last_name);
        formData.append('email', email);
        formData.append('street', street);
        formData.append('street_number', street_number);
        formData.append('community', community);
        formData.append('comments', comments || null);
        formData.append('_method', 'PUT'); // Add this line
        // Log formData contents
        try {
            const response = await axios.post(`${endpoint}${id}`, formData, authHeaders);
            console.log('Response data:', response.data);
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
        } finally {
            setShowModal(false);
        }
    };

    const update = (e) => {
        e.preventDefault();
        setShowModal(true);
    };

    useEffect(() => {
        const getEmployeeById = async () => {
            try {
                const response = await axios.get(`${endpoint}${id}`, authHeaders);
                setPhoto(response.data.photo);
                setName(response.data.name);
                setLastName(response.data.last_name);
                setEmail(response.data.email);
                setStreet(response.data.street);
                setStreetNumber(response.data.street_number);
                setCommunity(response.data.community);
                setComments(response.data.comments);
            } catch (error) {
                console.error('Error fetching resident:', error);
                setErrorMessage('Failed to fetch resident.');
            }
        };
        getEmployeeById();
    }, [id, setErrorMessage]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setIsLoading(true); // Set loading to true
        setPhoto(file);
        setPhotoPreview(null); // Clear the previous photo preview
        setTimeout(() => {
            setPhotoPreview(URL.createObjectURL(file));
            setIsLoading(false); // Set loading to false after 2 seconds
        }, 500);
    };

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
                    <label className='form-label'>Photo</label><br />
                    <input 
                        onChange={handleFileChange}
                        type='file'
                        id='fileInput'
                        className={`form-control d-none ${errors.photo ? 'is-invalid' : ''}`} // Hide default input
                    />
                    <label htmlFor='fileInput' className='btn btn-primary'>Select Image</label> {/* Custom label */}
                    {errors.photo && <div className="invalid-feedback">{errors.photo[0]}</div>}
                    {isLoading ? (
                        <div className='mt-3'>
                            <img 
                                src={`http://localhost:8000/storage/Loading_icon.gif`}
                                alt="Loading"
                                style={{ width: '50px', borderRadius: '50%' }}
                            />
                        </div>
                    ) : photoPreview ? (
                        <div className='mt-3'>
                            <img 
                                src={photoPreview} 
                                alt="New photo" 
                                style={{ width: '50px', borderRadius: '50%' }}
                            />
                        </div>
                    ) : (
                        photo && (
                            <div className='mt-3'>
                                <img 
                                    src={`http://localhost:8000/storage/${photo}`} 
                                    alt="Current photo" 
                                    style={{ width: '50px', borderRadius: '50%' }}
                                />
                            </div>
                        )
                    )}
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

            <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirm Update</h5>
                            <button type="button" className="close" aria-label="Close" onClick={() => setShowModal(false)}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to update this resident's information?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button type="button" className="btn btn-danger" onClick={handleUpdate}>Update</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}