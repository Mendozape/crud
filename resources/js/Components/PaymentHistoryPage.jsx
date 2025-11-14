import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { MessageContext } from './MessageContext'; // Assuming MessageContext is available for notifications

// Global axios options (optional, but good practice)
const axiosOptions = {
    withCredentials: true,
    headers: {
        Accept: 'application/json',
    },
};

const PaymentHistoryPage = () => {
    // Get the resident ID from the URL parameter
    const { id: residentId } = useParams(); 
    const navigate = useNavigate();
    const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } = useContext(MessageContext);
    
    // State variables
    const [payments, setPayments] = useState([]);
    const [residentName, setResidentName] = useState('...');
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(''); // NEW: State for search input
    const [filteredPayments, setFilteredPayments] = useState([]); // NEW: State for filtered list

    // Modal state for cancellation confirmation
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [paymentToCancel, setPaymentToCancel] = useState(null);
    const [cancellationReason, setCancellationReason] = useState('');

    // Utility to convert month number (1-12) to Spanish name
    const getMonthName = (monthNum) => {
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        // Ensure monthNum is a valid index
        return monthNum >= 1 && monthNum <= 12 ? monthNames[monthNum - 1] : 'N/A';
    };

    // -----------------------------------------------------------
    // FETCH LOGIC
    // -----------------------------------------------------------
    const fetchPaymentHistory = async () => {
        setLoading(true);
        try {
            // 1. Fetch the resident details (for the name/title)
            const residentResponse = await axios.get(`http://localhost:8000/api/residents/${residentId}`, axiosOptions);
            const fullName = residentResponse.data.name + ' ' + residentResponse.data.last_name;
            setResidentName(fullName);

            // 2. Fetch all payments for this resident
            const paymentsResponse = await axios.get(`http://localhost:8000/api/resident_payments/history/${residentId}`, axiosOptions);
            
            console.log("API Response Data:", paymentsResponse.data.data);
            setPayments(paymentsResponse.data.data);
            setFilteredPayments(paymentsResponse.data.data); // Initialize filtered list
            
        } catch (error) {
            console.error('Error fetching data:', error);
            setErrorMessage('Error al cargar el historial de pagos.');
        } finally {
            setLoading(false);
        }
    };

    // Initial data load on component mount
    useEffect(() => {
        fetchPaymentHistory();
    }, [residentId]);
    
    // NEW: Filter payments based on search input (by Fee Name or Description)
    useEffect(() => {
        const result = payments.filter(payment =>
            // Search by Fee Name
            (payment.fee?.name || '').toLowerCase().includes(search.toLowerCase()) ||
            // Search by Description (from fee)
            (payment.fee?.description || '').toLowerCase().includes(search.toLowerCase()) ||
            // Search by Status
            (payment.status || '').toLowerCase().includes(search.toLowerCase())
        );
        setFilteredPayments(result);
    }, [search, payments]);


    // -----------------------------------------------------------
    // CANCELLATION LOGIC
    // -----------------------------------------------------------
    const confirmCancellation = (payment) => {
        setPaymentToCancel(payment);
        setShowCancelModal(true);
        setCancellationReason('');
    };

    const handleCancellation = async () => {
        if (!cancellationReason.trim()) {
            setErrorMessage('Debe especificar un motivo de cancelación.');
            return;
        }

        try {
            const cancelEndpoint = `http://localhost:8000/api/resident_payments/cancel/${paymentToCancel.id}`;
            const response = await axios.post(cancelEndpoint, 
                { reason: cancellationReason }, 
                axiosOptions
            );

            if (response.status === 200) {
                setSuccessMessage('Pago anulado exitosamente.');
                setShowCancelModal(false);
                setPaymentToCancel(null);
                fetchPaymentHistory(); 
            }
        } catch (error) {
            console.error('Error canceling payment:', error);
            const msg = error.response?.data?.message || 'Fallo al anular el pago.';
            setErrorMessage(msg);
        }
    };

    // -----------------------------------------------------------
    // DATATABLE COLUMNS
    // -----------------------------------------------------------
    const columns = [
        // Columna Cuota (Usa el nombre del Fee)
        { 
            name: 'Cuota', 
            selector: row => row.fee ? row.fee.name : 'N/A', 
            sortable: true, 
            wrap: true 
        }, 
        // Monto (Usa el valor del Accessor + Fallback robusto)
        { 
            name: 'Monto', 
            selector: row => {
                const amountValue = row.amount || (row.fee ? row.fee.amount : 0); 
                return `$${parseFloat(amountValue).toFixed(2)}`;
            }, 
            sortable: true, 
            right: true 
        },
        // Columna Descripción (Usa la descripción del Fee)
        { 
            name: 'Descripción', 
            selector: row => row.description || (row.fee ? row.fee.description : 'N/A'), 
            sortable: false, 
            wrap: true 
        },
        { name: 'Periodo', selector: row => `${getMonthName(row.month)} ${row.year}`, sortable: false, wrap: true },
        { name: 'Fecha Pago', selector: row => row.payment_date, sortable: true },
        { 
            name: 'Estado', 
            selector: row => row.status, 
            sortable: true,
            cell: row => (
                <span className={`badge ${row.status === 'Pagado' ? 'bg-info' : 'bg-danger'}`}>
                    {row.status}
                </span>
            ),
        },
        {
            name: 'Motivo Cancelación',
            selector: row => row.cancellation_reason || '',
            sortable: false,
            wrap: true,
        },
        {
            name: 'Acción',
            cell: row => (
                row.status === 'Pagado' ? (
                    <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => confirmCancellation(row)}
                    >
                        <i className="fas fa-times"></i> Anular
                    </button>
                ) : (
                    <span className="text-muted">Anulado</span>
                )
            ),
            minWidth: '100px',
        },
    ];

    // -----------------------------------------------------------
    // RENDER
    // -----------------------------------------------------------
    return (
        // Wrapper structure similar to ResidentsTable for centering and layout
        <div className="row mb-4 border border-primary rounded p-3 mx-auto mt-4" style={{ maxWidth: '95%' }}>
            <div className="col-md-12">
                
                {/* MESSAGE AREA */}
                <div className="row mb-2">
                    <div className="col-12"> 
                        <h1 className="text-center">Historial de Pagos de {residentName}</h1>
                        {successMessage && <div className="alert alert-success text-center">{successMessage}</div>}
                        {errorMessage && <div className="alert alert-danger text-center">{errorMessage}</div>}
                    </div>
                </div>

                {/* SEARCH INPUT */}
                <div className="row justify-content-end mb-3">
                    <div className="col-md-4 col-sm-12">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar por Cuota o Estado..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* DATA TABLE */}
                <div className="card shadow mb-4">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">Transacciones</h5>
                    </div>
                    <div className="card-body p-0">
                        <DataTable
                            title={`Historial de Transacciones de ${residentName}`}
                            columns={columns}
                            data={filteredPayments} // Use the filtered list
                            progressPending={loading}
                            pagination
                            highlightOnHover
                            striped
                            noDataComponent="Este residente no tiene pagos registrados."
                        />
                    </div>
                </div>
            </div>
            
            {/* Cancellation Confirmation Modal */}
            <div className={`modal fade ${showCancelModal ? 'show d-block' : ''}`} tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header bg-danger">
                            <h5 className="modal-title text-white">Confirmar Anulación de Pago</h5>
                            <button type="button" className="close" onClick={() => setShowCancelModal(false)}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            {paymentToCancel && (
                                <p>¿Está seguro de que desea anular el pago por el monto de <strong>${parseFloat(paymentToCancel.amount || 0).toFixed(2)}</strong>?</p>
                            )}
                            <div className="form-group">
                                <label htmlFor="cancelReason">Motivo de la Anulación <span className="text-danger">*</span></label>
                                <textarea
                                    id="cancelReason"
                                    className="form-control"
                                    rows="3"
                                    value={cancellationReason}
                                    onChange={(e) => setCancellationReason(e.target.value)}
                                    required
                                    placeholder="Detalle la razón de la anulación del pago."
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>Cerrar</button>
                            <button 
                                type="button" 
                                className="btn btn-danger" 
                                onClick={handleCancellation}
                                disabled={!cancellationReason.trim()}
                            >
                                Anular Pago
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {showCancelModal && <div className="modal-backdrop fade show"></div>}
            {/* End Modal */}

        </div>
    );
};

export default PaymentHistoryPage;