import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { MessageContext } from './MessageContext';
import { useNavigate } from 'react-router-dom';

const endpoint = 'http://localhost:8000/api/residents';
const addressEndpoint = 'http://localhost:8000/api/addresses/active'; // Endpoint to fetch active catalog addresses

// Axios options with credentials
const axiosOptions = {
    withCredentials: true,
    headers: {
        Accept: 'application/json',
    },
};

export default function CreateResidents() {
    // Standard resident state
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [name, setName] = useState('');
    const [last_name, setLastName] = useState('');
    const [email, setEmail] = useState('');
    
    // NORMALIZED STATE: Stores the ID selected from the address catalog
    const [addressCatalogId, setAddressCatalogId] = useState(''); 
    
    // Retaining 'comments' state (now resident-specific comments)
    const [comments, setComments] = useState(''); 
    const [formValidated, setFormValidated] = useState(false);

    // NEW STATE: To store the list of addresses fetched from the catalog API
    const [addressList, setAddressList] = useState([]); 

    const { setSuccessMessage, setErrorMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    // Effect to fetch the list of active addresses from the catalog on component mount
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const response = await axios.get(addressEndpoint, axiosOptions);
                setAddressList(response.data.data);
            } catch (error) {
                console.error('Error fetching address catalog:', error);
                setErrorMessage('Fallo al cargar el catálogo de direcciones. No se podrá crear el residente.');
            }
        };
        fetchAddresses();
    }, []);

    const store = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        // Validation check for required fields
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setErrorMessage('Por favor, complete todos los campos obligatorios.');
        } else {
            const formData = new FormData();
            formData.append('photo', photo);
            formData.append('name', name);
            formData.append('last_name', last_name);
            formData.append('email', email);
            
            // ADJUSTED: Send only the address ID to the backend
            formData.append('address_catalog_id', addressCatalogId); 
            
            // Send resident-specific comments
            formData.append('comments', comments);

            try {
                // API POST request to store the new resident
                await axios.post(endpoint, formData, axiosOptions);
                setSuccessMessage('Residente creado exitosamente.');
                setErrorMessage('');
                navigate('/residents');
            } catch (error) {
                // Check if the error is a validation failure (422) from the server
                const serverErrorMsg = error.response?.data?.message || 'Fallo al crear el residente.';
                setErrorMessage(serverErrorMsg);
                console.error('Error creating resident:', error);
            }
        }
        setFormValidated(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setPhoto(file);
        // Create a URL for image preview
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
                
                {/* PHOTO FIELDS */}
                <div className='mb-3'>
                    <label className='form-label'>Foto (Opcional)</label><br />
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

                {/* NAME FIELD */}
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
                {/* LAST NAME FIELD */}
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
                {/* EMAIL FIELD */}
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
                
                {/* ADDRESS FIELD: CATALOG SELECT (NORMALIZED) */}
                <div className='mb-3'>
                    <label className='form-label'>Dirección (Catálogo)</label>
                    <select
                        value={addressCatalogId}
                        onChange={(e) => setAddressCatalogId(e.target.value)}
                        className='form-control'
                        required
                    >
                        {/* Placeholder option */}
                        <option value="" disabled>Seleccione una dirección del catálogo</option>
                        {/* Map over the fetched addresses */}
                        {addressList.map((addr) => (
                            <option key={addr.id} value={addr.id}>
                                {addr.full_address}
                            </option>
                        ))}
                    </select>
                    <div className="invalid-feedback">
                        Por favor, seleccione una dirección.
                    </div>
                </div>

                {/* COMMENTS FIELD (Now resident-specific comments) */}
                <div className='mb-3'>
                    <label className='form-label'>Comentarios (Residente)</label>
                    <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        className='form-control'
                    />
                </div>
                
                <button type='submit' className='btn btn-success'>Guardar</button>
            </form>
        </div>
    );
}