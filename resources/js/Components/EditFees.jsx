import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { MessageContext } from './MessageContext';
import { useNavigate, useParams } from 'react-router-dom';

const endpoint = '/api/fees/';

const axiosOptions = {
    withCredentials: true,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
    }
};

export default function EditFees() {
    const [name, setName] = useState('');
    // NEW: Separated states for house and land amounts
    const [amountHouse, setAmountHouse] = useState('');
    const [amountLand, setAmountLand] = useState('');
    const [description, setDescription] = useState('');
    const [formValidated, setFormValidated] = useState(false);
    const [errors, setErrors] = useState({});
    const [showModal, setShowModal] = useState(false);

    const { id } = useParams();
    const { setSuccessMessage, setErrorMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    const handleUpdate = async (e) => {
        if (e) e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', name);
        // UPDATED: Sending the new specific fields
        formData.append('amount_house', amountHouse);
        formData.append('amount_land', amountLand);
        formData.append('description', description);
        formData.append('_method', 'PUT'); // Spoofing PUT for multipart/form-data compatibility

        try {
            const response = await axios.post(`${endpoint}${id}`, formData, axiosOptions);
            if (response.status === 200) {
                setSuccessMessage('Cuota actualizada exitosamente.');
                setErrorMessage('');
                navigate('/fees');
            } else {
                setErrorMessage('Fallo al actualizar la cuota.');
            }
        } catch (error) {
            console.error('Error updating fee:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrorMessage('Fallo al actualizar la cuota.');
            }
        } finally {
            setShowModal(false);
        }
    };

    const update = (e) => {
        e.preventDefault();
        setFormValidated(true);
        setShowModal(true);
    };

    useEffect(() => {
        const getFeeById = async () => {
            try {
                const response = await axios.get(`${endpoint}${id}`, axiosOptions);
                const data = response.data;
                // UPDATED: Mapping the specific fields from the database to state
                setName(data.name);
                setAmountHouse(data.amount_house);
                setAmountLand(data.amount_land);
                setDescription(data.description || '');
            } catch (error) {
                console.error('Error fetching fee:', error);
                setErrorMessage('Fallo al cargar la cuota.');
            }
        };
        getFeeById();
    }, [id, setErrorMessage]);

    return (
        <div>
            <h2>Editar Cuota</h2>
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

                <div className="row">
                    {/* NEW: Amount House Field */}
                    <div className='col-md-6 mb-3'>
                        <label className='form-label'>Monto Casa</label>
                        <input 
                            value={amountHouse} 
                            onChange={(e) => setAmountHouse(e.target.value)}
                            type='number'
                            step="0.01"
                            className={`form-control ${errors.amount_house ? 'is-invalid' : ''}`}
                            required
                        />
                        {errors.amount_house && <div className="invalid-feedback">{errors.amount_house[0]}</div>}
                    </div>

                    {/* NEW: Amount Land Field */}
                    <div className='col-md-6 mb-3'>
                        <label className='form-label'>Monto Terreno</label>
                        <input 
                            value={amountLand} 
                            onChange={(e) => setAmountLand(e.target.value)}
                            type='number'
                            step="0.01"
                            className={`form-control ${errors.amount_land ? 'is-invalid' : ''}`}
                            required
                        />
                        {errors.amount_land && <div className="invalid-feedback">{errors.amount_land[0]}</div>}
                    </div>
                </div>

                {/* Description Field */}
                <div className='mb-3'>
                    <label className='form-label'>Descripción</label>
                    <textarea
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                        rows="3"
                        required
                    />
                    {errors.description && <div className="invalid-feedback">{errors.description[0]}</div>}
                </div>

                <button type='submit' className='btn btn-success'>Actualizar</button>
            </form>

            {/* Confirmation Modal */}
            <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirmar Actualización</h5>
                            <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setShowModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            ¿Está seguro de que desea actualizar la información de esta cuota?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button type="button" className="btn btn-primary" onClick={handleUpdate}>Actualizar</button>
                        </div>
                    </div>
                </div>
            </div>
            {showModal && <div className="modal-backdrop fade show"></div>}
        </div>
    );
}