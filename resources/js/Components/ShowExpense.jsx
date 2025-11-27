// src/components/ExpensesTable.jsx

import React, { useEffect, useState, useContext } from 'react';
import DataTable from 'react-data-table-component';
import { MessageContext } from './MessageContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const endpoint = 'http://localhost:8000/api/expenses';

const ExpensesTable = () => {
    // State variables for data and filtering
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    
    // States for soft deletion modal
    const [showModal, setShowModal] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState(null); 
    const [deletionReason, setDeletionReason] = useState(''); 

    // Context hook for global messages
    const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    // Function to fetch all expenses
    const fetchExpenses = async () => {
        try {
            const response = await axios.get(endpoint, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
            });
            // Update the main list and the filtered list
            setExpenses(response.data.data || []);
            setFilteredExpenses(response.data.data || []);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            // USER-FACING SPANISH TEXT: 'Fallo al cargar los gastos. Puede que no esté autenticado.'
            setErrorMessage('Fallo al cargar los gastos. Puede que no esté autenticado.');
        } finally {
            setLoading(false);
        }
    };

    // Initial data load on component mount
    useEffect(() => {
        fetchExpenses();
    }, []);

    // Filter expenses based on search input (by name)
    useEffect(() => {
        const result = expenses.filter(expense => 
            expense.name.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredExpenses(result);
    }, [search, expenses]);

    // Function to perform soft deletion
    const deleteExpense = async (id, reason) => {
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await axios.delete(`${endpoint}/${id}`, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
                // Include the deletion reason in the request body
                data: { reason: reason }
            });
            
            if (response.status === 204 || response.status === 200) {
                // USER-FACING SPANISH TEXT: 'Gasto eliminado exitosamente.'
                setSuccessMessage('Gasto eliminado exitosamente.');
                setShowModal(false);
                setDeletionReason('');
                // Refresh the list after successful deletion
                fetchExpenses();
            } 
        } catch (error) {
            console.error('Deletion error:', error);
            // Use the error message from the API or a fallback
            const msg = error.response?.data?.message || 'Fallo al eliminar el gasto.';
            setErrorMessage(msg);
        }
    };

    // Navigation handlers
    const editExpense = (id) => navigate(`/expenses/edit/${id}`);
    const createExpense = () => navigate('/expenses/create');

    // Modal handlers
    const toggleModal = () => setShowModal(!showModal);
    
    const confirmDeletion = (id) => {
        setExpenseToDelete(id);
        setDeletionReason('');
        setErrorMessage('');
        setSuccessMessage('');
        toggleModal();
    };
    
    const handleDeletion = () => {
        // Validate that a deletion reason is provided
        if (!deletionReason.trim()) {
            // USER-FACING SPANISH TEXT: 'Debe especificar un motivo de la eliminación.'
            setErrorMessage('Debe especificar un motivo de la eliminación.');
            return;
        }
        deleteExpense(expenseToDelete, deletionReason);
    };

    // DataTable column definitions
    const columns = [
        { name: 'Nombre', selector: row => row.name, sortable: true },
        { name: 'Monto', selector: row => `$${parseFloat(row.amount).toFixed(2)}`, sortable: true },
        { 
            name: 'Fecha', 
            // Format the date for Spanish locale display
            selector: row => new Date(row.expense_date).toLocaleDateString('es-MX'), 
            sortable: true 
        },
        { 
            name: 'Estado',
            selector: row => row.deleted_at ? 'Inactivo' : 'Activo', 
            sortable: true,
            // Custom cell rendering for status badge
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
                        onClick={() => editExpense(row.id)} 
                        // Disable editing if the expense is soft-deleted
                        disabled={!!row.deleted_at}
                    >
                        Editar
                    </button>
                    
                    {row.deleted_at ? (
                        // Display 'Eliminado' button for deleted records
                        <button className="btn btn-secondary btn-sm" disabled>
                            Eliminado
                        </button>
                    ) : (
                        // Display 'Eliminar' button for active records
                        <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => confirmDeletion(row.id)}
                        >
                            Eliminar
                        </button>
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
                <button className='btn btn-success btn-sm mt-2 mb-2 text-white' onClick={createExpense}>
                    Crear Gasto
                </button>
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
                    title="Lista de Gastos"
                    columns={columns}
                    data={filteredExpenses}
                    progressPending={loading}
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[5, 10, 15, 20]}
                    highlightOnHover
                    striped
                />
            </div>

            {/* Modal for Deletion Confirmation */}
            <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header bg-danger text-white">
                            <h5 className="modal-title">Confirmar Eliminación de Gasto</h5>
                            <button type="button" className="close" aria-label="Cerrar" onClick={toggleModal}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>¿Está seguro de que desea eliminar este gasto? El gasto seguirá apareciendo en reportes históricos pero no podrá ser usado.</p>
                            
                            <div className="form-group mt-3">
                                <label htmlFor="reason">Motivo de la Eliminación <span className="text-danger">*</span></label>
                                <textarea
                                    id="reason"
                                    className="form-control"
                                    rows="3"
                                    value={deletionReason}
                                    onChange={(e) => setDeletionReason(e.target.value)}
                                    placeholder="Ingrese la razón de la eliminación (Ej: Gasto duplicado, error en monto, etc.)"
                                />
                            </div>
                            
                            {errorMessage && <div className="alert alert-danger text-center mt-2">{errorMessage}</div>}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={toggleModal}>
                                Cancelar
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-danger" 
                                onClick={handleDeletion}
                                disabled={!deletionReason.trim()}
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

export default ExpensesTable;