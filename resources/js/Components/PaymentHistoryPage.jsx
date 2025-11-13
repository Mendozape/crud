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
    const { setSuccessMessage, setErrorMessage } = useContext(MessageContext);
    
    const [payments, setPayments] = useState([]);
    const [residentName, setResidentName] = useState('...');
    const [loading, setLoading] = useState(true);

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
            setResidentName(residentResponse.data.name + ' ' + residentResponse.data.last_name);

            // 2. Fetch all payments for this resident
            const paymentsResponse = await axios.get(`http://localhost:8000/api/resident_payments/history/${residentId}`, axiosOptions);
            
            console.log("API Response Data:", paymentsResponse.data.data);
            setPayments(paymentsResponse.data.data);
            
        } catch (error) {
            console.error('Error fetching data:', error);
            setErrorMessage('Error al cargar el historial de pagos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPaymentHistory();
    }, [residentId]);

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
        { 
            name: 'Cuota', 
            selector: row => row.fee ? row.fee.name : 'N/A',
            sortable: true, 
            wrap: true 
        }, 
        { 
            name: 'Monto', 
            selector: row => `$${parseFloat(row.amount).toFixed(2)}`, 
            sortable: true, 
            right: true 
        },
        { name: 'Periodo', selector: row => `${getMonthName(row.month)} ${row.year}`, sortable: false, wrap: true },
        { name: 'Fecha Pago', selector: row => row.payment_date, sortable: true },
        { 
            name: 'Estado', 
            selector: row => row.status, 
            sortable: true,
            cell: row => (
                <span className={`badge ${row.status === 'Pagado' ? 'bg-success' : 'bg-danger'}`}>
                    {row.status}
                </span>
            ),
        },
        {
            name: 'Motivo Cancel.',
            selector: row => row.cancellation_reason || 'N/A',
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
        <div className="content-wrapper">
            <section className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1>Historial de Pagos de {residentName}</h1>
                        </div>
                    </div>
                </div>
            </section>

            <section className="content">
                <div className="container-fluid">
                    <div className="card">
                        <div className="card-body">
                            <DataTable
                                columns={columns}
                                data={payments}
                                progressPending={loading}
                                pagination
                                highlightOnHover
                                striped
                                noDataComponent="Este residente no tiene pagos registrados."
                            />
                        </div>
                    </div>
                </div>
            </section>
            
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
                                <p>¿Está seguro de que desea anular el pago por el monto de <strong>${parseFloat(paymentToCancel.amount).toFixed(2)}</strong>?</p>
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
