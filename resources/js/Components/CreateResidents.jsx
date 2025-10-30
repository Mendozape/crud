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
            setErrorMessage('Por favor, complete todos los campos obligatorios.');
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
                setSuccessMessage('Residente creado exitosamente.');
                setErrorMessage('');
                navigate('/residents');
            } catch (error) {
                setErrorMessage('Fallo al crear el residente.');
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
                    <label className='form-label'>Foto</label><br />
                    <input
                        onChange={handleFileChange}
                        type='file'
                        id='fileInput'
                        className='form-control d-none'
                    />
                    <div className="invalid-feedback">
                        Por favor, suba una foto.
                    </div>
                    <label htmlFor='fileInput' className='btn btn-primary'>Selecciona la imagen</label> <br />
                    {photoPreview && (
                        <div className='position-relative mt-3' style={{ display: 'inline-block' }}>
                            <img
                                src={photoPreview}
                                alt="Nueva foto"
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
                    <label className='form-label'>Nombre</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        type='text'
                        className='form-control'
                        required
                    />
                    <div className="invalid-feedback">
                        Por favor, ingrese un nombre.
                    </div>
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Apellido</label>
                    <input
                        value={last_name}
                        onChange={(e) => setLastName(e.target.value)}
                        type='text'
                        className='form-control'
                        required
                    />
                    <div className="invalid-feedback">
                        Por favor, ingrese un apellido.
                    </div>
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Correo Electrónico</label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type='email'
                        className='form-control'
                        required
                    />
                    <div className="invalid-feedback">
                        Por favor, ingrese un correo electrónico válido.
                    </div>
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Calle</label>
                    <input
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        type='text'
                        className='form-control'
                        required
                    />
                    <div className="invalid-feedback">
                        Por favor, ingrese una calle.
                    </div>
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Número de Calle</label>
                    <input
                        value={street_number}
                        onChange={(e) => setStreetNumber(e.target.value)}
                        type='text'
                        className='form-control'
                        required
                    />
                    <div className="invalid-feedback">
                        Por favor, ingrese un número de calle.
                    </div>
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Comunidad</label>
                    <input
                        value={community}
                        onChange={(e) => setCommunity(e.target.value)}
                        type='text'
                        className='form-control'
                        required
                    />
                    <div className="invalid-feedback">
                        Por favor, ingrese una comunidad.
                    </div>
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Comentarios</label>
                    <input
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        type='text'
                        className='form-control'
                    />
                </div>
                <button type='submit' className='btn btn-success'>Guardar</button>
            </form>
        </div>
    );
}