import React, { useEffect, useState, useContext } from 'react';
import DataTable from 'react-data-table-component';
import { MessageContext } from './MessageContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const endpoint = 'http://localhost:8000/api/fees';
const authHeaders = {
    headers: {
        'Authorization': 'Bearer 19|QrjZXV4Drh50B7Ql0WRhv27IIHy4l6vZHn2Oo71Zdf859653',
        'Accept': 'application/json',
    },
};

const FeesTable = () => {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filteredFees, setFilteredFees] = useState([]);
    const [showModal, setShowModal] = useState(false); 
    const [feeToDelete, setFeeToDelete] = useState(null); 
    const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } = useContext(MessageContext);
    const navigate = useNavigate();
    const fetchFees = async () => {
        try {
            const response = await axios.get(endpoint, authHeaders);
            setFees(response.data);
            setFilteredFees(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching fees:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFees();
    }, []);

    useEffect(() => {
        const result = fees.filter(fee => {
            return fee.name.toLowerCase().includes(search.toLowerCase());
        });
        setFilteredFees(result);
    }, [search, fees]);

    const deleteFee = async (id) => {
        try {
            const response = await axios.delete(`${endpoint}/${id}`, authHeaders);
            if (response.status === 200) {
                setSuccessMessage('Fee deleted successfully.');
                fetchFees();
            } else {
                setErrorMessage('Failed to delete fee.');
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error deleting fee:', error);
            setErrorMessage('Failed to delete fee.');
            setShowModal(false);
        }
    };

    const editFee = (id) => {
        navigate(`/edit/${id}`);
    };

    const createFee = () => {
        navigate('/create');
    };
    const toggleModal = () => {
        setShowModal(!showModal);
    };

    const confirmDelete = (id) => {
        setFeeToDelete(id);
        toggleModal();
    };

    const handleDelete = () => {
        deleteFee(feeToDelete);
    };

    const columns = [
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Amount',
            selector: row => row.amount,
            sortable: true,
        },
        {
            name: 'Description',
            selector: row => row.description,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: row => (
                <div>
                    <button
                        className="btn btn-info btn-sm"
                        onClick={() => editFee(row.id)}
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
                    onClick={createFee}
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
                    title="Fees List"
                    columns={columns}
                    data={filteredFees}
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
                            Are you sure you want to delete this fee?
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

export default FeesTable;