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

    // Function to fetch all expenses (eager loads the 'category')
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
            // USER-FACING SPANISH TEXT
            setErrorMessage('Fallo al cargar los gastos. Puede que no esté autenticado.');
        } finally {
            setLoading(false);
        }
    };

    // Initial data load on component mount
    useEffect(() => {
        fetchExpenses();
    }, []);

    // Filter expenses based on search input
    useEffect(() => {
        const lowerCaseSearch = search.toLowerCase();
        
        const result = expenses.filter(expense => 
            // ⭐ FIX: Use optional chaining (?.) and check the category name for filtering.
            // Check category name
            (expense.category?.name?.toLowerCase().includes(lowerCaseSearch)) ||
            // Check the 'amount' field (converted to string)
            (expense.amount?.toString().toLowerCase().includes(lowerCaseSearch))
            // The original expense.name is NOT checked as it's been removed/is null.
        );
        setFilteredExpenses(result);
    }, [search, expenses]);

    // Function to perform soft deletion (omitted for brevity)
    const deleteExpense = async (id, reason) => {
        setErrorMessage('');
        setSuccessMessage('');

        try {
             // ... (deletion logic)
        } catch (error) {
            // ... (error handling)
        }
    };

    // Navigation and Modal handlers (omitted for brevity)
    const editExpense = (id) => navigate(`/expenses/edit/${id}`);
    const createExpense = () => navigate('/expenses/create');

    const toggleModal = () => setShowModal(!showModal);
    const confirmDeletion = (id) => {
        setExpenseToDelete(id);
        setDeletionReason('');
        setErrorMessage('');
        setSuccessMessage('');
        toggleModal();
    };
    const handleDeletion = () => {
        if (!deletionReason.trim()) {
            setErrorMessage('Debe especificar un motivo de la eliminación.');
            return;
        }
        deleteExpense(expenseToDelete, deletionReason);
    };

    // DataTable column definitions
    const columns = [
        // ⭐ FIX: Show the category name instead of the raw expense.name field.
        { name: 'Categoría', selector: row => row.category?.name || 'N/A', sortable: true },
        { name: 'Monto', selector: row => `$${parseFloat(row.amount).toFixed(2)}`, sortable: true },
        { 
            name: 'Fecha', 
            selector: row => new Date(row.expense_date).toLocaleDateString('es-MX'), 
            sortable: true 
        },
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
                        onClick={() => editExpense(row.id)} 
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
            minWidth: '200px',
        },
    ];

    // Effect to clear success message after 5 seconds (omitted for brevity)
    // Effect to clear error message after 5 seconds (omitted for brevity)

    return (
        <div className="container-fluid mt-4">
            <h2 className="mb-4 text-primary">Lista de Gastos</h2>

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
                        placeholder="Buscar por categoría o monto"
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

                {/* Modal for Deletion Confirmation (omitted for brevity) */}
                <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
                    {/* ... Modal content ... */}
                </div>
                {showModal && <div className="modal-backdrop fade show"></div>}
            </div>
        </div>
    );
};

export default ExpensesTable;