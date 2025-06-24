import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { MessageContext } from './MessageContext';
import { useNavigate, useParams } from 'react-router-dom';

const endpoint = 'http://localhost:8000/api/residents/';

const axiosOptions = {
    withCredentials: true,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
    }
};

export default function EditEmployee() {
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
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
        if (photo instanceof File) {
            formData.append('photo', photo);
        }
        formData.append('name', name);
        formData.append('last_name', last_name);
        formData.append('email', email);
        formData.append('street', street);
        formData.append('street_number', street_number);
        formData.append('community', community);
        formData.append('comments', comments || '');
        formData.append('_method', 'PUT');

        try {
            const response = await axios.post(`${endpoint}${id}`, formData, axiosOptions);
            if (response.status === 200) {
                setSuccessMessage('Resident updated successfully.');
                setErrorMessage('');
                navigate('/resident');
            } else {
                setErrorMessage('Failed to update resident.');
            }
        } catch (error) {
            console.error('Error updating resident:', error);
            if (error.response?.data?.errors) {
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
        setFormValidated(true);
        setShowModal(true);
    };

    useEffect(() => {
        const getEmployeeById = async () => {
            try {
                const response = await axios.get(`${endpoint}${id}`, axiosOptions);
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
        setPhoto(file);
        setIsLoading(true);
        setTimeout(() => {
            setPhotoPreview(URL.createObjectURL(file));
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="container mt-4">
            <h2>Edit Resident</h2>

            <form onSubmit={update} noValidate className={formValidated ? 'was-validated' : ''}>
                {errorMessage && (
                    <div className="alert alert-danger text-center">{errorMessage}</div>
                )}

                <div className="form-group">
                    <label>Photo</label><br />
                    {(photoPreview || (photo && typeof photo === 'string')) && (
                        <img
                            src={photoPreview || `http://127.0.0.1:8000/storage/${photo}`}
                            alt="Resident"
                            style={{ width: '100px', borderRadius: '50%', marginBottom: '10px' }}
                        />
                    )}
                    <input
                        type="file"
                        className="form-control"
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                </div>

                <div className="form-group">
                    <label>Name</label>
                    <input
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Last Name</label>
                    <input
                        type="text"
                        className="form-control"
                        value={last_name}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Street</label>
                    <input
                        type="text"
                        className="form-control"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Street Number</label>
                    <input
                        type="text"
                        className="form-control"
                        value={street_number}
                        onChange={(e) => setStreetNumber(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Community</label>
                    <input
                        type="text"
                        className="form-control"
                        value={community}
                        onChange={(e) => setCommunity(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Comments</label>
                    <textarea
                        className="form-control"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                    />
                </div>

                <button type="submit" className="btn btn-primary mt-3">Submit</button>
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