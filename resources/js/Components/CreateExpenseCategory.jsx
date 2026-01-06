import React, { useState, useContext } from 'react';
import axios from 'axios';
import { MessageContext } from './MessageContext';
import { useNavigate } from 'react-router-dom';

const endpoint = '/api/expense_categories';

export default function CreateExpenseCategory() {
    // State for the category name
    const [name, setName] = useState('');
    const [formValidated, setFormValidated] = useState(false);
    const [errors, setErrors] = useState({});

    // Context and navigation hooks
    const { setSuccessMessage, setErrorMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    const store = async (e) => {
        e.preventDefault();
        setErrors({}); // Clear previous errors
        
        const form = e.currentTarget;

        if (form.checkValidity() === false) {
            e.stopPropagation();
            // USER-FACING SPANISH TEXT
            setErrorMessage('Por favor, complete todos los campos obligatorios.');
        } else {
            const formData = new FormData();
            formData.append('name', name);
            
            try {
                await axios.post(endpoint, formData, {
                    withCredentials: true,
                    headers: { Accept: 'application/json' },
                });
                
                // Success feedback and redirect
                // USER-FACING SPANISH TEXT
                setSuccessMessage('Categoría de gasto creada exitosamente.');
                setErrorMessage('');
                navigate('/expense_categories');
            } catch (error) {
                console.error('Error creating category:', error.response || error);
                
                if (error.response?.data?.errors) {
                    setErrors(error.response.data.errors);
                    // USER-FACING SPANISH TEXT
                    setErrorMessage('Error de validación. Revise los campos.');
                } else {
                    // USER-FACING SPANISH TEXT
                    setErrorMessage('Fallo al crear la categoría.');
                }
            }
        }
        setFormValidated(true);
    };

    return (
        <div className="container mt-4">
            <h2>Crear Categoría de Gasto</h2>
            <form onSubmit={store} noValidate className={formValidated ? 'was-validated' : ''}>
                
                <div className="col-md-12 mt-4">
                    {errorMessage && (
                        <div className="alert alert-danger text-center">
                            {errorMessage}
                        </div>
                    )}
                </div>
                
                {/* Name Field */}
                <div className='mb-3'>
                    <label className='form-label'>Nombre de la Categoría</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        type='text'
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        placeholder="Ej. Internet"
                        required
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name[0]}</div>}
                </div>
                
                <button type='submit' className='btn btn-success'>Guardar</button>
            </form>
        </div>
    );
}