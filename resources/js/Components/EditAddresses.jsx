import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { MessageContext } from './MessageContext';
import { useNavigate, useParams } from 'react-router-dom';

const endpoint = '/api/addresses';
// UPDATED: Now searches in the unified Users table
const userSearchEndpoint = '/api/usuarios'; 
const streetsEndpoint = '/api/streets';

export default function EditAddresses() {
    // --- STATE FOR FORM INPUTS ---
    const [community, setCommunity] = useState('');
    const [streetId, setStreetId] = useState('');
    const [streetNumber, setStreetNumber] = useState('');
    const [type, setType] = useState('');
    const [comments, setComments] = useState('');
    const [monthsOverdue, setMonthsOverdue] = useState(0);
    const [formValidated, setFormValidated] = useState(false);

    // --- STATES FOR USER (RESIDENT) ASSIGNMENT ---
    const [userQuery, setUserQuery] = useState('');
    const [userId, setUserId] = useState(null);
    const [userSuggestions, setUserSuggestions] = useState([]);
    const [selectedUserName, setSelectedUserName] = useState('');
    const [hasExistingAddress, setHasExistingAddress] = useState(false);

    // --- STATE FOR STREETS ---
    const [streets, setStreets] = useState([]);

    const { setSuccessMessage, setErrorMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();
    const { id } = useParams();

    const axiosOptions = {
        withCredentials: true,
        headers: { Accept: 'application/json' },
    };

    // Restrict input to only numeric digits
    const handleNumberInput = (e) => {
        if (!/\d/.test(e.key)) e.preventDefault();
    };

    // Handle months overdue logic
    const handleMonthsOverdueChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value === '') {
            setMonthsOverdue('');
        } else {
            const num = parseInt(value);
            setMonthsOverdue(Math.min(num, 100));
        }
    };

    // Fetch streets catalog
    const fetchStreets = async () => {
        try {
            const response = await axios.get(streetsEndpoint, axiosOptions);
            const activeStreets = response.data.data.filter(s => !s.deleted_at);
            setStreets(activeStreets || []);
        } catch (error) {
            console.error('Error fetching streets:', error);
            setErrorMessage('Fallo al cargar el catálogo de calles.');
        }
    };

    // User autocomplete logic (Debounce)
    useEffect(() => {
        if (!userQuery || userId) {
            setUserSuggestions([]);
            return;
        }
        const delayDebounceFn = setTimeout(async () => {
            try {
                // We search users (neighbors) to assign them to the property
                const response = await axios.get(`${userSearchEndpoint}?search=${userQuery}`, axiosOptions);
                const data = response.data.data || response.data;
                setUserSuggestions(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error searching users:', error);
            }
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [userQuery, userId]);

    const handleSelectUser = (userSelected) => {
        setUserId(userSelected.id);
        setSelectedUserName(userSelected.name);
        setUserQuery(userSelected.name);
        setUserSuggestions([]);
        // 1:1 check: ensure user doesn't have another address (excluding current one)
        setHasExistingAddress(userSelected.address && userSelected.address.id != id);
    };

    // Fetch initial data on mount
    useEffect(() => {
        const getAddressById = async () => {
            try {
                const response = await axios.get(`${endpoint}/${id}`, axiosOptions);
                const address = response.data.data;

                setCommunity(address.community || 'PRADOS DE LA HUERTA');
                setStreetId(address.street_id || '');
                setStreetNumber(address.street_number || '');
                setType(address.type || '');
                setComments(address.comments || '');
                setMonthsOverdue(address.months_overdue ?? 0);
                
                if (address.user) {
                    setUserId(address.user.id);
                    setSelectedUserName(address.user.name);
                    setUserQuery(address.user.name);
                }
            } catch (error) {
                setErrorMessage('Error al cargar datos del predio.');
            }
        };
        getAddressById();
        fetchStreets();
    }, [id]);

    const update = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (form.checkValidity() === false || !userId || !streetId) {
            e.stopPropagation();
            setErrorMessage('Complete todos los campos obligatorios.');
        } else if (hasExistingAddress) {
            e.stopPropagation();
            setErrorMessage('Este usuario ya tiene otro predio asignado.');
        } else {
            try {
                // Note: We use PUT or POST with _method spoofing depending on your backend
                await axios.put(`${endpoint}/${id}`, {
                    community,
                    street_id: streetId,
                    street_number: streetNumber,
                    type,
                    comments,
                    user_id: userId, // New unified field
                    months_overdue: monthsOverdue === '' ? 0 : monthsOverdue
                }, axiosOptions);

                setSuccessMessage('Predio actualizado exitosamente.');
                navigate('/addresses');
            } catch (error) {
                setErrorMessage(error.response?.data?.message || 'Error al actualizar.');
            }
        }
        setFormValidated(true);
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                    <h2 className="mb-0 h4">Editar Predio</h2>
                </div>
                <div className="card-body">
                    <form onSubmit={update} noValidate className={formValidated ? 'was-validated' : ''}>
                        
                        {errorMessage && <div className="alert alert-danger text-center">{errorMessage}</div>}

                        {/* USER ASSIGNMENT (AUTOCOMPLETE) */}
                        <div className='mb-4 position-relative'>
                            <label className='form-label fw-bold'>Usuario / Residente <span className="text-danger">*</span></label>
                            <input
                                type='text'
                                className={`form-control ${formValidated && (!userId || hasExistingAddress) ? 'is-invalid' : ''}`}
                                value={userQuery}
                                onChange={(e) => {
                                    setUserQuery(e.target.value);
                                    setUserId(null);
                                }}
                                placeholder="Buscar usuario por nombre..."
                                required
                                autoComplete="off"
                            />
                            {userSuggestions.length > 0 && (
                                <ul className="list-group position-absolute w-100 shadow-lg" style={{ zIndex: 100 }}>
                                    {userSuggestions.map((u) => (
                                        <li key={u.id} className="list-group-item list-group-item-action" onClick={() => handleSelectUser(u)}>
                                            <strong>{u.name}</strong> <small className="text-muted">({u.email})</small>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {hasExistingAddress && <div className="text-danger small mt-1">⚠️ Este usuario ya tiene un predio vinculado.</div>}
                        </div>

                        <div className="row">
                            <div className='col-md-6 mb-3'>
                                <label className='form-label fw-bold'>Calle <span className="text-danger">*</span></label>
                                <select value={streetId} onChange={(e) => setStreetId(e.target.value)} className='form-control' required>
                                    <option value="">Seleccione calle</option>
                                    {streets.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                                </select>
                            </div>

                            <div className='col-md-6 mb-3'>
                                <label className='form-label fw-bold'>Número <span className="text-danger">*</span></label>
                                <input value={streetNumber} onChange={(e) => setStreetNumber(e.target.value)} onKeyPress={handleNumberInput} type='text' className='form-control' required />
                            </div>
                        </div>

                        <div className="row">
                            <div className='col-md-6 mb-3'>
                                <label className='form-label fw-bold'>Tipo <span className="text-danger">*</span></label>
                                <select value={type} onChange={(e) => setType(e.target.value)} className='form-control' required>
                                    <option value="">Seleccione tipo</option>
                                    <option value="CASA">CASA</option>
                                    <option value="TERRENO">TERRENO</option>
                                </select>
                            </div>

                            <div className='col-md-6 mb-3'>
                                <label className='form-label fw-bold'>Meses Atrasados (Previo 2026)</label>
                                <input value={monthsOverdue} onChange={handleMonthsOverdueChange} type='number' className='form-control' required />
                            </div>
                        </div>

                        <div className='mb-4'>
                            <label className='form-label fw-bold'>Comentarios Internos</label>
                            <textarea value={comments} onChange={(e) => setComments(e.target.value)} className='form-control' rows='2' />
                        </div>

                        <div className="d-flex gap-2">
                            <button type='submit' className='btn btn-primary px-4'>Actualizar Datos</button>
                            <button type='button' className='btn btn-secondary' onClick={() => navigate('/addresses')}>Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}