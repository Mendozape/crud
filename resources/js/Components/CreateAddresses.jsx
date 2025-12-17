import React, { useState, useContext, useEffect } from 'react'; 
import axios from 'axios';
import { MessageContext } from './MessageContext';
import { useNavigate } from 'react-router-dom';

const endpoint = '/api/addresses';
const residentSearchEndpoint = '/api/reports/search-residents'; 
const streetsEndpoint = '/api/streets'; 

export default function CreateAddresses() {
    // State for address form inputs
    const [community, setCommunity] = useState('PRADOS DE LA HUERTA'); 
    const [streetId, setStreetId] = useState(''); 
    const [streetNumber, setStreetNumber] = useState('');
    const [type, setType] = useState(''); 
    const [comments, setComments] = useState('');
    const [formValidated, setFormValidated] = useState(false);
    
    // ⭐ NEW STATE: Months overdue before 2026
    const [monthsOverdue, setMonthsOverdue] = useState(0); 

    // NEW STATE: To hold the fetched list of streets
    const [streets, setStreets] = useState([]); 

    // STATES FOR RESIDENT ASSIGNMENT
    const [residentQuery, setResidentQuery] = useState('');
    const [residentId, setResidentId] = useState(null); 
    const [residentSuggestions, setResidentSuggestions] = useState([]);
    const [selectedResidentName, setSelectedResidentName] = useState('');
    const [hasExistingAddress, setHasExistingAddress] = useState(false); 

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
    
    // ⭐ NEW HANDLER: Restricts input to numbers and handles change for monthsOverdue
    const handleMonthsOverdueChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
        const num = parseInt(value) || 0; 
        setMonthsOverdue(Math.min(num, 100)); // Cap at 100 to prevent huge numbers
    };
    
    // -------------------------------------------------------------------
    // EFFECT: Fetch the list of available streets
    // -------------------------------------------------------------------
    const fetchStreets = async () => {
        try {
            const response = await axios.get(streetsEndpoint, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
            });
            // Filter to include only ACTIVE streets (where deleted_at is null)
            const activeStreets = response.data.data.filter(s => !s.deleted_at); 
            setStreets(activeStreets || []);
        } catch (error) {
            console.error('Error fetching streets:', error);
            setErrorMessage('Fallo al cargar el catálogo de calles.');
        }
    };

    // Initial data load on component mount: Residents and Streets
    useEffect(() => {
        fetchStreets();
    }, []);

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

        // Validation: Check form validity and ensure Street ID is selected
        if (form.checkValidity() === false || !residentId || !streetId || hasExistingAddress) {
            e.stopPropagation();
            if (hasExistingAddress) {
                setErrorMessage('El residente seleccionado ya tiene una dirección asignada (1:1).');
            } else {
                setErrorMessage('Por favor, complete todos los campos obligatorios, incluyendo la asignación de Residente y Calle.'); 
            }
            if (hasExistingAddress) return; 
        } else {
            const formData = new FormData();
            formData.append('community', community);
            
            // CHANGE: Send street_id 
            formData.append('street_id', streetId); 
            
            formData.append('street_number', streetNumber);
            formData.append('type', type);
            formData.append('comments', comments);
            formData.append('resident_id', residentId);
            
            // ⭐ NEW FIELD: Send the months_overdue field
            formData.append('months_overdue', monthsOverdue); 

            try {
                await axios.post(endpoint, formData, {
                    withCredentials: true,
                    headers: { Accept: 'application/json' },
                });

                setSuccessMessage('Dirección creada y residente asignado exitosamente.');
                setErrorMessage('');
                navigate('/addresses');
            } catch (error) {
                const errorMsg = error.response?.data?.message || 'Fallo al crear la dirección. Verifique la unicidad de la dirección o la validez de los IDs.';
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
                        disabled 
                    >
                        <option value="PRADOS DE LA HUERTA">PRADOS DE LA HUERTA</option>
                    </select>
                    <div className="invalid-feedback">
                        Por favor, seleccione una comunidad.
                    </div>
                </div>

                {/* FIELD: STREET (SELECT) - NOW USES streetId FROM API */}
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

                {/* FIELD: STREET NUMBER (INPUT) - MANDATORY */}
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
                    <label className='form-label'>Tipo (Obligatorio) ⚠️</label>
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

                <button type='submit' className='btn btn-success'>Guardar</button>
            </form>
        </div>
    );
}