import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { MessageContext } from './MessageContext';
import { useNavigate, useParams } from 'react-router-dom';

const endpoint = '/api/addresses';
const residentSearchEndpoint = '/api/reports/search-residents';
const streetsEndpoint = '/api/streets';

export default function EditAddresses() {
    // ENGLISH CODE COMMENTS
    // State for form inputs
    const [community, setCommunity] = useState('');
    const [streetId, setStreetId] = useState(''); // Changed to streetId (integer)
    const [streetNumber, setStreetNumber] = useState('');
    const [type, setType] = useState('');
    const [comments, setComments] = useState('');
    const [formValidated, setFormValidated] = useState(false);
    
    // ⭐ NEW STATE: Months overdue before 2026. Can be 0 or '' temporarily.
    const [monthsOverdue, setMonthsOverdue] = useState(0); 

    // States for resident assignment
    const [residentQuery, setResidentQuery] = useState('');
    const [residentId, setResidentId] = useState(null);
    const [residentSuggestions, setResidentSuggestions] = useState([]);
    const [selectedResidentName, setSelectedResidentName] = useState('');
    const [hasExistingAddress, setHasExistingAddress] = useState(false);

    // State for streets
    const [streets, setStreets] = useState([]);

    // Context, navigation, and params hooks
    const { setSuccessMessage, setErrorMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID from URL

    // Handler to restrict input to only numeric digits (0-9)
    const handleNumberInput = (e) => {
        // ENGLISH CODE COMMENTS
        const isDigit = /\d/.test(e.key);
        if (!isDigit) {
            e.preventDefault();
        }
    };
    
    // ⭐ ADJUSTED HANDLER: Allows the input field to be completely cleared (value = '') 
    const handleMonthsOverdueChange = (e) => {
        // ENGLISH CODE COMMENTS
        const value = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
        
        // If the resulting string is empty, set state to empty string ('')
        // Otherwise, parse the number and cap it.
        if (value === '') {
            setMonthsOverdue('');
        } else {
            const num = parseInt(value);
            setMonthsOverdue(Math.min(num, 100)); // Cap at 100
        }
    };

    // Fetch streets
    const fetchStreets = async () => {
        // ENGLISH CODE COMMENTS
        try {
            const response = await axios.get(streetsEndpoint, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
            });
            const activeStreets = response.data.data.filter(s => !s.deleted_at);
            setStreets(activeStreets || []);
        } catch (error) {
            console.error('Error fetching streets:', error);
            setErrorMessage('Fallo al cargar el catálogo de calles.');
        }
    };

    // Effect for resident autocomplete search (Debouncing)
    useEffect(() => {
        // ENGLISH CODE COMMENTS
        if (!residentQuery) {
            setResidentSuggestions([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                const response = await axios.get(`${residentSearchEndpoint}?search=${residentQuery}`, {
                    withCredentials: true,
                    headers: { Accept: 'application/json' },
                });

                const suggestions = Array.isArray(response.data.data) ? response.data.data : [];
                setResidentSuggestions(suggestions);
            } catch (error) {
                console.error('Error fetching resident search results:', error);
                setResidentSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [residentQuery]);

    // Handler when a resident suggestion is clicked
    const handleSelectResident = (resident) => {
        // ENGLISH CODE COMMENTS
        setResidentId(resident.id);
        setSelectedResidentName(`${resident.name} ${resident.last_name}`);
        setResidentQuery(`${resident.name} ${resident.last_name}`);
        setResidentSuggestions([]);

        // Check if the selected resident already has an address (excluding the current address being edited)
        if (resident.address && resident.address.id != id) {
            setHasExistingAddress(true);
        } else {
            setHasExistingAddress(false);
        }
    };

    // Function to fetch the existing data
    useEffect(() => {
        // ENGLISH CODE COMMENTS
        const getAddressById = async () => {
            try {
                // Fetch the address data using the show/edit endpoint
                const response = await axios.get(`${endpoint}/${id}`, {
                    withCredentials: true,
                    headers: { Accept: 'application/json' },
                });
                const address = response.data.data;

                // Set states with fetched data
                setCommunity(address.community || 'PRADOS DE LA HUERTA');
                setStreetId(address.street_id || '');
                setStreetNumber(address.street_number || '');
                setType(address.type || '');
                setComments(address.comments || '');
                
                // ⭐ NEW: Set the months_overdue field. Ensure it's never NULL, but keep 0.
                setMonthsOverdue(address.months_overdue ?? 0);

                // Set resident data if exists
                if (address.resident) {
                    setResidentId(address.resident.id);
                    setSelectedResidentName(`${address.resident.name} ${address.resident.last_name}`);
                    setResidentQuery(`${address.resident.name} ${address.resident.last_name}`);
                    setHasExistingAddress(false); 
                }
            } catch (error) {
                setErrorMessage('Fallo al cargar los datos de dirección para editar.');
                console.error('Error fetching address data:', error);
            }
        };
        getAddressById();
        fetchStreets();
    }, [id, setErrorMessage]);

    const update = async (e) => {
        // ENGLISH CODE COMMENTS
        e.preventDefault();
        const form = e.currentTarget;

        // Check form validity before submission
        if (form.checkValidity() === false || !residentId || !streetId) {
            e.stopPropagation();
            setErrorMessage('Por favor, complete todos los campos obligatorios, incluyendo la asignación de Residente y Calle.');
        } else if (hasExistingAddress) {
            e.stopPropagation();
            setErrorMessage('El residente seleccionado ya tiene una dirección asignada (1:1).');
        } else {
            const formData = new FormData();
            formData.append('_method', 'PUT'); // Laravel requires PUT method spoofing
            formData.append('community', community);
            formData.append('street_id', streetId);
            formData.append('street_number', streetNumber);
            formData.append('type', type);
            formData.append('comments', comments);
            formData.append('resident_id', residentId);
            
            // ⭐ ADJUSTED: Ensure monthsOverdue is 0 if it's an empty string due to user clearing the input.
            const finalMonthsOverdue = monthsOverdue === '' ? 0 : monthsOverdue;
            formData.append('months_overdue', finalMonthsOverdue);

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
                setErrorMessage(errorMsg);
                console.error('Error updating address:', error);
            }
        }
        setFormValidated(true);
    };

    return (
        <div>
            {/* Title in Spanish */}
            <h2>Editar Dirección</h2>
            <form onSubmit={update} noValidate className={formValidated ? 'was-validated' : ''}>
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
                        className={`form-control ${formValidated && (!residentId || hasExistingAddress) ? 'is-invalid' : (residentId && !hasExistingAddress ? 'is-valid' : '')}`}
                        value={residentQuery}
                        onChange={(e) => {
                            setResidentQuery(e.target.value);
                            setResidentId(null);
                            setSelectedResidentName('');
                            setHasExistingAddress(false);
                        }}
                        placeholder="Buscar por nombre o apellido..."
                        required
                    />
                    <input type="hidden" value={residentId || ''} required />
                    {residentSuggestions?.length > 0 && (
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
                        <option value="PRADOS DE LA HUERTA">PRADOS DE LA HUERTA</option>
                    </select>
                    <div className="invalid-feedback">
                        Por favor, seleccione una comunidad.
                    </div>
                </div>

                {/* FIELD: STREET (SELECT) - MANDATORY */}
                <div className='mb-3'>
                    <label className='form-label'>CALLE (Obligatorio) <span className="text-danger">*</span></label>
                    <select
                        value={streetId}
                        onChange={(e) => setStreetId(e.target.value)}
                        className={`form-control ${formValidated && !streetId ? 'is-invalid' : ''}`}
                        required
                    >
                        <option value="" disabled>Seleccione una calle</option>
                        {streets.map((st) => (
                            <option key={st.id} value={st.id}>
                                {st.name}
                            </option>
                        ))}
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
                        onKeyPress={handleNumberInput}
                        type='text'
                        className='form-control'
                        required
                        pattern="[0-9]*"
                    />
                    <div className="invalid-feedback">
                        Por favor, ingrese solo números en este campo.
                    </div>
                </div>
                
                {/* ⭐ NEW FIELD: MONTHS OVERDUE BEFORE 2026 */}
                <div className='mb-3'>
                    <label className='form-label'>Número de meses atrasados antes del 2026 (Obligatorio) <span className="text-danger">*</span></label>
                    <input
                        // The value can be '' if the user cleared it, which is fine for the input
                        value={monthsOverdue} 
                        onChange={handleMonthsOverdueChange}
                        type='number' 
                        min="0"
                        max="100"
                        className='form-control'
                        required
                    />
                    <div className="form-text">
                        Ingrese 0 si no hay meses atrasados.
                    </div>
                    <div className="invalid-feedback">
                        Por favor, ingrese un número válido de meses atrasados (0 o más).
                    </div>
                </div>

                {/* FIELD: TYPE (SELECT) - MANDATORY */}
                <div className='mb-3'>
                    <label className='form-label'>Tipo (Obligatorio)</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className='form-control'
                        required
                    >
                        <option value="" disabled>Seleccione un tipo</option>
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