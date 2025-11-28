// src/components/CreateExpense.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { MessageContext } from './MessageContext';
import { useNavigate } from 'react-router-dom';


const endpoint = 'http://localhost:8000/api/expenses';
const categoriesEndpoint = 'http://localhost:8000/api/expense_categories'; // Endpoint for catalog

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
};

export default function CreateExpense() {
    // State variables
    const [expenseCategoryId, setExpenseCategoryId] = useState('');
    // REMOVED: const [name, setName] = useState(''); // Removed the redundant name state
    const [amount, setAmount] = useState('');
    const [expenseDate, setExpenseDate] = useState(getTodayDate());
    const [formValidated, setFormValidated] = useState(false);

    // NEW STATES: To hold the list of categories from the API
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Context and navigation hooks
    const { setSuccessMessage, setErrorMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    // Effect to fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            // Clear any stale error message immediately before starting the fetch.
            setErrorMessage(''); 
            
            try {
                const res = await axios.get(categoriesEndpoint, {
                    withCredentials: true,
                    headers: { Accept: 'application/json' },
                });
                
                // If the request succeeds, filter active categories.
                const activeCategories = res.data.data.filter(cat => !cat.deleted_at);
                setCategories(activeCategories);
                
                // Re-add explicit clearance after successful async operation to override any late context error.
                setErrorMessage(''); 
                
            } catch (error) {
                // Log the detailed error response
                console.error("Error fetching categories:", error.response || error);
                
                // Display error only if the API call genuinely failed
                setErrorMessage("Fallo al cargar el catálogo de categorías."); // USER-FACING SPANISH TEXT
            } finally {
                // Set loading state to false regardless of success/failure
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, [setErrorMessage]); // Dependency array included to satisfy linter


    const store = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        // Frontend validation check
        // We only check category ID and amount, as 'name' is now entirely optional/removed
        if (form.checkValidity() === false || !expenseCategoryId) { 
            e.stopPropagation();
            setErrorMessage('Por favor, complete todos los campos obligatorios correctamente.'); // USER-FACING SPANISH TEXT
        } else {
            // Build FormData to send to the API
            const formData = new FormData();
            formData.append('expense_category_id', expenseCategoryId);
            // REMOVED: formData.append('name', name);
            formData.append('amount', amount);
            formData.append('expense_date', expenseDate);

            try {
                await axios.post(endpoint, formData, {
                    withCredentials: true,
                    headers: { Accept: 'application/json' },
                });

                // Success feedback and redirect
                setSuccessMessage('Gasto creado exitosamente.'); // USER-FACING SPANISH TEXT
                setErrorMessage('');
                navigate('/expenses');
            } catch (error) {
                // API error handling
                let errorMsg = 'Fallo al crear el gasto. Por favor, revise los datos.'; // USER-FACING SPANISH TEXT

                if (error.response?.data?.errors) {
                    errorMsg = 'Error de validación. Revise los campos.'; // USER-FACING SPANISH TEXT
                }
                setErrorMessage(errorMsg);
                console.error('Error creating expense:', error.response || error);
            }
        }
        setFormValidated(true);
    };

    return (
        <div className="container-fluid">
            <h2 className="mb-4">Crear Nuevo Gasto</h2>
            <form onSubmit={store} noValidate className={formValidated ? 'was-validated' : ''}>

                {/* Error Message Display */}
                <div className="col-md-12 mt-4">
                    {errorMessage && (
                        <div className="alert alert-danger text-center">
                            {errorMessage}
                        </div>
                    )}
                </div>

                {/* 1. Category Select (REPLACES NAME INPUT) */}
                <div className='mb-3'>
                    <label className='form-label'>Categoría del Gasto</label>
                    <select
                        value={expenseCategoryId}
                        onChange={(e) => setExpenseCategoryId(e.target.value)}
                        className='form-control'
                        required
                        disabled={loadingCategories}
                    >
                        <option value="">-- Seleccione una Categoría --</option>
                        {loadingCategories ? (
                            <option value="" disabled>Cargando categorías...</option>
                        ) : categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                    <div className="invalid-feedback">
                        Por favor, seleccione la categoría del gasto.
                    </div>
                </div>

                {/* REMOVED: 1.5. Optional Description/Name Field */}

                {/* 2. Amount Field */}
                <div className='mb-3'>
                    <label className='form-label'>Monto Total</label>
                    <input
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        type='number'
                        step='0.01' // Allows decimal values
                        className='form-control'
                        required
                    />
                    <div className="invalid-feedback">
                        Por favor, ingrese el monto total del gasto.
                    </div>
                </div>

                {/* 3. Expense Date Field */}
                <div className='mb-3'>
                    <label className='form-label'>Fecha del Gasto</label>
                    <input
                        value={expenseDate}
                        onChange={(e) => setExpenseDate(e.target.value)}
                        type='date'
                        className='form-control'
                        required
                    />
                    <div className="invalid-feedback">
                        Por favor, ingrese la fecha en que ocurrió el gasto.
                    </div>
                </div>

                {/* Submit Button */}
                <button type='submit' className='btn btn-success'>
                    Guardar Gasto
                </button>
            </form>
        </div>
    );
}