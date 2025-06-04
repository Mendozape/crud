import React, { useEffect, useState, useContext } from 'react';
import DataTable from 'react-data-table-component';
import { MessageContext } from './MessageContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const endpoint = 'http://localhost:8000/api/residents';
// Function to get auth headers dynamically from localStorage
const authHeaders = () => {
    // Retrieve the token from localStorage (saved after login)
    const token = localStorage.getItem('api_token');
    // Return the headers object needed for authenticated API requests
    return {
        headers: {
            // Set the Authorization header using the token, if it exists
            Authorization: token ? `Bearer ${token}` : '',
            // Specify that we expect JSON responses from the server
            Accept: 'application/json',
        }
    };
};

const ResidentsTable = () => {
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filteredResidents, setFilteredResidents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [residentToDelete, setResidentToDelete] = useState(null);
    const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    const fetchResidents = async () => {
        try {
            const response = await axios.get(endpoint, authHeaders());
            setResidents(response.data);
            setFilteredResidents(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching residents:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResidents();
    }, []);

    useEffect(() => {
        const result = residents.filter(resident => {
            return resident.name.toLowerCase().includes(search.toLowerCase());
        });
        setFilteredResidents(result);
    }, [search, residents]);

    const deleteResident = async (id) => {
        try {
            const response = await axios.delete(`${endpoint}/${id}`, authHeaders());
            if (response.status === 200) {
                setSuccessMessage('Resident deleted successfully.');
                fetchResidents();
            } else {
                setErrorMessage('Failed to delete resident.');
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error deleting resident:', error);
            setErrorMessage('Failed to delete resident.');
            setShowModal(false);
        }
    };

    const editResident = (id) => {
        navigate(`/edit/${id}`);
    };

    const createResident = () => {
        navigate('/create');
    };
    const createPayment = (id) => {
        navigate(`/payment/${id}`);
    };


    const toggleModal = () => {
        setShowModal(!showModal);
    };

    const confirmDelete = (id) => {
        setResidentToDelete(id);
        toggleModal();
    };

    const handleDelete = () => {
        deleteResident(residentToDelete);
    };

    const columns = [
        {
            name: 'Photo',
            selector: row => {
                const photoUrl = (row.photo && row.photo !== 'undefined' && row.photo !== 'null' && row.photo !== '') ? `http://127.0.0.1:8000/storage/${row.photo}` : `http://127.0.0.1:8000/storage/no_image.jpg`;
                return <img src={photoUrl} style={{ width: '50px', borderRadius: '50%' }} />;
            },
            sortable: false,
        },
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Last Name',
            selector: row => row.last_name,
            sortable: true,
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true,
        },
        {
            name: 'Street',
            selector: row => row.street,
            sortable: true,
        },
        {
            name: 'Street Number',
            selector: row => row.street_number,
            sortable: true,
        },
        {
            name: 'Community',
            selector: row => row.community,
            sortable: true,
        },
        {
            name: 'Comments',
            selector: row => row.comments,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: row => (
                <div>
                    <button
                        className="btn btn-info btn-sm"
                        onClick={() => createPayment(row.id)}
                    >
                        Pays
                    </button>
                    <button
                        className="btn btn-info btn-sm"
                        onClick={() => editResident(row.id)}
                    >
                        Edit
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => confirmDelete(row.id)}
                        style={{ marginLeft: '10px' }}
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    // UseEffect to clear success message after 10 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
            return () => clearTimeout(timer); // Cleanup the timer on unmount
        }
    }, [successMessage]);

    // UseEffect to clear error message after 10 seconds
    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(null);
            }, 5000);
            return () => clearTimeout(timer); // Cleanup the timer on unmount
        }
    }, [errorMessage]);

    return (
        <div className="row mb-4 border border-primary rounded p-3">
            <div className="col-md-6">
                <button
                    className='btn btn-success btn-sm mt-2 mb-2 text-white'
                    onClick={createResident}
                >
                    Create
                </button>
            </div>
            <div className="col-md-6 d-flex justify-content-end align-items-center">
                <input
                    type="text"
                    className="col-md-3 form-control form-control-sm mt-2 mb-2"
                    placeholder="Search by name"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="col-md-12 mt-4">
                {successMessage && (
                    <div className="alert alert-success text-center">
                        {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <div className="alert alert-danger text-center">
                        {errorMessage}
                    </div>
                )}
            </div>

            <div className="col-md-12 mt-4">
                <DataTable
                    title="Residents List"
                    columns={columns}
                    data={filteredResidents}
                    progressPending={loading}
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[5, 10, 15, 20]}
                    selectableRows
                    selectableRowsHighlight
                    highlightOnHover
                    striped
                />
            </div>

            <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirm Delete</h5>
                            <button type="button" className="close" aria-label="Close" onClick={toggleModal}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to delete this resident?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={toggleModal}>Cancel</button>
                            <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResidentsTable;