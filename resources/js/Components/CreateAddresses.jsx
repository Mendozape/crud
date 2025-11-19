// src/components/CreateAddresses.jsx
import React, { useState, useContext, useEffect } from 'react'; 
import axios from 'axios';
import { MessageContext } from './MessageContext';
import { useNavigate } from 'react-router-dom';

const endpoint = 'http://localhost:8000/api/addresses';
const residentSearchEndpoint = 'http://localhost:8000/api/reports/search-residents'; 

export default function CreateAddresses() {
    // State for address form inputs (unchanged)
    const [community, setCommunity] = useState('PRADOS DE LA HUERTA'); 
    const [street, setStreet] = useState('');
    const [streetNumber, setStreetNumber] = useState('');
    const [type, setType] = useState(''); 
    const [comments, setComments] = useState('');
    const [formValidated, setFormValidated] = useState(false);

    // NEW STATES FOR RESIDENT ASSIGNMENT
    const [residentQuery, setResidentQuery] = useState(''); // Text typed in the input
    const [residentId, setResidentId] = useState(null);       // ID of the selected resident to be stored
    const [residentSuggestions, setResidentSuggestions] = useState([]); // Autocomplete results
    const [selectedResidentName, setSelectedResidentName] = useState(''); // Display name of the selected resident
    const [hasExistingAddress, setHasExistingAddress] = useState(false); // New state for visual warning

    // Context and navigation hooks
    const { setSuccessMessage, setErrorMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    // Handler to restrict input to only numeric digits (0-9)
    const handleNumberInput = (e) => {
        // ENGLISH CODE COMMENTS
        const isDigit = /\d/.test(e.key);
        if (!isDigit) {
            e.preventDefault();
        }
    };

    // Effect for resident autocomplete search (Debouncing)
    useEffect(() => {
        // ENGLISH CODE COMMENTS
        // FIX: Start searching immediately if the query is not empty
        if (!residentQuery) { 
            setResidentSuggestions([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                // Endpoint uses 'search' parameter
                const response = await axios.get(`${residentSearchEndpoint}?search=${residentQuery}`, {
                    withCredentials: true,
                    headers: { Accept: 'application/json' },
                });
                setResidentSuggestions(response.data.data);
            } catch (error) {
                console.error('Error fetching resident search results:', error);
                setResidentSuggestions([]);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(delayDebounceFn);
    }, [residentQuery]);

    // Handler when a resident suggestion is clicked
    const handleSelectResident = (resident) => {
        // ENGLISH CODE COMMENTS
        setResidentId(resident.id);
        setSelectedResidentName(`${resident.name} ${resident.last_name}`);
        setResidentQuery(`${resident.name} ${resident.last_name}`); // Update input text
        setResidentSuggestions([]); // Clear suggestions
        
        // CRUCIAL CHECK: Determine if the selected resident already has an address.
        setHasExistingAddress(!!resident.address); 
    };

    const store = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        // Validation: Check form validity and ensure a resident ID is selected
        if (form.checkValidity() === false || !residentId || hasExistingAddress) {
            e.stopPropagation();
            // User-facing message in Spanish
            if (hasExistingAddress) {
                 setErrorMessage('El residente seleccionado ya tiene una dirección asignada (1:1).');
            } else {
                 setErrorMessage('Por favor, complete todos los campos obligatorios, incluyendo la asignación del residente.'); 
            }
            if (hasExistingAddress) return; 
        } else {
            const formData = new FormData();
            formData.append('community', community);
            formData.append('street', street);
            formData.append('street_number', streetNumber);
            formData.append('type', type);
            formData.append('comments', comments);
            
            // NEW: Append the selected resident ID
            formData.append('resident_id', residentId);

            try {
                // API POST request to store the new address
                await axios.post(endpoint, formData, {
                    withCredentials: true,
                    headers: { Accept: 'application/json' },
                });

                // User-facing success message in Spanish
                setSuccessMessage('Dirección creada y residente asignado exitosamente.');
                setErrorMessage('');
                navigate('/addresses');
            } catch (error) {
                // Error handling (e.g., unique constraint violation or resident already assigned)
                const errorMsg = error.response?.data?.message || 'Fallo al crear la dirección. Verifique que el residente no tenga otra dirección asignada.';
                // User-facing error message in Spanish
                setErrorMessage(errorMsg);
                console.error('Error creating address:', error);
            }
        }
        setFormValidated(true);
    };

    return (
        <div>
            <h2>Crear nueva dirección</h2>
            <form onSubmit={store} noValidate className={formValidated ? 'was-validated' : ''}>
                <div className="col-md-12 mt-4">
                    {errorMessage && (
                        <div className="alert alert-danger text-center">
                            {errorMessage}
                        </div>
                    )}
                </div>
                
                {/* FIELD: RESIDENT ASSIGNMENT (AUTOCOMPLETE) */}
                <div className='mb-3 position-relative'>
                    <label className='form-label'>Residente Asignado (Obligatorio) <span className="text-danger">*</span></label>
                    <input
                        type='text'
                        // Show invalid state if validated and no ID, or if it has an existing address
                        className={`form-control ${formValidated && (!residentId || hasExistingAddress) ? 'is-invalid' : (residentId && !hasExistingAddress ? 'is-valid' : '')}`}
                        value={residentQuery}
                        onChange={(e) => {
                            setResidentQuery(e.target.value);
                            setResidentId(null); // Clear ID if user starts typing again
                            setSelectedResidentName('');
                            setHasExistingAddress(false); // Reset warning
                        }}
                        placeholder="Buscar por nombre o apellido..."
                        required
                    />
                    <input type="hidden" value={residentId || ''} required /> {/* Hidden field for validation check */}

                    {residentSuggestions.length > 0 && (
                        <ul className="list-group position-absolute w-100 shadow-lg" style={{ zIndex: 10 }}>
                            {residentSuggestions.map((res) => (
                                <li
                                    key={res.id}
                                    className="list-group-item list-group-item-action cursor-pointer"
                                    onClick={() => handleSelectResident(res)}
                                >
                                    {res.name} {res.last_name} ({res.email})
                                </li>
                            ))}
                        </ul>
                    )}
                    {residentId && !hasExistingAddress && <small className="text-success">Residente seleccionado: {selectedResidentName}</small>}
                    {/* Display warning feedback */}
                    {formValidated && !residentId && <div className="invalid-feedback d-block">Por favor, seleccione un residente de la lista.</div>}
                    {hasExistingAddress && <div className="text-danger mt-1">⚠️ Este residente ya tiene una dirección asignada (1:1). No puede crear una nueva.</div>}
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
                        <option value="CIRCUITO PRADOS DEL RIO">CIRCUITO PRADOS DEL RIO</option>
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
                    <label className='form-label'>Tipo (Obligatorio) ⚠️</label>
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

                <button type='submit' className='btn btn-success'>Guardar</button>
            </form>
        </div>
    );
}