import React, { useEffect, useState, useContext, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { MessageContext } from './MessageContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// 🚨 Import the hook
import usePermission from "../hooks/usePermission"; 

const endpoint = '/api/addresses';

// 🚨 Receive 'user' as a prop from App.jsx
const ShowAddresses = ({ user }) => {
    // State variables
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filteredAddresses, setFilteredAddresses] = useState([]);

    // States for soft deletion modal
    const [showModal, setShowModal] = useState(false);
    const [addressToDeactivate, setAddressToDeactivate] = useState(null);
    const [deactivationReason, setDeactivationReason] = useState('');

    // 🚨 Initialize the permission hook
    const { can } = usePermission(user);

    // 🛡️ Extraction to constants for stable permission evaluation
    const canCreate = user ? can('Crear-predios') : false;
    const canEdit = user ? can('Editar-predios') : false;
    const canDeactivate = user ? can('Eliminar-predios') : false;
    const canCreatePayment = user ? can('Crear-pagos') : false;
    const canViewPayments = user ? can('Ver-pagos') : false;

    // Context hook for global messages
    const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    // Function to fetch all addresses
    const fetchAddresses = async () => {
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

    // Filter addresses based on search input
    useEffect(() => {
        const result = addresses.filter(addr => {
            const streetName = addr.street?.name || ''; 
            const addressText = `${addr.community} ${streetName} ${addr.street_number} ${addr.type}`;
            const residentName = addr.resident ? `${addr.resident.name} ${addr.resident.last_name}` : '';
            const searchText = search.toLowerCase();

            return addressText.toLowerCase().includes(searchText) ||
                residentName.toLowerCase().includes(searchText);
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
                setSuccessMessage('Entrada de catálogo dada de baja exitosamente.');
                fetchAddresses(); 
            }
        } catch (error) {
            console.error('Deactivation error:', error);
            const msg = error.response?.data?.message || 'Fallo al dar de baja la entrada del catálogo.';
            setErrorMessage(msg);
        } finally {
            setShowModal(false);
            setDeactivationReason('');
        }
    };

    const editAddress = (id) => navigate(`/addresses/edit/${id}`);
    const createAddress = () => navigate('/addresses/create');
    const createPayment = (id) => navigate(`/addresses/payment/${id}`);
    const viewPaymentHistory = (id) => navigate(`/addresses/payments/history/${id}`);

    const toggleModal = () => setShowModal(!showModal);

    const confirmDeactivation = (id) => {
        setAddressToDeactivate(id);
        toggleModal();
    };

    const handleDeactivation = () => deactivateAddress(addressToDeactivate, deactivationReason);

    // 🚨 UseMemo for columns to handle button visibility based on permissions
    const columns = useMemo(() => [
        {
            name: 'Dirección',
            selector: row => row.street?.name || '', 
            sortable: true,
            cell: row => (
                <div style={{ lineHeight: '1.2' }}>
                    <span className="d-block">{`${row.street?.name || 'N/A'} #${row.street_number}`}</span>
                    <span className="badge bg-secondary">{row.type}</span>
                </div>
            ),
            minWidth: '250px',
        },
        {
            name: 'Residente Asignado',
            selector: row => row.resident ? `${row.resident.name} ${row.resident.last_name}` : 'Vacante',
            sortable: true,
            cell: row => (
                <span className={row.resident ? 'fw-bold' : 'text-muted'}>
                    {row.resident ? `${row.resident.name} ${row.resident.last_name}` : 'Vacante'}
                </span>
            ),
            minWidth: '180px',
        },
        { name: 'Comentarios', selector: row => row.comments, sortable: true },
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
                            {/* 🛡️ Permission check: Crear-pagos */}
                            {canCreatePayment && (
                                <button className="btn btn-primary btn-sm" onClick={() => createPayment(row.id)}>
                                    Pagar
                                </button>
                            )}
                            {/* 🛡️ Permission check: Ver-pagos */}
                            {canViewPayments && (
                                <button className="btn btn-warning btn-sm" onClick={() => viewPaymentHistory(row.id)}>
                                    <i className="fas fa-history"></i> Historial
                                </button>
                            )}
                        </>
                    )}

                    {/* 🛡️ Permission check: Editar-predios */}
                    {canEdit && (
                        <button className="btn btn-info btn-sm" onClick={() => editAddress(row.id)} disabled={!!row.deleted_at}>
                            Editar
                        </button>
                    )}

                    {/* 🛡️ Permission check: Eliminar-predios */}
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
            minWidth: '350px', 
        },
    ], [canEdit, canDeactivate, canCreatePayment, canViewPayments, navigate]);

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
                    <button className='btn btn-success btn-sm mt-2 mb-2 text-white' onClick={createAddress}>
                        Crear Dirección
                    </button>
                ) : <div />}
            </div>
            <div className="col-md-6 d-flex justify-content-end align-items-center">
                <input
                    type="text"
                    className="col-md-5 form-control form-control-sm mt-2 mb-2"
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
                    title="Lista de direcciones"
                    columns={columns}
                    data={filteredAddresses}
                    progressPending={loading}
                    noDataComponent={<NoDataComponent />}
                    pagination
                    highlightOnHover
                    striped
                />
            </div>

            {/* Modal for Deactivation */}
            <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header bg-danger text-white">
                            <h5 className="modal-title">Confirmar Baja de Catálogo</h5>
                            <button type="button" className="close" onClick={toggleModal}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>¿Está seguro de que desea dar de baja esta entrada del catálogo de direcciones?</p>
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

export default ShowAddresses;