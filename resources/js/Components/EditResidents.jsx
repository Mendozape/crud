import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { MessageContext } from './MessageContext';
import { useNavigate, useParams } from 'react-router-dom';

const endpoint = 'http://localhost:8000/api/residents/';

const axiosOptions = {
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'multipart/form-data',
  },
};

export default function EditEmployee() {
  // Form fields state
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [name, setName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [street_number, setStreetNumber] = useState('');
  const [community, setCommunity] = useState('');
  const [comments, setComments] = useState('');

  // Validation & UI
  const [formValidated, setFormValidated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [validationWarning, setValidationWarning] = useState(false);

  const { id } = useParams();
  const { setSuccessMessage, setErrorMessage, errorMessage } = useContext(MessageContext);
  const navigate = useNavigate();

  useEffect(() => {
    const getEmployeeById = async () => {
      try {
        const response = await axios.get(`${endpoint}${id}`, axiosOptions);
        setPhoto(response.data.photo);
        setName(response.data.name);
        setLastName(response.data.last_name);
        setEmail(response.data.email);
        setStreet(response.data.street);
        setStreetNumber(response.data.street_number);
        setCommunity(response.data.community);
        setComments(response.data.comments);
      } catch (error) {
        setErrorMessage('Failed to fetch resident.');
      }
    };
    getEmployeeById();
  }, [id, setErrorMessage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    const formData = new FormData();
    if (photo instanceof File) formData.append('photo', photo);
    formData.append('name', name);
    formData.append('last_name', last_name);
    formData.append('email', email);
    formData.append('street', street);
    formData.append('street_number', street_number);
    formData.append('community', community);
    formData.append('comments', comments || '');
    formData.append('_method', 'PUT');

    try {
      const response = await axios.post(`${endpoint}${id}`, formData, axiosOptions);
      if (response.status === 200) {
        setSuccessMessage('Resident updated successfully.');
        setErrorMessage('');
        navigate('/residents');
      }
    } catch (error) {
      setErrorMessage('Failed to update resident.');
    } finally {
      setShowModal(false);
    }
  };

  const update = (e) => {
    e.preventDefault();

    setFormValidated(true);
    setErrorMessage('');
    setValidationWarning(false);

    if (!e.target.checkValidity()) {
      setValidationWarning(true);
      return;
    }

    setShowModal(true);
  };

  return (
    <div className="container mt-4">
      <h2>Editar Residente</h2>

      {errorMessage && <div className="alert alert-danger text-center">{errorMessage}</div>}

      <form onSubmit={update} noValidate className={formValidated ? 'was-validated' : ''}>
        {/* Photo */}
        <div className="form-group">
          <label>Foto</label><br />
          {(photoPreview || (photo && typeof photo === 'string')) && (
            <img
              src={photoPreview || `http://127.0.0.1:8000/storage/${photo}`}
              alt="Resident"
              style={{ width: '100px', borderRadius: '50%', marginBottom: '10px' }}
            />
          )}
          <input
            type="file"
            className="form-control"
            onChange={handleFileChange}
            accept="image/*"
          />
          {/* no validation for photo */}
        </div>

        {/* Name */}
        <div className="form-group">
          <label>Nombre</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="invalid-feedback">Please enter the name.</div>
        </div>

        {/* Last Name */}
        <div className="form-group">
          <label>Apellidos</label>
          <input
            type="text"
            className="form-control"
            value={last_name}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <div className="invalid-feedback">Please enter the last name.</div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="invalid-feedback">Please enter a valid email.</div>
        </div>

        {/* Street */}
        <div className="form-group">
          <label>Calle</label>
          <input
            type="text"
            className="form-control"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
        </div>

        {/* Street Number */}
        <div className="form-group">
          <label># calle</label>
          <input
            type="text"
            className="form-control"
            value={street_number}
            onChange={(e) => setStreetNumber(e.target.value)}
          />
        </div>

        {/* Community */}
        <div className="form-group">
          <label>Comunidad</label>
          <input
            type="text"
            className="form-control"
            value={community}
            onChange={(e) => setCommunity(e.target.value)}
          />
        </div>

        {/* Comments */}
        <div className="form-group">
          <label>Comentarios</label>
          <textarea
            className="form-control"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary mt-3">Enviar</button>
      </form>

      {/* Confirmation Modal */}
      <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Update</h5>
              <button type="button" className="close" aria-label="Close" onClick={() => setShowModal(false)}>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              Are you sure you want to update this resident's information?
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={handleUpdate}>Update</button>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Warning Modal */}
      <div className={`modal ${validationWarning ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content border-warning">
            <div className="modal-header bg-warning">
              <h5 className="modal-title text-dark">Validation Required</h5>
              <button type="button" className="close" aria-label="Close" onClick={() => setValidationWarning(false)}>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body text-dark">
              Please check the form. Some required fields are missing or contain invalid data.
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setValidationWarning(false)}>OK</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}