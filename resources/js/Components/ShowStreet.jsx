import React, { useEffect, useState, useContext, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { MessageContext } from './MessageContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// 🚨 Import the hook
import usePermission from "../hooks/usePermission"; 

const endpoint = '/api/streets';

// 🚨 Receive 'user' as a prop from App.jsx
const StreetTable = ({ user }) => {
    // State variables
    const [streets, setStreets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filteredStreets, setFilteredStreets] = useState([]);
    
    // States for soft deletion modal
    const [showModal, setShowModal] = useState(false);
    const [streetToDeactivate, setStreetToDeactivate] = useState(null); 

    // 🚨 Initialize the permission hook
    const { can } = usePermission(user);

    // 🛡️ Extraction to constants for stable permission evaluation
    const canCreate = user ? can('Crear-calles') : false;
    const canEdit = user ? can('Editar-calles') : false;
    const canDeactivate = user ? can('Eliminar-calles') : false;

    // Context hook for global messages
    const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    // Function to fetch all streets
    const fetchStreets = async () => {
        setLoading(true);
        try {
            const response = await axios.get(endpoint, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
            });
            setStreets(response.data.data || []);
            setFilteredStreets(response.data.data || []);
        } catch (error) {
            console.error('Error fetching streets:', error);
            setErrorMessage('Fallo al cargar las calles.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStreets();
    }, []);

    useEffect(() => {
        const result = streets.filter(street => 
            street.name.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredStreets(result);
    }, [search, streets]);

    const deactivateStreet = async (id) => {
        try {
            const response = await axios.delete(`${endpoint}/${id}`, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
            });
            
            if (response.status === 200) {
                setSuccessMessage('Calle dada de baja exitosamente.');
                setShowModal(false); 
                fetchStreets();
            } 
        } catch (error) {
            const msg = error.response?.data?.message || 'Fallo al dar de baja la calle.';
            setErrorMessage(msg);
        }
    };

    const editStreet = (id) => navigate(`/streets/edit/${id}`);
    const createStreet = () => navigate('/streets/create');
    const toggleModal = () => setShowModal(!showModal);
    
    const confirmDeactivation = (id) => {
        setStreetToDeactivate(id);
        toggleModal();
    };
    
    const handleDeactivation = () => {
        deactivateStreet(streetToDeactivate);
    }

    // 🚨 UseMemo for columns to handle button visibility based on permissions
    const columns = useMemo(() => [
        { name: 'Nombre', selector: row => row.name, sortable: true },
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
                            onClick={() => editStreet(row.id)} 
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
                                <button className="btn btn-danger btn-sm" onClick={() => confirmDeactivation(row.id)}>Dar de Baja</button>
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

    // Effects to clear messages
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
                    <button className='btn btn-success btn-sm mt-2 mb-2 text-white' onClick={createStreet}>Crear Calle</button>
                ) : (
                    <div /> // Spacer
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
                {errorMessage && !showModal && <div className="alert alert-danger text-center">{errorMessage}</div>}
            </div>

            <div className="col-md-12 mt-4">
                <DataTable
                    title="Lista de Calles" 
                    columns={columns}
                    data={filteredStreets}
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
                            <h5 className="modal-title">Confirmar Baja de Calle</h5> 
                            <button type="button" className="close" onClick={toggleModal}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>¿Está seguro de que desea dar de baja esta calle? No podrá ser asignada a nuevas direcciones y debe asegurarse que no tenga direcciones asignadas actualmente.</p>
                            {errorMessage && <div className="alert alert-danger text-center mt-2">{errorMessage}</div>}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={toggleModal}>Cancelar</button> 
                            <button type="button" className="btn btn-danger" onClick={handleDeactivation}>Dar de Baja</button>
                        </div>
                    </div>
                </div>
            </div>
            {showModal && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default StreetTable;