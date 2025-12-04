import React, { useState, useContext } from 'react';
import axios from 'axios';
import { MessageContext } from './MessageContext'; // Assuming MessageContext is available
import { useNavigate } from 'react-router-dom';

const endpoint = 'http://localhost:8000/api/streets';

export default function CreateStreet() {
    const [name, setName] = useState('');
    const [formValidated, setFormValidated] = useState(false);

    const { setSuccessMessage, setErrorMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    const store = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (form.checkValidity() === false) {
            e.stopPropagation();
            setErrorMessage('Por favor, complete todos los campos obligatorios.');
        } else {
            const formData = new FormData();
            formData.append('name', name);
            
            try {
                await axios.post(endpoint, formData, {
                    withCredentials: true,
                    headers: { Accept: 'application/json' },
                });
                setSuccessMessage('Calle creada exitosamente.');
                setErrorMessage('');
                navigate('/streets');
            } catch (error) {
                setErrorMessage('Fallo al crear la calle.');
                console.error('Error creating street:', error);
            }
        }
        setFormValidated(true);
    };

    return (
        <div>
            <h2>Crear Calle</h2>
            <form onSubmit={store} noValidate className={formValidated ? 'was-validated' : ''}>
                <div className="col-md-12 mt-4">
                    {errorMessage && (
                        <div className="alert alert-danger text-center">
                            {errorMessage}
                        </div>
                    )}
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Nombre</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        type='text'
                        className='form-control'
                        required
                    />
                    <div className="invalid-feedback">
                        Por favor, ingrese un nombre para la calle.
                    </div>
                </div>
                <button type='submit' className='btn btn-success'>Guardar</button>
            </form>
        </div>
    );
}