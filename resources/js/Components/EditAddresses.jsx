// src/components/EditAddresses.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { MessageContext } from './MessageContext';
import { useNavigate, useParams } from 'react-router-dom';

const endpoint = 'http://localhost:8000/api/addresses';

export default function EditAddresses() {
    // State for form inputs
    const [community, setCommunity] = useState('');
    const [street, setStreet] = useState('');
    const [streetNumber, setStreetNumber] = useState('');
    const [type, setType] = useState('');
    const [comments, setComments] = useState('');
    const [formValidated, setFormValidated] = useState(false);

    // Context, navigation, and params hooks
    const { setSuccessMessage, setErrorMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID from URL

    // Handler to restrict input to only numeric digits (0-9)
    const handleNumberInput = (e) => {
        // Regular expression to check if the pressed key is a digit
        const isDigit = /\d/.test(e.key);
        if (!isDigit) {
            e.preventDefault();
        }
    };

    // Function to fetch the existing data
    useEffect(() => {
        const getAddressById = async () => {
            try {
                // Fetch the address data using the show/edit endpoint
                const response = await axios.get(`${endpoint}/${id}`, { 
                    withCredentials: true,
                    headers: { Accept: 'application/json' },
                });
                const address = response.data.data;
                
                // Set states with fetched data
                setCommunity(address.community || 'PRADOS DE LA HUERTA'); // Set fixed community
                setStreet(address.street || '');
                setStreetNumber(address.street_number || '');
                setType(address.type || '');
                setComments(address.comments || '');
            } catch (error) {
                // User-facing error message in Spanish
                setErrorMessage('Fallo al cargar los datos de dirección para editar.');
                console.error('Error fetching address data:', error);
            }
        };
        getAddressById();
    }, [id, setErrorMessage]);

    const update = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        // Check form validity before submission
        if (form.checkValidity() === false) {
            e.stopPropagation();
            // User-facing error message in Spanish
            setErrorMessage('Por favor, complete todos los campos obligatorios.');
        } else {
            const formData = new FormData();
            formData.append('_method', 'PUT'); // Laravel requires PUT method spoofing
            formData.append('community', community);
            formData.append('street', street);
            formData.append('street_number', streetNumber);
            formData.append('type', type);
            formData.append('comments', comments);

            try {
                // API POST request to update the address catalog entry
                await axios.post(`${endpoint}/${id}`, formData, {
                    withCredentials: true,
                    headers: { Accept: 'application/json' },
                });

                // User-facing success message in Spanish
                setSuccessMessage('Entrada de Catálogo de Direcciones actualizada exitosamente.');
                setErrorMessage('');
                navigate('/addresses');
            } catch (error) {
                // Error handling (e.g., unique constraint violation)
                const errorMsg = error.response?.data?.message || 'Fallo al actualizar la entrada de catálogo de direcciones.';
                // User-facing error message in Spanish
                setErrorMessage(errorMsg);
                console.error('Error updating address:', error);
            }
        }
        setFormValidated(true);
    };

    return (
        <div>
            {/* Title in Spanish */}
            <h2>Editar Entrada de Catálogo de Direcciones</h2>
            <form onSubmit={update} noValidate className={formValidated ? 'was-validated' : ''}>
                <div className="col-md-12 mt-4">
                    {errorMessage && (
                        <div className="alert alert-danger text-center">
                            {errorMessage}
                        </div>
                    )}
                </div>

                {/* FIELD: COMMUNITY (SELECT) - MANDATORY */}
                <div className='mb-3'>
                    <label className='form-label'>COMUNIDAD (Obligatorio)</label>
                    <select
                        value={community}
                        onChange={(e) => setCommunity(e.target.value)}
                        className='form-control'
                        required
                        disabled // Disabled as only one option is allowed
                    >
                        {/* The single required option */}
                        <option value="PRADOS DE LA HUERTA">PRADOS DE LA HUERTA</option>
                    </select>
                    <div className="invalid-feedback">
                        Por favor, seleccione una comunidad.
                    </div>
                </div>

                {/* FIELD: STREET (SELECT) - MANDATORY */}
                <div className='mb-3'>
                    <label className='form-label'>CALLE (Obligatorio)</label>
                    <select
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className='form-control'
                        required
                    >
                        {/* Default disabled option. Empty value triggers the required flag. */}
                        <option value="" disabled>Seleccione una calle</option>
                        {/* Fixed options */}
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                    </select>
                    <div className="invalid-feedback">
                        Por favor, seleccione una calle.
                    </div>
                </div>

                {/* FIELD: STREET NUMBER (INPUT) - NUMERIC ONLY AND MANDATORY */}
                <div className='mb-3'>
                    <label className='form-label'>Número (Obligatorio)</label>
                    <input
                        value={streetNumber}
                        onChange={(e) => setStreetNumber(e.target.value)}
                        onKeyPress={handleNumberInput} // Restricts key input to digits
                        type='text' 
                        className='form-control'
                        required
                        // Client-side pattern validation: ensures only digits are in the final value
                        pattern="[0-9]*" 
                    />
                    <div className="invalid-feedback">
                        Por favor, ingrese solo números en este campo.
                    </div>
                </div>

                {/* FIELD: TYPE (SELECT) - MANDATORY */}
                <div className='mb-3'>
                    <label className='form-label'>Tipo (Obligatorio)</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className='form-control'
                        required // It is mandatory
                    >
                        {/* Default disabled option with empty value to trigger required validation */}
                        <option value="" disabled>Seleccione un tipo</option>
                        {/* Fixed options */}
                        <option value="CASA">CASA</option>
                        <option value="TERRENO">TERRENO</option>
                    </select>
                    <div className="invalid-feedback">
                        Por favor, seleccione si es Casa o Terreno.
                    </div>
                </div>

                {/* FIELD: COMMENTS (TEXTAREA) - OPTIONAL */}
                <div className='mb-3'>
                    <label className='form-label'>Comentarios (Opcional)</label>
                    <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        className='form-control'
                        rows='3'
                    />
                </div>

                {/* Button in Spanish */}
                <button type='submit' className='btn btn-info'>Actualizar</button>
            </form>
        </div>
    );
}