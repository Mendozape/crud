// src/components/ShowAddresses.jsx
import React, { useEffect, useState, useContext } from 'react';
import DataTable from 'react-data-table-component';
import { MessageContext } from './MessageContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const endpoint = 'http://localhost:8000/api/addresses';

const ShowAddresses = () => {
    // State variables
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filteredAddresses, setFilteredAddresses] = useState([]);
    
    // States for soft deletion modal
    const [showModal, setShowModal] = useState(false);
    const [addressToDeactivate, setAddressToDeactivate] = useState(null); 
    const [deactivationReason, setDeactivationReason] = useState(''); 

    // Context hook for global messages
    const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    // Function to fetch all addresses (including soft-deleted ones)
    const fetchAddresses = async () => {
        try {
            // ENGLISH CODE COMMENTS
            // Controller now uses with('resident') to fetch the assigned resident
            const response = await axios.get(endpoint, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
            });
            // The API returns all addresses, including soft-deleted ones
            setAddresses(response.data.data || []);
            setFilteredAddresses(response.data.data || []);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            // User-facing error message in Spanish
            setErrorMessage('Fallo al cargar el catálogo de direcciones. Puede que no esté autenticado.');
        } finally {
            setLoading(false);
        }
    };

    // Initial data load on component mount
    useEffect(() => {
        fetchAddresses();
    }, []);

    // Filter addresses based on search input (by community, street, or resident name)
    useEffect(() => {
        // ENGLISH CODE COMMENTS
        const result = addresses.filter(addr => {
            const addressText = `${addr.community} ${addr.street} ${addr.street_number} ${addr.type}`;
            const residentName = addr.resident ? `${addr.resident.name} ${addr.resident.last_name}` : '';
            const searchText = search.toLowerCase();
            
            return addressText.toLowerCase().includes(searchText) ||
                   residentName.toLowerCase().includes(searchText);
        });
        setFilteredAddresses(result);
    }, [search, addresses]);


    // Function to perform soft deletion (Dar de Baja)
    const deactivateAddress = async (id, reason) => {
        // ENGLISH CODE COMMENTS
        try {
            // Use axios.delete, passing 'reason' in the data object for the audit trail
            const response = await axios.delete(`${endpoint}/${id}`, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
                data: { reason: reason } // Sending the reason in the DELETE body
            });
            
            if (response.status === 200) {
                // User-facing success message in Spanish
                setSuccessMessage('Entrada de catálogo dada de baja exitosamente.');
                fetchAddresses(); // Refresh list to show 'Inactive' status
            } 
        } catch (error) {
            console.error('Deactivation error:', error);
            // User-facing error message in Spanish
            const msg = error.response?.data?.message || 'Fallo al dar de baja la entrada del catálogo.';
            setErrorMessage(msg);
        } finally {
            setShowModal(false);
            setDeactivationReason('');
        }
    };

    // Navigation handlers
    const editAddress = (id) => navigate(`/addresses/edit/${id}`);
    const createAddress = () => navigate('/addresses/create');
    
    // NEW HANDLERS: Payments linked to ADDRESS ID
    const createPayment = (id) => navigate(`/addresses/payment/${id}`);
    const viewPaymentHistory = (id) => navigate(`/addresses/payments/history/${id}`); 

    // Modal handlers
    const toggleModal = () => setShowModal(!showModal);
    
    // Opens the modal to confirm deactivation and capture reason
    const confirmDeactivation = (id) => {
        setAddressToDeactivate(id);
        toggleModal();
    };
    
    // Calls the deactivation function with the captured reason
    const handleDeactivation = () => deactivateAddress(addressToDeactivate, deactivationReason);


    // DataTable column definitions
    const columns = [
        
        // NEW: Combined Address Column
        { 
            name: 'Dirección', 
            selector: row => row.street, // Use 'street' for initial sorting
            sortable: true,
            cell: row => (
                // Combine street, street_number, and type into a single display string
                <div style={{ lineHeight: '1.2' }}>
                    {/* Calle #Número, Comunidad */}
                    <span className="d-block">{`${row.street} #${row.street_number}`}</span>
                    {/* Tipo */}
                    <span className="badge bg-secondary">{row.type}</span>
                </div>
            ),
            minWidth: '280px',
        },
        // NEW: Resident Column (Name + Last Name combined)
        { 
            name: 'Residente Asignado', 
            selector: row => row.resident ? `${row.resident.name} ${row.resident.last_name}` : 'Vacante',
            sortable: true,
            cell: row => (
                // Display name and last name, or 'Vacante' if resident is null
                <span className={row.resident ? 'fw-bold' : 'text-muted'}>
                    {row.resident ? `${row.resident.name} ${row.resident.last_name}` : 'Vacante'}
                </span>
            ),
            minWidth: '180px',
        },

        { name: 'Comentarios', selector: row => row.comments, sortable: true },

        { 
            name: 'Estado', // Status label in Spanish
            selector: row => row.deleted_at ? 'Inactivo' : 'Activo', 
            sortable: true,
            cell: row => (
                <span className={`badge ${row.deleted_at ? 'bg-danger' : 'bg-info'}`}> 
                    {/* Display status in Spanish */}
                    {row.deleted_at ? 'Inactivo' : 'Activo'}
                </span>
            ),
        },
        
        {
            name: 'Acciones', // Actions label in Spanish
            cell: row => (
                // Actions depend on the address status
                <div style={{ display: 'flex', gap: '5px' }}>
                    
                    {/* NEW ACTIONS: Payment and History (Available only if ACTIVE) */}
                    {!row.deleted_at && (
                        <>
                            <button 
                                className="btn btn-primary btn-sm" 
                                onClick={() => createPayment(row.id)}
                            >
                                Pagar
                            </button>
                            <button 
                                className="btn btn-warning btn-sm" 
                                onClick={() => viewPaymentHistory(row.id)}
                            >
                                <i className="fas fa-history"></i> Historial
                            </button>
                        </>
                    )}
                    
                    {/* Edit and Delete Actions */}
                    <button className="btn btn-info btn-sm" onClick={() => editAddress(row.id)} disabled={!!row.deleted_at}>Editar</button>
                    
                    {row.deleted_at ? (
                        // If inactive, show disabled button
                        <button className="btn btn-secondary btn-sm" disabled>Dada de Baja</button>
                    ) : (
                        // If active, show the Deactivate button
                        <button className="btn btn-danger btn-sm" onClick={() => confirmDeactivation(row.id)}>Dar de Baja</button>
                    )}
                </div>
            ),
            minWidth: '320px', // Increased width to fit 4 buttons
        },
    ];

    // Effects to clear messages
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => setErrorMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    return (
        <div className="row mb-4 border border-primary rounded p-3">
            <div className="col-md-6">
                {/* Create button in Spanish */}
                <button className='btn btn-success btn-sm mt-2 mb-2 text-white' onClick={createAddress}>Crear Dirección</button>
            </div>
            <div className="col-md-6 d-flex justify-content-end align-items-center">
                <input
                    type="text"
                    className="col-md-3 form-control form-control-sm mt-2 mb-2"
                    // Placeholder in Spanish
                    placeholder="Buscar por dirección o residente"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="col-md-12 mt-4">
                {successMessage && <div className="alert alert-success text-center">{successMessage}</div>}
                {errorMessage && <div className="alert alert-danger text-center">{errorMessage}</div>}
            </div>

            <div className="col-md-12 mt-4">
                <DataTable
                    // Title in Spanish
                    title="Lista de direcciones"
                    columns={columns}
                    data={filteredAddresses}
                    progressPending={loading}
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[5, 10, 15, 20]}
                    highlightOnHover
                    striped
                />
            </div>

            {/* Modal for Deactivation Confirmation (Soft Delete) */}
            <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header bg-danger text-white">
                            {/* Modal title in Spanish */}
                            <h5 className="modal-title">Confirmar Baja de Catálogo</h5>
                            <button type="button" className="close" aria-label="Cerrar" onClick={toggleModal}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            {/* Confirmation text in Spanish */}
                            <p>¿Está seguro de que desea dar de baja esta entrada del catálogo de direcciones? No podrá ser usada para nuevos residentes, pero los registros históricos permanecerán vinculados.</p>
                            
                            <div className="form-group mt-3">
                                {/* Label in Spanish */}
                                <label htmlFor="reason">Motivo de la Baja <span className="text-danger">*</span></label>
                                <textarea
                                    id="reason"
                                    className="form-control"
                                    rows="3"
                                    value={deactivationReason}
                                    onChange={(e) => setDeactivationReason(e.target.value)}
                                    // Placeholder in Spanish
                                    placeholder="Ingrese la razón de la baja (Ej: Error de escritura, dirección ya no existe, etc.)"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            {/* Buttons in Spanish */}
                            <button type="button" className="btn btn-secondary" onClick={toggleModal}>Cancelar</button>
                            <button 
                                type="button" 
                                className="btn btn-danger" 
                                onClick={handleDeactivation}
                                disabled={!deactivationReason.trim()} // Disabled if no reason is provided
                            >
                                Dar de Baja
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {showModal && <div className="modal-backdrop fade show"></div>}
            {/* End Modal */}
        </div>
    );
};

export default ShowAddresses;