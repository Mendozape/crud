import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { MessageContext } from './MessageContext';
import { useNavigate, useParams } from 'react-router-dom';

const endpoint = '/api/expense_categories/';

const axiosOptions = {
    withCredentials: true,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
    }
};

export default function EditExpenseCategory() {
    // State for the category name
    const [name, setName] = useState('');
    const [formValidated, setFormValidated] = useState(false);
    const [errors, setErrors] = useState({});
    const [showModal, setShowModal] = useState(false);

    const { id } = useParams();
    const { setSuccessMessage, setErrorMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    // Handler for final update confirmation
    const handleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('_method', 'PUT'); // Method spoofing for Laravel PUT

        try {
            const response = await axios.post(`${endpoint}${id}`, formData, axiosOptions);
            
            if (response.status === 200) {
                // USER-FACING SPANISH TEXT
                setSuccessMessage('Categoría de gasto actualizada exitosamente.');
                setErrorMessage('');
                navigate('/expense_categories');
            } else {
                // USER-FACING SPANISH TEXT
                setErrorMessage('Fallo al actualizar la categoría.');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                // USER-FACING SPANISH TEXT
                setErrorMessage('Error de validación. Revise los campos.');
            } else {
                setErrorMessage('Fallo al actualizar la categoría.');
            }
        } finally {
            setShowModal(false);
        }
    };

    // Handler to show the confirmation modal
    const update = (e) => {
        e.preventDefault();
        setErrors({}); 
        setShowModal(true);
    };

    // Effect to fetch the current category data on component load
    useEffect(() => {
        const getCategoryById = async () => {
            try {
                const response = await axios.get(`${endpoint}${id}`, axiosOptions);
                // Populate state with fetched name
                setName(response.data.data.name);
            } catch (error) {
                console.error('Error fetching category:', error);
                // USER-FACING SPANISH TEXT
                setErrorMessage('Fallo al cargar la categoría.');
            }
        };
        getCategoryById();
    }, [id, setErrorMessage]);

    return (
        <div className="container mt-4">
            <h2>Editar Categoría de Gasto</h2>
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
                    <label className='form-label'>Nombre de la Categoría</label>
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
                            ¿Está seguro de que desea actualizar el nombre de esta categoría?
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