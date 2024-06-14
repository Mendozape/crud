// src/components/ResidentsTable.jsx

import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const endpoint = 'http://localhost:8000/api/residents';
const authHeaders = {
    headers: {
        'Authorization': 'Bearer 16|6Ll4eMbEkYq321VPmLqHOxHjEY2Jls3U9wreBqiE747f93f6',
        'Accept': 'application/json',
    },
};

const ResidentsTable = () => {
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filteredResidents, setFilteredResidents] = useState([]);
    const [showModal, setShowModal] = useState(false); // State for modal visibility
    const [residentToDelete, setResidentToDelete] = useState(null); // State to store resident to delete

    const navigate = useNavigate();

    const fetchResidents = async () => {
        try {
            const response = await axios.get(endpoint, authHeaders);
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
            await axios.delete(`${endpoint}/${id}`, authHeaders);
            fetchResidents();
            setShowModal(false); // Close the modal after deletion
        } catch (error) {
            console.error('Error deleting resident:', error);
        }
    };

    const editResident = (id) => {
        navigate(`/edit/${id}`);
    };

    const createResident = () => {
        navigate('/create');
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
            selector: row => row.photo,
            sortable: true,
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
                        onClick={() => editResident(row.id)}
                    >
                        Edit
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => confirmDelete(row.id)} // Call confirmDelete instead of deleteResident directly
                        style={{ marginLeft: '10px' }}
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ];

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
                <DataTable
                    title="Residents List"
                    columns={columns}
                    data={filteredResidents}
                    progressPending={loading}
                    pagination
                    paginationPerPage={10}  // Number of rows per page
                    paginationRowsPerPageOptions={[5, 10, 15, 20]} // Rows per page options
                    selectableRows
                    selectableRowsHighlight
                    highlightOnHover
                    striped
                />
            </div>

            {/* Modal for Delete Confirmation */}
            <div className="modal" tabIndex="-1" role="dialog" style={{ display: showModal ? 'block' : 'none' }}>
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
