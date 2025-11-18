import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { MessageContext } from './MessageContext';
import { useNavigate, useParams } from 'react-router-dom';

const endpoint = 'http://localhost:8000/api/residents/';
const addressEndpoint = 'http://localhost:8000/api/addresses/active'; // Endpoint to fetch active catalog addresses

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
    
    // NORMALIZED STATE: Stores the FK ID
    const [addressCatalogId, setAddressCatalogId] = useState('');
    
    // Resident-specific comments
    const [comments, setComments] = useState('');

    // NEW STATE: To store the list of addresses fetched from the catalog API
    const [addressList, setAddressList] = useState([]); 

    // Validation & UI
    const [formValidated, setFormValidated] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [validationWarning, setValidationWarning] = useState(false);

    const { id } = useParams();
    const { setSuccessMessage, setErrorMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    // Effect 1: Fetch the list of active addresses (catalog)
    useEffect(() => {
        // ENGLISH CODE COMMENTS
        const fetchAddresses = async () => {
            try {
                const response = await axios.get(addressEndpoint, { withCredentials: true, headers: { Accept: 'application/json' } });
                
                // ADJUSTMENT: The AddressController's listActive method must be updated 
                // to return the correct 'full_address' format: Calle #Número, Comunidad.
                // Assuming the backend is adjusted, we just set the list here.
                setAddressList(response.data.data); 
            } catch (error) {
                console.error('Error fetching address catalog:', error);
                setErrorMessage('Fallo al cargar el catálogo de direcciones. La edición no es posible.');
            }
        };
        fetchAddresses();
    }, [setErrorMessage]);
    
    /*
    ** NOTE on listActive endpoint adjustment:
    * The 'listActive' method in AddressController must be modified to use this format in the backend:
    * 'full_address' => "Calle {$address->street} #{$address->street_number}, {$address->community}"
    * This ensures consistency between the creation/edit dropdown and the resident listing table.
    */

    // Effect 2: Fetch the resident's data (including the current address ID)
    useEffect(() => {
        // ENGLISH CODE COMMENTS
        const getResidentById = async () => {
            try {
                // Fetch resident data. The controller now returns addressCatalogId directly.
                const response = await axios.get(`${endpoint}${id}`, axiosOptions);
                const resident = response.data; 
                
                // Set primary data
                setPhoto(resident.photo);
                setName(resident.name);
                setLastName(resident.last_name);
                setEmail(resident.email);
                
                // Set normalized address ID.
                setAddressCatalogId(resident.address_catalog_id || ''); 
                
                // Set comments (resident-specific comments)
                setComments(resident.comments || '');
                
                // Set initial photo preview if an image path exists
                if (resident.photo) {
                    // FIX: Reverting to the URL structure from your working version
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
        // ENGLISH CODE COMMENTS
        const file = e.target.files[0];
        setPhoto(file);
        if (file) {
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async () => {
        // ENGLISH CODE COMMENTS
        const formData = new FormData();
        // Check if photo is a newly selected File object, otherwise, photo remains the existing path (string)
        if (photo instanceof File) formData.append('photo', photo);
        
        formData.append('name', name);
        formData.append('last_name', last_name);
        formData.append('email', email);
        
        // ADJUSTED: Send only the address ID
        formData.append('address_catalog_id', addressCatalogId); 
        
        // Send resident-specific comments
        formData.append('comments', comments || '');
        formData.append('_method', 'PUT'); // Required for Laravel PUT spoofing

        try {
            const response = await axios.post(`${endpoint}${id}`, formData, axiosOptions);
            if (response.status === 200) {
                setSuccessMessage('Residente actualizado exitosamente.');
                setErrorMessage('');
                navigate('/residents');
            }
        } catch (error) {
            // User-facing error message in Spanish
            const serverErrorMsg = error.response?.data?.message || 'Fallo al actualizar el residente.';
            setErrorMessage(serverErrorMsg);
        } finally {
            setShowModal(false);
        }
    };

    const update = (e) => {
        // ENGLISH CODE COMMENTS
        e.preventDefault();

        setFormValidated(true);
        setErrorMessage('');
        setValidationWarning(false);

        // Client-side validation check
        if (!e.target.checkValidity()) {
            setValidationWarning(true);
            return;
        }

        // Show confirmation modal before calling handleUpdate
        setShowModal(true);
    };

    return (
        <div className="container mt-4">
            <h2>Editar Residente</h2>

            {errorMessage && <div className="alert alert-danger text-center">{errorMessage}</div>}

            <form onSubmit={update} noValidate className={formValidated ? 'was-validated' : ''}>
                {/* Photo */}
                <div className="form-group">
                    <label>Foto (Opcional)</label><br />
                    {/* Display photo if photoPreview is set (either new file or old URL) */}
                    {(photoPreview) && ( 
                        <img
                            // Use photoPreview state directly
                            src={photoPreview} 
                            alt="Residente"
                            style={{ width: '100px', borderRadius: '50%', marginBottom: '10px' }}
                        />
                    )}
                    <input
                        type="file"
                        className="form-control"
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                     <div className="invalid-feedback">Por favor, suba una foto.</div>
                </div>

                {/* Name */}
                <div className="form-group">
                    <label>Nombre</label>
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
                <div className="form-group">
                    <label>Apellidos</label>
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
                <div className="form-group">
                    <label>Correo Electrónico</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <div className="invalid-feedback">Por favor, ingrese un correo electrónico válido.</div>
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
                                {/* Display in the corrected order: Calle #Número, Comunidad */}
                                {addr.full_address} 
                            </option>
                        ))}
                    </select>
                    <div className="invalid-feedback">
                        Por favor, seleccione una dirección.
                    </div>
                </div>
                
                {/* Comments (Resident-specific) */}
                <div className="form-group">
                    <label>Comentarios</label>
                    <textarea
                        className="form-control"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                    />
                </div>

                <button type="submit" className="btn btn-primary mt-3">Actualizar</button>
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
                            <button type="button" className="btn btn-danger" onClick={handleUpdate}>Actualizar</button>
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