import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { MessageContext } from './MessageContext'; // Assuming MessageContext is available
import { useNavigate, useParams } from 'react-router-dom';

const endpoint = '/api/streets/';

const axiosOptions = {
    withCredentials: true,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
    }
};

export default function EditStreet() {
    const [name, setName] = useState('');
    const [formValidated, setFormValidated] = useState(false);
    const [errors, setErrors] = useState({});
    const [showModal, setShowModal] = useState(false);

    const { id } = useParams();
    const { setSuccessMessage, setErrorMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    // Fetch street data by ID
    useEffect(() => {
        const getStreetById = async () => {
            try {
                // The GET request should use application/json content type to prevent issues
                const response = await axios.get(`${endpoint}${id}`, {
                    withCredentials: true,
                    headers: { Accept: 'application/json' },
                });
                setName(response.data.name);
            } catch (error) {
                console.error('Error fetching street:', error);
                setErrorMessage('Fallo al cargar la calle.');
            }
        };
        getStreetById();
    }, [id, setErrorMessage]);


    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('_method', 'PUT'); // Necessary for Laravel PUT requests via FormData

        try {
            const response = await axios.post(`${endpoint}${id}`, formData, axiosOptions);
            if (response.status === 200) {
                setSuccessMessage('Calle actualizada exitosamente.');
                setErrorMessage('');
                navigate('/streets');
            } else {
                setErrorMessage('Fallo al actualizar la calle.');
            }
        } catch (error) {
            console.error('Error updating street:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                setErrorMessage('Error de validación al actualizar la calle.');
            } else {
                setErrorMessage('Fallo al actualizar la calle.');
            }
        } finally {
            setShowModal(false);
        }
    };

    const update = (e) => {
        e.preventDefault();
        setShowModal(true);
    };

    return (
        <div>
            <h2>Editar Calle</h2>
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
                            ¿Está seguro de que desea actualizar la información de esta calle?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button type="button" className="btn btn-danger" onClick={handleUpdate}>Actualizar</button>
                        </div>
                    </div>
                </div>
            </div>
            {showModal && <div className="modal-backdrop fade show"></div>}
        </div>
    );
}