import React, { useEffect, useState, useContext } from 'react';
import DataTable from 'react-data-table-component';
import { MessageContext } from './MessageContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const endpoint = 'http://localhost:8000/api/residents';

// Global axios options with credentials
const axiosOptions = {
    withCredentials: true,
    headers: {
        Accept: 'application/json',
    },
};

const ResidentsTable = () => {
    // State variables
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filteredResidents, setFilteredResidents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [residentToDelete, setResidentToDelete] = useState(null);
    
    // Context hook for global messages
    const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    // Function to fetch all residents from the API
    const fetchResidents = async () => {
        try {
            // ENGLISH CODE COMMENTS
            // The controller must return the 'addressCatalog' relationship data (eager loaded)
            const response = await axios.get(endpoint, axiosOptions);
            setResidents(response.data);
            setFilteredResidents(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching residents:', error);
            setLoading(false);
            setErrorMessage('Error al cargar la lista de residentes.');
        }
    };

    // Initial data load on component mount
    useEffect(() => {
        fetchResidents();
    }, []);

    // Filter residents based on search input (by name OR by address)
    useEffect(() => {
        // ENGLISH CODE COMMENTS
        const result = residents.filter(resident => {
            const nameMatch = resident.name.toLowerCase().includes(search.toLowerCase());
            
            // Search logic now includes the full address (from the relation)
            const address = resident.address_catalog ? 
                `${resident.address_catalog.community} ${resident.address_catalog.street} ${resident.address_catalog.street_number}` : 
                '';
            const addressMatch = address.toLowerCase().includes(search.toLowerCase());

            return nameMatch || addressMatch;
        });
        setFilteredResidents(result);
    }, [search, residents]);

    // Delete confirmation and API call logic
    const deleteResident = async (id) => {
        // ENGLISH CODE COMMENTS
        try {
            const response = await axios.delete(`${endpoint}/${id}`, axiosOptions);
            if (response.status === 200) {
                setSuccessMessage('Residente eliminado con éxito.');
                fetchResidents(); // Refresh the list
            } else {
                setErrorMessage('Error al eliminar el residente.');
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error deleting resident:', error);
            
            // KEY FIX: Extract the specific error message from the Laravel 409 Conflict response
            const detailedMessage = error.response?.data?.message || 'Error al eliminar el residente.';
            
            setErrorMessage(detailedMessage);
            setShowModal(false);
        }
    };

    // Navigation and Modal handlers
    const editResident = (id) => navigate(`/residents/edit/${id}`);
    const createResident = () => navigate('/residents/create');
    const createPayment = (id) => navigate(`/residents/payment/${id}`);
    
    // Function to navigate to Payment History
    const viewPaymentHistory = (id) => navigate(`/residents/payments/history/${id}`); 
    
    const toggleModal = () => setShowModal(!showModal);
    const confirmDelete = (id) => {
        setResidentToDelete(id);
        toggleModal();
    };
    const handleDelete = () => deleteResident(residentToDelete);

    // DataTable column definitions (Translated names)
    const columns = [
        {
            name: 'Foto', 
            selector: row => {
                // Determine photo URL path
                const photoUrl =
                    row.photo && row.photo !== 'undefined' && row.photo !== 'null' && row.photo !== ''
                        ? `http://127.0.0.1:8000/storage/${row.photo}`
                        : `http://127.0.0.1:8000/storage/no_image.png`;
                return <img src={photoUrl} style={{ width: '50px', borderRadius: '50%' }} alt="Foto de residente" />;
            },
            sortable: false,
        },
        { name: 'Nombre', selector: row => row.name, sortable: true },
        { name: 'Apellidos', selector: row => row.last_name, sortable: true },
        { name: 'email', selector: row => row.email, sortable: true },
        
        // NEW NORMALIZED ADDRESS COLUMN (ORDER ADJUSTED)
        { 
            name: 'Dirección', 
            // Now displays: Calle #Número, Comunidad
            selector: row => 
                row.address_catalog ? 
                `${row.address_catalog.street} #${row.address_catalog.street_number}` : 
                'No Asignada', 
            sortable: true,
            minWidth: '250px',
        },
        
        { name: 'Comentarios', selector: row => row.comments, sortable: true },
        
        // Column for Payment History
        {
            name: 'Historial de pagos', 
            cell: row => (
                <button 
                    className="btn btn-warning btn-sm" 
                    onClick={() => viewPaymentHistory(row.id)}
                >
                    <i className="fas fa-history"></i> Ver Historial
                </button>
            ),
            sortable: false,
            minWidth: '160px',
        },

        {
            name: 'Acciones', 
            cell: row => (
                // Use Bootstrap classes for spacing and preventing line wraps
                <div className="d-flex gap-1 justify-content-end" style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => createPayment(row.id)}>Pagar</button>
                    <button className="btn btn-info btn-sm" onClick={() => editResident(row.id)}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => confirmDelete(row.id)}>
                        Eliminar
                    </button>
                </div>
            ),
            // Ensure sufficient width
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
                <button className='btn btn-success btn-sm mt-2 mb-2 text-white' onClick={createResident}>Crear Residente</button>
            </div>
            <div className="col-md-6 d-flex justify-content-end align-items-center">
                <input
                    type="text"
                    className="col-md-3 form-control form-control-sm mt-2 mb-2"
                    placeholder="Buscar por nombre o dirección" // Updated search placeholder
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
                    title="Lista de Residentes" 
                    columns={columns}
                    data={filteredResidents}
                    progressPending={loading}
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[5, 10, 15, 20]}
                    selectableRows
                    selectableRowsHighlight
                    highlightOnHover
                    striped
                />
            </div>

            {/* Delete confirmation Modal (Spanish translation) */}
            <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirmar Eliminación</h5>
                            <button type="button" className="close" aria-label="Cerrar" onClick={toggleModal}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            ¿Está seguro de que desea eliminar este residente?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={toggleModal}>Cancelar</button>
                            <button type="button" className="btn btn-danger" onClick={handleDelete}>Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResidentsTable;