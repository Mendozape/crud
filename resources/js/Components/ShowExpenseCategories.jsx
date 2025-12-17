import React, { useEffect, useState, useContext, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { MessageContext } from './MessageContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// 🚨 Import the hook
import usePermission from "../hooks/usePermission"; 

const endpoint = '/api/expense_categories';

// 🚨 Receive 'user' as a prop from App.jsx
const ShowExpenseCategories = ({ user }) => {
    // State variables for data and filtering
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filteredCategories, setFilteredCategories] = useState([]);
    
    // States for soft deletion modal
    const [showModal, setShowModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null); 
    const [modalError, setModalError] = useState(''); 
    
    // 🚨 Initialize the permission hook
    const { can } = usePermission(user);

    // 🛡️ Extraction to constants for stable permission evaluation
    const canCreate = user ? can('Crear-catalogo-gastos') : false;
    const canEdit = user ? can('Editar-catalogo-gastos') : false;
    const canDelete = user ? can('Eliminar-catalogo-gastos') : false;

    // Context hook for global messages
    const { setSuccessMessage, setErrorMessage, errorMessage, successMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    // Function to fetch all categories
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get(endpoint, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
            });
            setCategories(response.data.data || []);
            setFilteredCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setErrorMessage('Fallo al cargar las categorías.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const result = categories.filter(category => 
            category.name.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredCategories(result);
    }, [search, categories]);

    const deleteCategory = async (id) => {
        setModalError('');
        setSuccessMessage('');

        try {
            const response = await axios.delete(`${endpoint}/${id}`, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
            });
            
            if (response.status === 204 || response.status === 200) {
                setSuccessMessage('Categoría eliminada exitosamente.');
                setShowModal(false);
                fetchCategories();
            } 
        } catch (error) {
            console.error('Deletion error:', error);
            const msg = error.response?.data?.message || 'Fallo al eliminar la categoría.';
            setModalError(msg);
        }
    };

    const editCategory = (id) => navigate(`/expense_categories/edit/${id}`);
    const createCategory = () => navigate('/expense_categories/create');
    const toggleModal = () => setShowModal(!showModal);
    
    const confirmDeletion = (id) => {
        setCategoryToDelete(id);
        setModalError(''); 
        setErrorMessage('');
        setSuccessMessage('');
        toggleModal();
    };
    
    const handleDeletion = () => {
        if (categoryToDelete) {
            deleteCategory(categoryToDelete);
        }
    };

    // 🚨 UseMemo for columns to handle button visibility based on permissions
    const columns = useMemo(() => [
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
                    {/* 🛡️ Permission check for Edit button */}
                    {canEdit && (
                        <button 
                            className="btn btn-info btn-sm" 
                            onClick={() => editCategory(row.id)} 
                            disabled={!!row.deleted_at}
                        >
                            Editar
                        </button>
                    )}
                    
                    {/* 🛡️ Permission check for Delete/Deactivate button */}
                    {canDelete && (
                        <>
                            {row.deleted_at ? (
                                <button className="btn btn-secondary btn-sm" disabled>
                                    Eliminado
                                </button>
                            ) : (
                                <button 
                                    className="btn btn-danger btn-sm" 
                                    onClick={() => confirmDeletion(row.id)}
                                >
                                    Dar de baja
                                </button>
                            )}
                        </>
                    )}
                </div>
            ),
            minWidth: '150px',
        },
    ], [canEdit, canDelete, navigate]);

    const NoDataComponent = () => (
        <div style={{ padding: '24px', textAlign: 'center', fontSize: '1.1em', color: '#6c757d' }}>
            No hay registros para mostrar.
        </div>
    );

    // Auto-clear success messages
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, setSuccessMessage]);

    return (
        <div className="container-fluid mt-4">
            <h2 className="mb-4 text-primary">Catálogo de Categorías de Gastos</h2>

            <div className="row mb-4 border border-primary rounded p-3">
                <div className="col-md-6">
                    {/* 🛡️ Permission check for Create button */}
                    {canCreate ? (
                        <button className='btn btn-success btn-sm mt-2 mb-2 text-white' onClick={createCategory}>
                            Crear Categoría
                        </button>
                    ) : <div />}
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
                    {successMessage && <div className="alert alert-success text-center">{successMessage}</div>}
                    {errorMessage && !showModal && <div className="alert alert-danger text-center">{errorMessage}</div>}
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
                            <button type="button" className="close" onClick={toggleModal}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>¿Está seguro de que desea dar de baja la categoría?</p>
                            {modalError && <div className="alert alert-danger text-center mt-3">{modalError}</div>}
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

export default ShowExpenseCategories;