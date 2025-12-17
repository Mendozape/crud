import React, { useEffect, useState, useContext, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { MessageContext } from './MessageContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// 🚨 Import the hook
import usePermission from "../hooks/usePermission"; 

const endpoint = '/api/fees';

// 🚨 Receive 'user' as a prop from App.jsx
const FeesTable = ({ user }) => {
    // State variables
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filteredFees, setFilteredFees] = useState([]);
    
    // States for soft deletion modal
    const [showModal, setShowModal] = useState(false);
    const [feeToDeactivate, setFeeToDeactivate] = useState(null); 
    const [deactivationReason, setDeactivationReason] = useState(''); 

    // 🚨 Initialize the permission hook
    const { can } = usePermission(user);

    // 🛡️ Extraction to constants for stable permission evaluation
    const canCreate = user ? can('Crear-cuotas') : false;
    const canEdit = user ? can('Editar-cuotas') : false;
    const canDeactivate = user ? can('Eliminar-cuotas') : false;

    // Context hook for global messages
    const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    // Function to fetch all fees
    const fetchFees = async () => {
        setLoading(true);
        try {
            const response = await axios.get(endpoint, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
            });
            setFees(response.data.data || []);
            setFilteredFees(response.data.data || []);
        } catch (error) {
            console.error('Error fetching fees:', error);
            setErrorMessage('Fallo al cargar las cuotas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFees();
    }, []);

    useEffect(() => {
        const result = fees.filter(fee => fee.name.toLowerCase().includes(search.toLowerCase()));
        setFilteredFees(result);
    }, [search, fees]);

    const deactivateFee = async (id, reason) => {
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await axios.delete(`${endpoint}/${id}`, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
                data: { reason: reason } 
            });
            
            if (response.status === 200) {
                setSuccessMessage('Cuota dada de baja exitosamente.');
                setShowModal(false); 
                setDeactivationReason(''); 
                fetchFees(); 
            } 
        } catch (error) {
            const msg = error.response?.data?.message || 'Fallo al dar de baja la cuota.';
            setErrorMessage(msg);
        }
    };

    const editFee = (id) => navigate(`/fees/edit/${id}`);
    const createFee = () => navigate('/fees/create');
    const toggleModal = () => setShowModal(!showModal);
    
    const confirmDeactivation = (id) => {
        setFeeToDeactivate(id);
        setDeactivationReason(''); 
        setErrorMessage(''); 
        setSuccessMessage(''); 
        toggleModal();
    };
    
    const handleDeactivation = () => {
        if (!deactivationReason.trim()) {
            setErrorMessage('Debe especificar un motivo de la baja.');
            return;
        }
        deactivateFee(feeToDeactivate, deactivationReason);
    }

    // 🚨 UseMemo for columns to handle button visibility based on permissions
    const columns = useMemo(() => [
        { name: 'Nombre', selector: row => row.name, sortable: true },
        { name: 'Monto', selector: row => row.amount, sortable: true },
        { name: 'Descripción', selector: row => row.description, sortable: true },
        { 
            name: 'Estado', 
            selector: row => row.deleted_at ? 'Inactivo' : 'Activo', 
            sortable: true,
            cell: row => (
                <span className={`badge ${row.deleted_at ? 'bg-danger' : 'bg-info'}`}> 
                    {row.deleted_at ? 'Inactivo' : 'Activo'}
                </span>
            ),
        },
        {
            name: 'Acciones',
            cell: row => (
                <div style={{ display: 'flex', gap: '5px' }}>
                    {/* 🛡️ Permission check for Edit button */}
                    {canEdit && (
                        <button 
                            className="btn btn-info btn-sm" 
                            onClick={() => editFee(row.id)} 
                            disabled={!!row.deleted_at}
                        >
                            Editar
                        </button>
                    )}
                    
                    {/* 🛡️ Permission check for Deactivate button */}
                    {canDeactivate && (
                        <>
                            {row.deleted_at ? (
                                <button className="btn btn-secondary btn-sm" disabled>Dada de Baja</button>
                            ) : (
                                <button className="btn btn-danger btn-sm" onClick={() => confirmDeactivation(row.id)}>Dar de baja</button>
                            )}
                        </>
                    )}
                </div>
            ),
            minWidth: '200px',
        },
    ], [canEdit, canDeactivate, navigate]);

    const NoDataComponent = () => (
        <div style={{ padding: '24px', textAlign: 'center', fontSize: '1.1em', color: '#6c757d' }}>
            No hay registros para mostrar.
        </div>
    );

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, setSuccessMessage]);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => setErrorMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage, setErrorMessage]);

    return (
        <div className="row mb-4 border border-primary rounded p-3">
            <div className="col-md-6">
                {/* 🛡️ Permission check for Create button */}
                {canCreate ? (
                    <button className='btn btn-success btn-sm mt-2 mb-2 text-white' onClick={createFee}>Crear</button>
                ) : (
                    <div /> // Layout spacer
                )}
            </div>
            <div className="col-md-6 d-flex justify-content-end align-items-center">
                <input
                    type="text"
                    className="col-md-3 form-control form-control-sm mt-2 mb-2"
                    placeholder="Buscar por nombre"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="col-md-12 mt-4">
                {successMessage && <div className="alert alert-success text-center">{successMessage}</div>}
            </div>

            <div className="col-md-12 mt-4">
                <DataTable
                    title="Lista de Cuotas" 
                    columns={columns}
                    data={filteredFees}
                    progressPending={loading}
                    noDataComponent={<NoDataComponent />}
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[5, 10, 15, 20]}
                    highlightOnHover
                    striped
                />
            </div>

            {/* Modal for Deactivation Confirmation */}
            <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header bg-danger text-white">
                            <h5 className="modal-title">Confirmar Baja de Cuota</h5>
                            <button type="button" className="close" aria-label="Cerrar" onClick={toggleModal}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>¿Está seguro de que desea dar de baja esta cuota?</p>
                            <div className="form-group mt-3">
                                <label htmlFor="reason">Motivo de la Baja <span className="text-danger">*</span></label>
                                <textarea
                                    id="reason"
                                    className="form-control"
                                    rows="3"
                                    value={deactivationReason}
                                    onChange={(e) => setDeactivationReason(e.target.value)}
                                    placeholder="Ingrese la razón de la baja"
                                />
                            </div>
                            {errorMessage && <div className="alert alert-danger text-center mt-2">{errorMessage}</div>}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={toggleModal}>Cancelar</button>
                            <button 
                                type="button" 
                                className="btn btn-danger" 
                                onClick={handleDeactivation}
                                disabled={!deactivationReason.trim()}
                            >
                                Dar de baja
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {showModal && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default FeesTable;