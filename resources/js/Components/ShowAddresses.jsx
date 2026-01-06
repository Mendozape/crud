import React, { useEffect, useState, useContext, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { MessageContext } from './MessageContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// 🚨 Import the hook for permission management
import usePermission from "../hooks/usePermission"; 

const endpoint = '/api/addresses';

const ShowAddresses = ({ user }) => {
    // --- STATE VARIABLES ---
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filteredAddresses, setFilteredAddresses] = useState([]);

    // States for soft deletion modal
    const [showModal, setShowModal] = useState(false);
    const [addressToDeactivate, setAddressToDeactivate] = useState(null);
    const [deactivationReason, setDeactivationReason] = useState('');

    // --- PERMISSIONS CONFIGURATION ---
    const { can } = usePermission(user);
    const canCreate = user ? can('Crear-predios') : false;
    const canEdit = user ? can('Editar-predios') : false;
    const canDeactivate = user ? can('Eliminar-predios') : false;
    const canCreatePayment = user ? can('Crear-pagos') : false;
    const canViewPayments = user ? can('Ver-pagos') : false;

    const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    // --- NAVIGATION FUNCTIONS ---
    // 🟢 FIXED: Added missing navigation functions
    const editAddress = (id) => navigate(`/addresses/edit/${id}`);
    const createAddress = () => navigate('/addresses/create');
    const createPayment = (id) => navigate(`/addresses/payment/${id}`);
    const viewPaymentHistory = (id) => navigate(`/addresses/payments/history/${id}`);

    /**
     * Fetches all address records from the API.
     */
    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const response = await axios.get(endpoint, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
            });
            setAddresses(response.data.data || []);
            setFilteredAddresses(response.data.data || []);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            setErrorMessage('Fallo al cargar el catálogo de direcciones.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    /**
     * Real-time search filter.
     */
    useEffect(() => {
        const result = addresses.filter(addr => {
            const streetName = addr.street?.name || ''; 
            const addressText = `${addr.community} ${streetName} ${addr.street_number} ${addr.type}`;
            const userName = addr.user ? `${addr.user.name}` : '';
            const searchText = search.toLowerCase();

            return addressText.toLowerCase().includes(searchText) ||
                userName.toLowerCase().includes(searchText);
        });
        setFilteredAddresses(result);
    }, [search, addresses]);

    const deactivateAddress = async (id, reason) => {
        try {
            const response = await axios.delete(`${endpoint}/${id}`, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
                data: { reason: reason } 
            });

            if (response.status === 200) {
                setSuccessMessage('Predio dado de baja exitosamente.');
                fetchAddresses(); 
            }
        } catch (error) {
            console.error('Deactivation error:', error);
            setErrorMessage(error.response?.data?.message || 'Error al desactivar predio.');
        } finally {
            setShowModal(false);
            setDeactivationReason('');
        }
    };

    const toggleModal = () => setShowModal(!showModal);

    const confirmDeactivation = (id) => {
        setAddressToDeactivate(id);
        setDeactivationReason('');
        toggleModal();
    };

    const handleDeactivation = () => {
        if (!deactivationReason.trim()) {
            setErrorMessage('Debe proporcionar un motivo para dar de baja.');
            return;
        }
        deactivateAddress(addressToDeactivate, deactivationReason);
    }

    // --- DATA TABLE COLUMNS ---
    const columns = useMemo(() => [
        {
            name: 'Dirección',
            selector: row => row.street?.name || '', 
            sortable: true,
            cell: row => (
                <div style={{ lineHeight: '1.2' }}>
                    <span className="d-block"><strong>{row.street?.name || 'N/A'} #{row.street_number}</strong></span>
                    <span className="badge bg-secondary">{row.type}</span>
                </div>
            ),
            minWidth: '220px',
        },
        {
            name: 'Residente (Usuario)',
            selector: row => row.user ? row.user.name : 'Sin asignar',
            sortable: true,
            cell: row => (
                <div>
                    <span className={row.user ? 'fw-bold' : 'text-muted'}>
                        {row.user ? row.user.name : 'Vacante'}
                    </span>
                    {row.user && <small className="d-block text-muted">{row.user.email}</small>}
                </div>
            ),
            minWidth: '200px',
        },
        { name: 'Comentarios', selector: row => row.comments, sortable: true, wrap: true },
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
                <div className="d-flex gap-1">
                    {!row.deleted_at && (
                        <>
                            {canCreatePayment && (
                                <button className="btn btn-primary btn-sm" onClick={() => createPayment(row.id)}>
                                    Pagar
                                </button>
                            )}
                            {canViewPayments && (
                                <button className="btn btn-warning btn-sm" onClick={() => viewPaymentHistory(row.id)}>
                                    Historial
                                </button>
                            )}
                        </>
                    )}

                    {canEdit && (
                        <button className="btn btn-info btn-sm text-white" onClick={() => editAddress(row.id)} disabled={!!row.deleted_at}>
                            Editar
                        </button>
                    )}

                    {canDeactivate && (
                        <>
                            {row.deleted_at ? (
                                <button className="btn btn-secondary btn-sm" disabled>Baja</button>
                            ) : (
                                <button className="btn btn-danger btn-sm" onClick={() => confirmDeactivation(row.id)}>Baja</button>
                            )}
                        </>
                    )}
                </div>
            ),
            minWidth: '300px', 
        },
    ], [canEdit, canDeactivate, canCreatePayment, canViewPayments, navigate]);

    const NoDataComponent = () => (
        <div style={{ padding: '24px', textAlign: 'center', fontSize: '1.1em', color: '#6c757d' }}>
            No hay predios registrados.
        </div>
    );

    return (
        <div className="row mb-4 border border-primary rounded p-3 bg-white">
            <div className="col-md-6">
                {canCreate && (
                    <button className='btn btn-success btn-sm mt-2 mb-2 text-white' onClick={createAddress}>
                        <i className="fas fa-plus"></i> Crear Dirección
                    </button>
                )}
            </div>
            <div className="col-md-6 d-flex justify-content-end align-items-center">
                <input
                    type="text"
                    className="col-md-7 form-control form-control-sm mt-2 mb-2"
                    placeholder="Buscar por calle, número o residente..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="col-md-12 mt-2">
                {successMessage && <div className="alert alert-success text-center py-2">{successMessage}</div>}
                {errorMessage && <div className="alert alert-danger text-center py-2">{errorMessage}</div>}
            </div>

            <div className="col-md-12 mt-2">
                <DataTable
                    title="Catálogo de Predios"
                    columns={columns}
                    data={filteredAddresses}
                    progressPending={loading}
                    noDataComponent={<NoDataComponent />}
                    pagination
                    highlightOnHover
                    striped
                    responsive
                />
            </div>

            {/* Modal for Deactivation */}
            <div className={`modal fade ${showModal ? 'show d-block' : 'd-none'}`} style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header bg-danger text-white">
                            <h5 className="modal-title">Confirmar Baja de Catálogo</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={toggleModal}></button>
                        </div>
                        <div className="modal-body">
                            <p>¿Está seguro de que desea dar de baja esta dirección? Esta acción es irreversible.</p>
                            <div className="form-group mt-3">
                                <label htmlFor="reason">Motivo de la Baja <span className="text-danger">*</span></label>
                                <textarea
                                    id="reason"
                                    className="form-control"
                                    rows="3"
                                    value={deactivationReason}
                                    onChange={(e) => setDeactivationReason(e.target.value)}
                                    placeholder="Ingrese la razón detallada..."
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={toggleModal}>Cancelar</button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleDeactivation}
                                disabled={!deactivationReason.trim()}
                            >
                                Confirmar Baja
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShowAddresses;