import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { MessageContext } from './MessageContext';
import { useNavigate, useParams } from 'react-router-dom';

const endpoint = 'http://localhost:8000/api/fees/';

const axiosOptions = {
    withCredentials: true,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
    }
};

export default function EditFees() {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
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
        formData.append('description', description);
        formData.append('_method', 'PUT');

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
        setShowModal(true);
    };

    useEffect(() => {
        const getFeeById = async () => {
            try {
                const response = await axios.get(`${endpoint}${id}`, axiosOptions);
                setName(response.data.name);
                setAmount(response.data.amount);
                setDescription(response.data.description);
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
                <div className='mb-3'>
                    <label className='form-label'>Monto</label>
                    <input 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)}
                        type='text'
                        className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                        required
                    />
                    {errors.amount && <div className="invalid-feedback">{errors.amount[0]}</div>}
                </div>
                <div className='mb-3'>
                    <label className='form-label'>Descripción</label>
                    <input
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        type='text'
                        className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    />
                    {errors.description && <div className="invalid-feedback">{errors.description[0]}</div>}
                </div>
                <button type='submit' className='btn btn-success'>Actualizar</button>
            </form>

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
                            ¿Está seguro de que desea actualizar la información de esta cuota?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button type="button" className="btn btn-danger" onClick={handleUpdate}>Actualizar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}