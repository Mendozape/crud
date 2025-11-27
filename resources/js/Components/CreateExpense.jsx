// src/components/CreateExpense.jsx

import React, { useState, useContext } from 'react';
import axios from 'axios';
import { MessageContext } from './MessageContext';
import { useNavigate } from 'react-router-dom';

const endpoint = '/api/expenses';

// Helper function to get today's date in YYYY-MM-DD format,
// which is required for HTML input type="date" to display correctly.
const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
};

export default function CreateExpense() {
    // State variables
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    
    // ⭐ FIX: Initialize expenseDate with today's date
    const [expenseDate, setExpenseDate] = useState(getTodayDate()); 
    const [formValidated, setFormValidated] = useState(false);

    // Context and navigation hooks
    const { setSuccessMessage, setErrorMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    const store = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        // Frontend validation check
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setErrorMessage('Por favor, complete todos los campos obligatorios correctamente.');
        } else {
            // Build FormData to send to the API
            const formData = new FormData();
            formData.append('name', name);
            formData.append('amount', amount);
            formData.append('expense_date', expenseDate);
            
            try {
                // Post the data to the API endpoint
                await axios.post(endpoint, formData, {
                    withCredentials: true,
                    headers: {
                        Accept: 'application/json',
                    },
                });
                
                // Success feedback and redirect
                setSuccessMessage('Gasto creado exitosamente.');
                setErrorMessage('');
                navigate('/expenses');
            } catch (error) {
                // API error handling
                let errorMsg = 'Fallo al crear el gasto. Por favor, revise los datos.';
                if (error.response && error.response.data.message) {
                    errorMsg = error.response.data.message; 
                }
                setErrorMessage(errorMsg);
                console.error('Error creating expense:', error);
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
                
                {/* 1. Name Field */}
                <div className='mb-3'>
                    <label className='form-label'>Nombre/Concepto</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        type='text'
                        className='form-control'
                        required
                    />
                    <div className="invalid-feedback">
                        Por favor, ingrese un nombre o concepto para el gasto.
                    </div>
                </div>
                
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
                
                {/* 3. Expense Date Field (Initialized with today's date) */}
                <div className='mb-3'>
                    <label className='form-label'>Fecha del Gasto</label>
                    <input
                        // The value is set to the current date from the state
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