// src/components/EditExpense.jsx

import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { MessageContext } from './MessageContext';
import { useNavigate, useParams } from 'react-router-dom';

const endpoint = 'http://localhost:8000/api/expenses/';
const categoriesEndpoint = 'http://localhost:8000/api/expense_categories'; // Endpoint for catalog data

// Configuration for Axios requests (omitted)
const axiosOptions = {
    withCredentials: true,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
    }
};

const formatDate = (dbDateString) => {
    if (!dbDateString) return '';
    return dbDateString.split(' ')[0];
};

export default function EditExpense() {
    // State variables
    // const [name, setName] = useState(''); // REMOVED
    const [amount, setAmount] = useState('');
    const [expenseDate, setExpenseDate] = useState('');
    const [expenseCategoryId, setExpenseCategoryId] = useState(''); 
    const [categories, setCategories] = useState([]); 
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [formValidated, setFormValidated] = useState(false);
    const [errors, setErrors] = useState({});
    const [showModal, setShowModal] = useState(false);

    const { id } = useParams();
    const { setSuccessMessage, setErrorMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    // Effect 1: Fetch Categories Catalog (omitted)
    useEffect(() => {
        const fetchCategories = async () => {
            // ... (Category fetching logic) ...
            try {
                const res = await axios.get(categoriesEndpoint, axiosOptions);
                const activeCategories = res.data.data.filter(cat => !cat.deleted_at);
                setCategories(activeCategories);
            } catch (error) {
                console.error("Error fetching categories:", error);
                setErrorMessage("Fallo al cargar el catálogo de categorías.");
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []); 

    // Effect 2: Fetch specific expense data (omitted)
    useEffect(() => {
        const getExpenseById = async () => {
            try {
                const response = await axios.get(`${endpoint}${id}`, axiosOptions);
                const data = response.data.data;
                
                // REMOVED: setName(data.name || data.category?.name || ''); 
                
                setAmount(data.amount);
                setExpenseDate(formatDate(data.expense_date)); 
                setExpenseCategoryId(data.expense_category_id?.toString() || ''); 
            } catch (error) {
                console.error('Error fetching expense:', error);
                setErrorMessage('Fallo al cargar el gasto.'); 
            }
        };
        getExpenseById();
    }, [id, setErrorMessage]);


    const handleUpdate = async (e) => {
        // NOTE: e.preventDefault() is called in 'update', not here.
        
        const formData = new FormData();
        
        // --- DATA SENT TO API ---
        formData.append('expense_category_id', expenseCategoryId); 
        // ❌ REMOVED: formData.append('name', name);
        formData.append('amount', amount);
        formData.append('expense_date', expenseDate);
        formData.append('_method', 'PUT'); 
        // --- END DATA SENT ---

        try {
            const response = await axios.post(`${endpoint}${id}`, formData, axiosOptions);
            if (response.status === 200) {
                setSuccessMessage('Gasto actualizado exitosamente.');
                navigate('/expenses');
            } else {
                setErrorMessage('Fallo al actualizar el gasto.');
            }
        } catch (error) {
            console.error('Error updating expense:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrorMessage('Fallo al actualizar el gasto.');
            }
        } finally {
            setShowModal(false);
        }
    };

    const update = (e) => {
        e.preventDefault(); // Prevents form submission
        
        // ⭐ FIX: Add client-side validation check before showing modal
        if (!amount || !expenseCategoryId || !expenseDate) {
            setErrorMessage('Por favor, complete todos los campos obligatorios antes de actualizar.');
            setFormValidated(true);
            return;
        }

        setShowModal(true);
    };

    return (
        <div className="container mt-4">
            <h2>Editar Gasto</h2>
            {/* The onSubmit handler calls 'update' to show the modal */}
            <form onSubmit={update} noValidate className={formValidated ? 'was-validated' : ''}>
                {/* ... (error message display) ... */}
                <div className="col-md-12 mt-4">
                    {errorMessage && (
                        <div className="alert alert-danger text-center">
                            {errorMessage}
                        </div>
                    )}
                </div>
                
                {/* 1. Category Select */}
                <div className='mb-3'>
                    <label className='form-label'>Categoría</label>
                    <select
                        value={expenseCategoryId}
                        onChange={(e) => setExpenseCategoryId(e.target.value)}
                        className='form-control'
                        required
                        disabled={loadingCategories}
                    >
                        <option value="">-- Seleccione una Categoría --</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 2. Amount Field */}
                <div className='mb-3'>
                    <label className='form-label'>Monto</label>
                    <input 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)}
                        type='number'
                        step='0.01'
                        min='0.01'
                        className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                        required
                    />
                    {errors.amount && <div className="invalid-feedback">{errors.amount[0]}</div>}
                </div>

                {/* 3. Expense Date Field */}
                <div className='mb-3'>
                    <label className='form-label'>Fecha del Gasto</label>
                    <input
                        value={expenseDate} 
                        onChange={(e) => setExpenseDate(e.target.value)}
                        type='date'
                        className={`form-control ${errors.expense_date ? 'is-invalid' : ''}`}
                        required
                    />
                    {errors.expense_date && <div className="invalid-feedback">{errors.expense_date[0]}</div>}
                </div>

                <button type='submit' className='btn btn-success'>Actualizar</button>
            </form>

            {/* Modal for Update Confirmation */}
            <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirmar Actualización</h5>
                            <button type="button" className="close" aria-label="Cerrar" onClick={() => setShowModal(false)}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            ¿Está seguro de que desea actualizar la información de este gasto?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                Cancelar
                            </button>
                            {/* This button calls the async handleUpdate function */}
                            <button type="button" className="btn btn-danger" onClick={handleUpdate}>
                                Actualizar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}