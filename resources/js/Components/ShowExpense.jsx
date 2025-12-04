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
    // NEW STATE: Local error message specific to the modal
    const [modalError, setModalError] = useState(''); 

    // Context hook for global messages
    const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    // Function to fetch all expenses (eager loads the 'category')
    const fetchExpenses = async () => {
        setLoading(true);
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
            // Check category name
            (expense.category?.name?.toLowerCase().includes(lowerCaseSearch)) ||
            // Check the 'amount' field (converted to string)
            (expense.amount?.toString().toLowerCase().includes(lowerCaseSearch))
        );
        setFilteredExpenses(result);
    }, [search, expenses]);

    // Function to perform soft deletion (COMPLETED LOGIC)
    const deleteExpense = async (id, reason) => {
        setModalError('');
        setSuccessMessage('');
        setErrorMessage(''); // Clear global error on submission attempt

        try {
            const response = await axios.delete(`${endpoint}/${id}`, {
                withCredentials: true,
                headers: { Accept: 'application/json' },
                // Send the reason in the DELETE body (required by the controller)
                data: { reason: reason } 
            });

            if (response.status === 204 || response.status === 200) {
                // USER-FACING SPANISH TEXT
                setSuccessMessage('Gasto eliminado exitosamente.');
                setShowModal(false); // Close the modal on success
                fetchExpenses(); // Refresh the list
            } 
        } catch (error) {
            console.error('Deletion error:', error);
            // Get error message from API or fallback
            const msg = error.response?.data?.message || 'Fallo al eliminar el gasto.';
            
            // Set error message to the LOCAL modal state
            setModalError(msg); 
            // IMPORTANT: Do not close modal on failure
        }
    };

    // Navigation and Modal handlers
    const editExpense = (id) => navigate(`/expenses/edit/${id}`);
    const createExpense = () => navigate('/expenses/create');

    const toggleModal = () => setShowModal(!showModal);
    
    const confirmDeletion = (id) => {
        setExpenseToDelete(id);
        setDeletionReason('');
        setErrorMessage(''); // Clear global error
        setSuccessMessage('');
        setModalError(''); // Clear local modal error
        toggleModal();
    };

    const handleDeletion = () => {
        // Frontend validation for minimum reason length
        if (!deletionReason.trim() || deletionReason.trim().length < 10) { 
            setModalError('Debe especificar un motivo de la eliminación (mínimo 10 caracteres).');
            return;
        }
        deleteExpense(expenseToDelete, deletionReason);
    };

    // DataTable column definitions 
    const columns = [
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
    const NoDataComponent = () => (
        <div style={{ padding: '24px', textAlign: 'center', fontSize: '1.1em', color: '#6c757d' }}>
            No hay registros para mostrar.
        </div>
    );

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
                    {errorMessage && !showModal && <div className="alert alert-danger text-center">{errorMessage}</div>}
                </div>

                <div className="col-md-12 mt-4">
                    <DataTable
                        title="Lista de Gastos"
                        columns={columns}
                        data={filteredExpenses}
                        progressPending={loading}
                        noDataComponent={<NoDataComponent />}
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[5, 10, 15, 20]}
                        highlightOnHover
                        striped
                    />
                </div>

                {/* FULL DELETION CONFIRMATION MODAL */}
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
                                <p>¿Está seguro de que desea eliminar este gasto?</p>
                                
                                <div className="form-group mt-3">
                                    <label htmlFor="reason">Motivo de la Eliminación <span className="text-danger">*</span></label>
                                    <textarea
                                        id="reason"
                                        className="form-control"
                                        rows="3"
                                        value={deletionReason}
                                        onChange={(e) => setDeletionReason(e.target.value)}
                                        placeholder="Ingrese la razón de la eliminación (mínimo 10 caracteres)."
                                    />
                                </div>
                                
                                {/* Display LOCAL modalError here */}
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
        </div>
    );
};

export default ExpensesTable;