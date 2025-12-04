import React, { useEffect, useState, useContext } from 'react';
import DataTable from 'react-data-table-component';
import { MessageContext } from './MessageContext'; // Assuming MessageContext is available
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const endpoint = 'http://localhost:8000/api/streets';

const StreetTable = () => {
    // State variables
    const [streets, setStreets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filteredStreets, setFilteredStreets] = useState([]);
    
    // States for soft deletion modal
    const [showModal, setShowModal] = useState(false);
    const [streetToDeactivate, setStreetToDeactivate] = useState(null); 
    // [REMOVED]: const [deactivationReason, setDeactivationReason] = useState(''); 

    // Context hook for global messages
    const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    // Function to fetch all streets (including soft-deleted ones)
    const fetchStreets = async () => {
        try {
            // Controller uses withTrashed() to fetch all streets
            const response = await axios.get(endpoint, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
            });
            setStreets(response.data.data || []);
            setFilteredStreets(response.data.data || []);
        } catch (error) {
            console.error('Error fetching streets:', error);
            setErrorMessage('Fallo al cargar las calles. Puede que no esté autenticado.');
        } finally {
            setLoading(false);
        }
    };

    // Initial data load on component mount
    useEffect(() => {
        fetchStreets();
    }, []);

    // Filter streets based on search input (by name)
    useEffect(() => {
        const result = streets.filter(street => street.name.toLowerCase().includes(search.toLowerCase()));
        setFilteredStreets(result);
    }, [search, streets]);


    // Function to perform soft deletion (Dar de Baja). 'reason' parameter removed.
    const deactivateStreet = async (id) => {
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await axios.delete(`${endpoint}/${id}`, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
                // data: { reason: reason } // [REMOVED]: No longer sending the reason
            });
            
            if (response.status === 200) {
                setSuccessMessage('Calle dada de baja exitosamente.');
                setShowModal(false); 
                fetchStreets(); // Refresh list to show 'Inactivo' status
            } 
        } catch (error) {
            console.error('Deactivation error:', error);
            // Error message will be returned from the controller (e.g., if addresses are linked)
            const msg = error.response?.data?.message || 'Fallo al dar de baja la calle.';
            setErrorMessage(msg);
        }
    };

    // Navigation handlers
    const editStreet = (id) => navigate(`/streets/edit/${id}`);
    const createStreet = () => navigate('/streets/create');

    // Modal handlers
    const toggleModal = () => setShowModal(!showModal);
    
    const confirmDeactivation = (id) => {
        setStreetToDeactivate(id);
        setErrorMessage(''); 
        setSuccessMessage(''); 
        toggleModal();
    };
    
    // Simplified handler: directly calls deactivateStreet
    const handleDeactivation = () => {
        deactivateStreet(streetToDeactivate);
    }

    // DataTable column definitions
    const columns = [
        { name: 'Nombre', selector: row => row.name, sortable: true },
        
        // STATUS (Active/Inactive)
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
            name: 'Acciones', // Actions
            cell: row => (
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="btn btn-info btn-sm" onClick={() => editStreet(row.id)} disabled={!!row.deleted_at}>Editar</button>
                    
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
    
    const NoDataComponent = () => (
        <div style={{ padding: '24px', textAlign: 'center', fontSize: '1.1em', color: '#6c757d' }}>
            No hay registros para mostrar.
        </div>
    );

    // Effect to clear messages
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
                <button className='btn btn-success btn-sm mt-2 mb-2 text-white' onClick={createStreet}>Crear Calle</button>
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
            {/* Added error message display for better visibility before DataTable */}
            <div className="col-md-12 mt-4">
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

            {/* Modal for Deactivation Confirmation (Soft Delete) */}
            <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header bg-danger text-white">
                            <h5 className="modal-title">Confirmar Baja de Calle</h5> 
                            <button type="button" className="close" aria-label="Cerrar" onClick={toggleModal}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>¿Está seguro de que desea dar de baja esta calle? No podrá ser asignada a nuevas direcciones y debe asegurarse que no tenga direcciones asignadas actualmente.</p>
                            
                            {/* [REMOVED]: The form-group for 'Motivo de la Baja' */}
                            
                            {errorMessage && <div className="alert alert-danger text-center mt-2">{errorMessage}</div>}
                            
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={toggleModal}>Cancelar</button> 
                            <button 
                                type="button" 
                                className="btn btn-danger" 
                                onClick={handleDeactivation}
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

export default StreetTable;