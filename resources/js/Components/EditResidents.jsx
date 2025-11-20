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
    },
};

export default function EditResidents() { 
    // Form fields state
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [name, setName] = useState('');
    const [last_name, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [comments, setComments] = useState('');

    // Validation & UI
    const [formValidated, setFormValidated] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [validationWarning, setValidationWarning] = useState(false);

    const { id } = useParams();
    const { setSuccessMessage, setErrorMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    // Effect to fetch the resident's data
    useEffect(() => {
        const getResidentById = async () => {
            try {
                const response = await axios.get(`${endpoint}${id}`, axiosOptions);
                const resident = response.data; 
                
                setPhoto(resident.photo);
                setName(resident.name);
                setLastName(resident.last_name);
                setEmail(resident.email);
                setComments(resident.comments || '');
                
                if (resident.photo) {
                    const fullUrl = `http://127.0.0.1:8000/storage/${resident.photo}`;
                    setPhotoPreview(fullUrl); 
                } else {
                    setPhotoPreview(null);
                }
            } catch (error) {
                setErrorMessage('Fallo al cargar los datos del residente para editar.');
            }
        };
        getResidentById();
    }, [id, setErrorMessage]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setPhoto(file);
        if (file) {
            setPhotoPreview(URL.createObjectURL(file));
        }
    };
    
    const handleRemoveImage = () => {
        setPhoto('DELETE_PHOTO_FLAG'); 
        setPhotoPreview(null);
        const fileInput = document.getElementById('fileInputEdit');
        if (fileInput) fileInput.value = '';
    };

    const handleUpdate = async () => {
        const formData = new FormData();
        
        // CONDITIONAL PHOTO HANDLING
        if (photo instanceof File) {
            formData.append('photo', photo);
        } else if (photo === 'DELETE_PHOTO_FLAG') {
            formData.append('photo', 'DELETE'); 
        }
        
        // Standard fields
        formData.append('name', name);
        formData.append('last_name', last_name);
        formData.append('email', email);
        formData.append('comments', comments || '');
        formData.append('_method', 'PUT');

        try {
            const response = await axios.post(`${endpoint}${id}`, formData, axiosOptions);
            if (response.status === 200) {
                setSuccessMessage('Residente actualizado exitosamente.');
                setErrorMessage('');
                navigate('/residents');
            }
        } catch (error) {
            const serverErrorMsg = error.response?.data?.message || 'Fallo al actualizar el residente.';
            setErrorMessage(serverErrorMsg);
        } finally {
            setShowModal(false);
        }
    };

    const update = (e) => {
        e.preventDefault();

        setFormValidated(true);
        setErrorMessage('');
        setValidationWarning(false);

        if (!e.target.checkValidity()) {
            setValidationWarning(true);
            return;
        }

        setShowModal(true);
    };

    return (
        <div className="container mt-4">
            <h2>Editar Residente</h2>

            {errorMessage && <div className="alert alert-danger text-center">{errorMessage}</div>}

            <form onSubmit={update} noValidate className={formValidated ? 'was-validated' : ''}>
                {/* Photo */}
                <div className="form-group mb-3">
                    <label className="form-label">Foto (Opcional)</label><br />
                    
                    {/* Display current/preview photo */}
                    {photoPreview && ( 
                        <div className='position-relative mt-3' style={{ display: 'inline-block' }}>
                            <img
                                src={photoPreview} 
                                alt="Residente"
                                style={{ width: '100px', borderRadius: '50%' }}
                            />
                            {/* REMOVE BUTTON */}
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
                    
                    {/* File Input */}
                    <input
                        type="file"
                        className="form-control"
                        id="fileInputEdit"
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                </div>

                {/* Name */}
                <div className="form-group mb-3">
                    <label className="form-label">Nombre</label>
                    <input
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <div className="invalid-feedback">Por favor, ingrese el nombre.</div>
                </div>

                {/* Last Name */}
                <div className="form-group mb-3">
                    <label className="form-label">Apellidos</label>
                    <input
                        type="text"
                        className="form-control"
                        value={last_name}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                    <div className="invalid-feedback">Por favor, ingrese los apellidos.</div>
                </div>

                {/* Email */}
                <div className="form-group mb-3">
                    <label className="form-label">Correo Electrónico</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <div className="invalid-feedback">Por favor, ingrese un correo electrónico válido.</div>
                </div>

                {/* Comments */}
                <div className="form-group mb-3">
                    <label className="form-label">Comentarios</label>
                    <textarea
                        className="form-control"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        rows="3"
                    />
                </div>

                <button type="submit" className="btn btn-primary mt-3">Actualizar</button>
                <button 
                    type="button" 
                    className="btn btn-secondary mt-3 ms-2"
                    onClick={() => navigate('/residents')}
                >
                    Cancelar
                </button>
            </form>

            {/* Confirmation Modal */}
            <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog" aria-modal="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirmar Actualización</h5>
                            <button type="button" className="close" aria-label="Cerrar" onClick={() => setShowModal(false)}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            ¿Está seguro de que desea actualizar la información de este residente?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button type="button" className="btn btn-primary" onClick={handleUpdate}>Actualizar</button>
                        </div>
                    </div>
                </div>
            </div>
            {showModal && <div className="modal-backdrop fade show"></div>}

            {/* Validation Warning Modal */}
            <div className={`modal ${validationWarning ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog" aria-modal="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content border-warning">
                        <div className="modal-header bg-warning">
                            <h5 className="modal-title text-dark">Validación Requerida</h5>
                            <button type="button" className="close" aria-label="Cerrar" onClick={() => setValidationWarning(false)}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body text-dark">
                            Por favor, revise el formulario. Faltan campos obligatorios o contienen datos no válidos.
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setValidationWarning(false)}>Aceptar</button>
                        </div>
                    </div>
                </div>
            </div>
            {validationWarning && <div className="modal-backdrop fade show"></div>}
        </div>
    );
}