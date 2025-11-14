import React, { useEffect, useState, useContext } from 'react';
import DataTable from 'react-data-table-component';
import { MessageContext } from './MessageContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const endpoint = 'http://localhost:8000/api/fees';

const FeesTable = () => {
    // State variables
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filteredFees, setFilteredFees] = useState([]);
    
    // States for soft deletion modal
    const [showModal, setShowModal] = useState(false);
    const [feeToDeactivate, setFeeToDeactivate] = useState(null); 
    const [deactivationReason, setDeactivationReason] = useState(''); 

    // Context hook for global messages
    const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    // Function to fetch all fees (including soft-deleted ones)
    const fetchFees = async () => {
        try {
            // Controller uses withTrashed() to fetch all fees
            const response = await axios.get(endpoint, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
            });
            // The API returns all fees, including soft-deleted ones
            setFees(response.data.data || []);
            setFilteredFees(response.data.data || []);
        } catch (error) {
            console.error('Error fetching fees:', error);
            setErrorMessage('Fallo al cargar las cuotas. Puede que no esté autenticado.'); // UI Message (Spanish)
        } finally {
            setLoading(false);
        }
    };

    // Initial data load on component mount
    useEffect(() => {
        fetchFees();
    }, []);

    // Filter fees based on search input (by name)
    useEffect(() => {
        const result = fees.filter(fee => fee.name.toLowerCase().includes(search.toLowerCase()));
        setFilteredFees(result);
    }, [search, fees]);


    // Function to perform soft deletion (Dar de Baja)
    const deactivateFee = async (id, reason) => {
        try {
            // Use axios.delete, but pass 'reason' in the body/data object for the audit trail
            const response = await axios.delete(`${endpoint}/${id}`, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
                data: { reason: reason } // Sending the reason in the DELETE body
            });
            
            if (response.status === 200) {
                setSuccessMessage('Cuota dada de baja exitosamente.'); // UI Success message (Spanish)
                fetchFees(); // Refresh list to show 'Inactivo' status
            } 
        } catch (error) {
            console.error('Deactivation error:', error);
            const msg = error.response?.data?.message || 'Fallo al dar de baja la cuota.'; // Fallback UI message (Spanish)
            setErrorMessage(msg);
        } finally {
            setShowModal(false);
            setDeactivationReason('');
        }
    };

    // Navigation handlers
    const editFee = (id) => navigate(`/fees/edit/${id}`);
    const createFee = () => navigate('/fees/create');

    // Modal handlers
    const toggleModal = () => setShowModal(!showModal);
    
    // Opens the modal to confirm deactivation and capture reason
    const confirmDeactivation = (id) => {
        setFeeToDeactivate(id);
        toggleModal();
    };
    
    // Calls the deactivation function with the captured reason
    const handleDeactivation = () => deactivateFee(feeToDeactivate, deactivationReason);


    // DataTable column definitions
    const columns = [
        { name: 'Nombre', selector: row => row.name, sortable: true },
        { name: 'Monto', selector: row => row.amount, sortable: true },
        { name: 'Descripción', selector: row => row.description, sortable: true },
        
        // NEW COLUMN: STATUS (Active/Inactive)
        { 
            name: 'Estado', // Status
            // Check if deleted_at timestamp exists to determine status
            selector: row => row.deleted_at ? 'Inactivo' : 'Activo', 
            sortable: true,
            cell: row => (
                <span className={`badge ${row.deleted_at ? 'bg-danger' : 'bg-info'}`}> 
            {row.deleted_at ? 'Inactivo' : 'Activo'}
        </span>
            ),
        },
        
        {
            name: 'Acciones', // Actions
            cell: row => (
                // Actions depend on the fee status
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="btn btn-info btn-sm" onClick={() => editFee(row.id)} disabled={!!row.deleted_at}>Editar</button>
                    
                    {row.deleted_at ? (
                        // If inactive, show disabled button
                        <button className="btn btn-secondary btn-sm" disabled>Dada de Baja</button>
                    ) : (
                        // If active, show the Deactivate button
                        <button className="btn btn-danger btn-sm" onClick={() => confirmDeactivation(row.id)}>Dar de Baja</button>
                    )}
                </div>
            ),
            minWidth: '200px',
        },
    ];

    // Effect to clear success message after 5 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Effect to clear error message after 5 seconds
    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => setErrorMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    return (
        <div className="row mb-4 border border-primary rounded p-3">
            <div className="col-md-6">
                <button className='btn btn-success btn-sm mt-2 mb-2 text-white' onClick={createFee}>Crear</button>
            </div>
            <div className="col-md-6 d-flex justify-content-end align-items-center">
                <input
                    type="text"
                    className="col-md-3 form-control form-control-sm mt-2 mb-2"
                    placeholder="Buscar por nombre" // Search by name
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
                    title="Lista de Cuotas" // List of Fees
                    columns={columns}
                    data={filteredFees}
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
                            <h5 className="modal-title">Confirmar Baja de Cuota</h5> {/* Confirm Fee Deactivation */}
                            <button type="button" className="close" aria-label="Cerrar" onClick={toggleModal}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>¿Está seguro de que desea dar de baja esta cuota? La cuota seguirá apareciendo en reportes históricos pero no podrá ser usada para nuevos pagos.</p>
                            
                            <div className="form-group mt-3">
                                <label htmlFor="reason">Motivo de la Baja <span className="text-danger">*</span></label> {/* Deactivation Reason */}
                                <textarea
                                    id="reason"
                                    className="form-control"
                                    rows="3"
                                    value={deactivationReason}
                                    onChange={(e) => setDeactivationReason(e.target.value)}
                                    placeholder="Ingrese la razón de la baja (Ej: Cuota descontinuada, error en monto inicial, etc.)"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={toggleModal}>Cancelar</button> {/* Cancel */}
                            <button 
                                type="button" 
                                className="btn btn-danger" 
                                onClick={handleDeactivation}
                                disabled={!deactivationReason.trim()} // Disabled if no reason is provided
                            >
                                Dar de Baja {/* Deactivate */}
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

export default FeesTable;