import React, { useEffect, useState, useContext } from 'react';
import DataTable from 'react-data-table-component';
import { MessageContext } from './MessageContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const endpoint = 'http://localhost:8000/api/residents';

const axiosOptions = {
    withCredentials: true,
    headers: {
        Accept: 'application/json',
    },
};

const ResidentsTable = () => {
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filteredResidents, setFilteredResidents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [residentToDelete, setResidentToDelete] = useState(null);
    
    const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    const fetchResidents = async () => {
        try {
            const response = await axios.get(endpoint, axiosOptions);
            setResidents(response.data || []);
            setFilteredResidents(response.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching residents:', error);
            setLoading(false);
            setErrorMessage('Error al cargar la lista de residentes.');
        }
    };

    useEffect(() => {
        fetchResidents();
    }, []);

    useEffect(() => {
        const result = residents.filter(resident => {
            const fullName = `${resident.name} ${resident.last_name}`.toLowerCase();
            const email = resident.email.toLowerCase();
            const searchText = search.toLowerCase();
            
            return fullName.includes(searchText) || email.includes(searchText);
        });
        setFilteredResidents(result);
    }, [search, residents]);

    const deleteResident = async (id) => {
        try {
            const response = await axios.delete(`${endpoint}/${id}`, axiosOptions);
            if (response.status === 200) {
                setSuccessMessage('Residente eliminado con éxito.');
                fetchResidents();
            } else {
                setErrorMessage('Error al eliminar el residente.');
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error deleting resident:', error);
            const detailedMessage = error.response?.data?.message || 'Error al eliminar el residente.';
            setErrorMessage(detailedMessage);
            setShowModal(false);
        }
    };

    const editResident = (id) => navigate(`/residents/edit/${id}`);
    const createResident = () => navigate('/residents/create');
    
    const toggleModal = () => setShowModal(!showModal);
    const confirmDelete = (id) => {
        setResidentToDelete(id);
        toggleModal();
    };
    const handleDelete = () => deleteResident(residentToDelete);

    const columns = [
        {
            name: 'Foto', 
            selector: row => {
                const photoUrl =
                    row.photo && row.photo !== 'undefined' && row.photo !== 'null' && row.photo !== ''
                        ? `http://127.0.0.1:8000/storage/${row.photo}`
                        : `http://127.0.0.1:8000/storage/no_image.png`;
                return <img src={photoUrl} style={{ width: '50px', borderRadius: '50%' }} alt="Foto de residente" />;
            },
            sortable: false,
        },
        { 
            name: 'Nombre Completo', 
            selector: row => `${row.name} ${row.last_name}`,
            sortable: true,
            cell: row => `${row.name} ${row.last_name}`,
            minWidth: '200px',
        },
        { 
            name: 'Correo Electrónico', 
            selector: row => row.email, 
            sortable: true 
        },
        { 
            name: 'Comentarios', 
            selector: row => row.comments, 
            sortable: true 
        },
        {
            name: 'Acciones', 
            cell: row => (
                <div className="d-flex gap-1 justify-content-end" style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-info btn-sm" onClick={() => editResident(row.id)}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => confirmDelete(row.id)}>
                        Eliminar
                    </button>
                </div>
            ),
            minWidth: '150px',
        },
    ];
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
                <button className='btn btn-success btn-sm mt-2 mb-2 text-white' onClick={createResident}>Crear Residente</button>
            </div>
            <div className="col-md-6 d-flex justify-content-end align-items-center">
                <input
                    type="text"
                    className="col-md-3 form-control form-control-sm mt-2 mb-2"
                    placeholder="Buscar por nombre o correo"
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
                    noDataComponent={<NoDataComponent />}
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[5, 10, 15, 20]}
                    selectableRows
                    selectableRowsHighlight
                    highlightOnHover
                    striped
                />
            </div>

            {/* Delete confirmation Modal */}
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
            {showModal && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default ResidentsTable;