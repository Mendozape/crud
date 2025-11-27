// src/components/EditExpense.jsx

import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { MessageContext } from './MessageContext';
import { useNavigate, useParams } from 'react-router-dom';

const endpoint = 'http://localhost:8000/api/expenses/';

// Configuration for Axios requests
const axiosOptions = {
    withCredentials: true,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
    }
};

// NOTE: Since the Laravel Model now returns the date in 'Y-m-d' format, 
// this helper is only needed as a fallback/safety check, but the Model fix 
// is the primary solution.
const formatDate = (dbDateString) => {
    if (!dbDateString) return '';
    // If the API failed to format the date correctly (e.g., includes time or T/Z), 
    // this splits by space or 'T' to get only the date portion (YYYY-MM-DD).
    return dbDateString.includes(' ') ? dbDateString.split(' ')[0] : dbDateString.split('T')[0];
};

export default function EditExpense() {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    // Quantity state removed
    const [expenseDate, setExpenseDate] = useState('');
    const [formValidated, setFormValidated] = useState(false);
    const [errors, setErrors] = useState({});
    const [showModal, setShowModal] = useState(false);

    const { id } = useParams();
    const { setSuccessMessage, setErrorMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('amount', amount);
        // Quantity removed
        formData.append('expense_date', expenseDate);
        formData.append('_method', 'PUT'); // Necessary for Laravel PUT/PATCH requests via FormData

        try {
            const response = await axios.post(`${endpoint}${id}`, formData, axiosOptions);
            if (response.status === 200) {
                // USER-FACING SPANISH TEXT: 'Gasto actualizado exitosamente.'
                setSuccessMessage('Gasto actualizado exitosamente.');
                setErrorMessage('');
                navigate('/expenses');
            } else {
                // USER-FACING SPANISH TEXT: 'Fallo al actualizar el gasto.'
                setErrorMessage('Fallo al actualizar el gasto.');
            }
        } catch (error) {
            console.error('Error updating expense:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                // USER-FACING SPANISH TEXT: 'Fallo al actualizar el gasto.'
                setErrorMessage('Fallo al actualizar el gasto.');
            }
        } finally {
            setShowModal(false);
        }
    };

    const update = (e) => {
        e.preventDefault();
        setShowModal(true);
    };

    // Effect to fetch the expense data when the component loads
    useEffect(() => {
        const getExpenseById = async () => {
            try {
                const response = await axios.get(`${endpoint}${id}`, axiosOptions);
                
                setName(response.data.data.name);
                setAmount(response.data.data.amount);
                
                // Applying the date formatting helper (required if Laravel doesn't use the explicit cast)
                setExpenseDate(formatDate(response.data.data.expense_date)); 
            } catch (error) {
                console.error('Error fetching expense:', error);
                // USER-FACING SPANISH TEXT: 'Fallo al cargar el gasto.'
                setErrorMessage('Fallo al cargar el gasto.');
            }
        };
        getExpenseById();
    }, [id, setErrorMessage]);

    return (
        <div>
            <h2>Editar Gasto</h2>
            <form onSubmit={update} noValidate className={formValidated ? 'was-validated' : ''}>
                <div className="col-md-12 mt-4">
                    {errorMessage && (
                        <div className="alert alert-danger text-center">
                            {errorMessage}
                        </div>
                    )}
                </div>

                {/* Name Field */}
                <div className='mb-3'>
                    <label className='form-label'>Nombre</label>
                    <input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        type='text'
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        required
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name[0]}</div>}
                </div>

                {/* Amount Field */}
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


                {/* Expense Date Field */}
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