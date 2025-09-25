import React, { useState, useContext } from 'react';
import axios from 'axios';
import { MessageContext } from './MessageContext';
import { useNavigate } from 'react-router-dom';

const endpoint = 'http://localhost:8000/api/fees';

export default function CreateResidents() {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [formValidated, setFormValidated] = useState(false);

    const { setSuccessMessage, setErrorMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    const store = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (form.checkValidity() === false) {
            e.stopPropagation();
            setErrorMessage('Please fill out all required fields.');
        } else {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('amount', amount);
            formData.append('description', description);
            try {
                await axios.post(endpoint, formData, {
                    withCredentials: true,
                    headers: {
                        Accept: 'application/json',
                    },
                });
                setSuccessMessage('Fee created successfully.');
                setErrorMessage('');
                navigate('/fees');
            } catch (error) {
                setErrorMessage('Failed to create fee.');
                console.error('Error creating fee:', error);
            }
        }
        setFormValidated(true);
    };

    return (
        <div>
            <h2>Crear pago</h2>
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
                        Please provide a name.
                    </div>
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Monto</label>
                    <input
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        type='number'
                        className='form-control'
                        required
                    />
                    <div className="invalid-feedback">
                        Please provide the amount.
                    </div>
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Descripción</label>
                    <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        type='text'
                        className='form-control'
                        required
                    />
                    <div className="invalid-feedback">
                        Please provide a description.
                    </div>
                </div>
                <button type='submit' className='btn btn-success'>Guardar</button>
            </form>
        </div>
    );
}