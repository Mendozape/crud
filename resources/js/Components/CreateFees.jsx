import React, { useState, useContext } from 'react';
import axios from 'axios';
import { MessageContext } from './MessageContext';
import { useNavigate } from 'react-router-dom';

const endpoint = '/api/fees';

export default function CreateResidents() {
    const [name, setName] = useState('');
    // NEW: Separated states for house and land amounts
    const [amountHouse, setAmountHouse] = useState('');
    const [amountLand, setAmountLand] = useState('');
    const [description, setDescription] = useState('');
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
            // UPDATED: Sending the new field names to the API
            const formData = new FormData();
            formData.append('name', name);
            formData.append('amount_house', amountHouse);
            formData.append('amount_land', amountLand);
            formData.append('description', description);

            try {
                await axios.post(endpoint, formData, {
                    withCredentials: true,
                    headers: {
                        Accept: 'application/json',
                    },
                });
                setSuccessMessage('Tarifa creada exitosamente.');
                setErrorMessage('');
                navigate('/fees');
            } catch (error) {
                setErrorMessage('Fallo al crear la tarifa.');
                console.error('Error creating fee:', error);
            }
        }
        setFormValidated(true);
    };

    return (
        <div>
            <h2>Crear Tarifa</h2>
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
                    <label className='form-label'>Nombre</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        type='text'
                        className='form-control'
                        placeholder="Ej. Mantenimiento"
                        required
                    />
                    <div className="invalid-feedback">
                        Por favor, ingrese un nombre.
                    </div>
                </div>

                <div className="row">
                    {/* NEW: Amount House Field */}
                    <div className='col-md-6 mb-3'>
                        <label className='form-label'>Monto Casa</label>
                        <input
                            value={amountHouse}
                            onChange={(e) => setAmountHouse(e.target.value)}
                            type='number'
                            step="0.01"
                            className='form-control'
                            placeholder="0.00"
                            required
                        />
                        <div className="invalid-feedback">
                            Ingrese el monto para casas.
                        </div>
                    </div>

                    {/* NEW: Amount Land Field */}
                    <div className='col-md-6 mb-3'>
                        <label className='form-label'>Monto Terreno</label>
                        <input
                            value={amountLand}
                            onChange={(e) => setAmountLand(e.target.value)}
                            type='number'
                            step="0.01"
                            className='form-control'
                            placeholder="0.00"
                            required
                        />
                        <div className="invalid-feedback">
                            Ingrese el monto para terrenos.
                        </div>
                    </div>
                </div>

                {/* Description Field */}
                <div className='mb-3'>
                    <label className='form-label'>Descripción</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className='form-control'
                        rows="3"
                        required
                    />
                    <div className="invalid-feedback">
                        Por favor, ingrese una descripción.
                    </div>
                </div>

                <button type='submit' className='btn btn-success'>Guardar Tarifa</button>
            </form>
        </div>
    );
}