import React, { useEffect, useState, useContext } from 'react';
import DataTable from 'react-data-table-component';
import { MessageContext } from './MessageContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const endpoint = 'http://localhost:8000/api/expense_categories';

const ShowExpenseCategories = () => {
    // State variables for data and filtering
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filteredCategories, setFilteredCategories] = useState([]);
    
    // States for soft deletion modal
    const [showModal, setShowModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null); 
    
    // Context hook for global messages
    const { setSuccessMessage, setErrorMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    // Function to fetch all categories (including soft-deleted ones)
    const fetchCategories = async () => {
        try {
            const response = await axios.get(endpoint, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
            });
            // Update the main list and the filtered list
            setCategories(response.data.data || []);
            setFilteredCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            // USER-FACING SPANISH TEXT
            setErrorMessage('Fallo al cargar las categorías. Puede que no esté autenticado.');
        } finally {
            setLoading(false);
        }
    };

    // Initial data load on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Filter categories based on search input (by name)
    useEffect(() => {
        const result = categories.filter(category => 
            category.name.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredCategories(result);
    }, [search, categories]);

    // Function to perform soft deletion
    const deleteCategory = async (id) => {
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await axios.delete(`${endpoint}/${id}`, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
            });
            
            if (response.status === 204 || response.status === 200) {
                // USER-FACING SPANISH TEXT
                setSuccessMessage('Categoría eliminada exitosamente.');
                setShowModal(false);
                fetchCategories();
            } 
        } catch (error) {
            console.error('Deletion error:', error);
            // Use the error message from the API or a fallback
            const msg = error.response?.data?.message || 'Fallo al eliminar la categoría.';
            setErrorMessage(msg);
        }
    };

    // Navigation handlers
    const editCategory = (id) => navigate(`/expense_categories/edit/${id}`);
    const createCategory = () => navigate('/expense_categories/create');

    // Modal handlers
    const toggleModal = () => setShowModal(!showModal);
    
    const confirmDeletion = (id) => {
        setCategoryToDelete(id);
        setErrorMessage('');
        setSuccessMessage('');
        toggleModal();
    };
    
    const handleDeletion = () => {
        if (categoryToDelete) {
            deleteCategory(categoryToDelete);
        }
    };

    // DataTable column definitions
    const columns = [
        { name: 'ID', selector: row => row.id, sortable: true, width: '60px' },
        { name: 'Nombre de la Categoría', selector: row => row.name, sortable: true },
        { 
            name: 'Estado',
            selector: row => row.deleted_at ? 'Inactivo' : 'Activo', 
            sortable: true,
            cell: row => (
                <span className={`badge ${row.deleted_at ? 'bg-danger' : 'bg-success'}`}> 
                    {row.deleted_at ? 'Inactivo' : 'Activo'}
                </span>
            ),
        },
        {
            name: 'Acciones',
            cell: row => (
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button 
                        className="btn btn-info btn-sm" 
                        onClick={() => editCategory(row.id)} 
                        disabled={!!row.deleted_at}
                    >
                        Editar
                    </button>
                    
                    {row.deleted_at ? (
                        <button className="btn btn-secondary btn-sm" disabled>
                            Eliminado
                        </button>
                    ) : (
                        <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => confirmDeletion(row.id)}
                        >
                            Eliminar
                        </button>
                    )}
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

    return (
        <div className="container-fluid mt-4">
            <h2 className="mb-4 text-primary">Catálogo de Categorías de Gastos</h2>

            <div className="row mb-4 border border-primary rounded p-3">
                <div className="col-md-6">
                    <button className='btn btn-success btn-sm mt-2 mb-2 text-white' onClick={createCategory}>
                        Crear Categoría
                    </button>
                </div>
                <div className="col-md-6 d-flex justify-content-end align-items-center">
                    <input
                        type="text"
                        className="col-md-5 form-control form-control-sm mt-2 mb-2"
                        placeholder="Buscar por nombre"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="col-md-12 mt-4">
                    {errorMessage && <div className="alert alert-danger text-center">{errorMessage}</div>}
                    {/* Assuming success message is handled globally or passed down */}
                </div>

                <div className="col-md-12 mt-4">
                    <DataTable
                        title="Lista de Categorías"
                        columns={columns}
                        data={filteredCategories}
                        progressPending={loading}
                        noDataComponent={<NoDataComponent />}
                        pagination
                        highlightOnHover
                        striped
                    />
                </div>
            </div>

            {/* Modal for Deletion Confirmation */}
            <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header bg-danger text-white">
                            <h5 className="modal-title">Confirmar Eliminación</h5>
                            <button type="button" className="close" aria-label="Cerrar" onClick={toggleModal}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>¿Está seguro de que desea eliminar suavemente esta categoría? Los gastos existentes permanecerán, pero esta opción ya no estará disponible para nuevos gastos.</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={toggleModal}>
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-danger" 
                                onClick={handleDeletion}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {showModal && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default ShowExpenseCategories;