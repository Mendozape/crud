import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { MessageContext } from './MessageContext';

const axiosOptions = {
    withCredentials: true,
    headers: {
        Accept: 'application/json',
    },
};

const PaymentHistoryPage = () => {
    const { id: addressId } = useParams(); 
    const navigate = useNavigate();
    const { setSuccessMessage, setErrorMessage, successMessage, errorMessage } = useContext(MessageContext);
    
    const [payments, setPayments] = useState([]);
    const [addressDetails, setAddressDetails] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filteredPayments, setFilteredPayments] = useState([]);

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [paymentToCancel, setPaymentToCancel] = useState(null);
    const [cancellationReason, setCancellationReason] = useState('');

    const getMonthName = (monthNum) => {
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return monthNum >= 1 && monthNum <= 12 ? monthNames[monthNum - 1] : 'N/A';
    };
    
    const getFormattedAddress = () => {
        if (!addressDetails) return 'Cargando Dirección...';
        const { street, street_number, community, type } = addressDetails;
        return `${street} #${street_number}, ${community} (${type})`;
    };

    const fetchPaymentHistory = async () => {
        setLoading(true);
        try {
            // Fetch Address details
            const addressResponse = await axios.get(
                `http://localhost:8000/api/addresses/${addressId}`, 
                axiosOptions
            );
            
            console.log("Address Response:", addressResponse.data);
            
            // CRITICAL FIX: Handle both response formats (with or without 'data' wrapper)
            const addressData = addressResponse.data.data || addressResponse.data;
            setAddressDetails(addressData);

            // Fetch payment history
            const paymentsResponse = await axios.get(
                `http://localhost:8000/api/address_payments/history/${addressId}`, 
                axiosOptions
            );
            
            console.log("Payments Response Status:", paymentsResponse.status);
            console.log("Payments Response Full:", paymentsResponse.data);
            
            // CRITICAL FIX: Handle the response structure correctly
            const fetchedPayments = paymentsResponse.data?.data || paymentsResponse.data || [];
            
            console.log("Fetched Payments Array:", fetchedPayments);
            console.log("Is Array?", Array.isArray(fetchedPayments));
            console.log("Length:", fetchedPayments.length);
            
            setPayments(fetchedPayments);
            setFilteredPayments(fetchedPayments);
            
        } catch (error) {
            console.error('Error fetching data:', error);
            console.error('Error response:', error.response?.data);
            setErrorMessage('Error al cargar el historial de pagos de la dirección.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (addressId) {
            fetchPaymentHistory();
        }
    }, [addressId]); 
    
    useEffect(() => {
        const paymentsArray = Array.isArray(payments) ? payments : []; 
        
        const result = paymentsArray.filter(payment => 
            (payment.fee?.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (payment.fee?.description || '').toLowerCase().includes(search.toLowerCase()) ||
            (payment.status || '').toLowerCase().includes(search.toLowerCase())
        );
        setFilteredPayments(result);
    }, [search, payments]);

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
            const cancelEndpoint = `http://localhost:8000/api/address_payments/cancel/${paymentToCancel.id}`;
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

    const columns = [
        { 
            name: 'Cuota', 
            selector: row => row.fee ? row.fee.name : 'N/A', 
            sortable: true, 
            wrap: true 
        }, 
        { 
            name: 'Monto', 
            selector: row => {
                const amountValue = row.amount || (row.fee ? row.fee.amount : 0); 
                return `$${parseFloat(amountValue).toFixed(2)}`;
            }, 
            sortable: true, 
            right: true 
        },
        { 
            name: 'Descripción', 
            selector: row => row.description || (row.fee ? row.fee.description : 'N/A'), 
            sortable: false, 
            wrap: true 
        },
        { 
            name: 'Periodo', 
            selector: row => `${getMonthName(row.month)} ${row.year}`, 
            sortable: false, 
            wrap: true 
        },
        { 
            name: 'Fecha Pago', 
            selector: row => row.payment_date, 
            sortable: true 
        },
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

    return (
        <div className="row mb-4 border border-primary rounded p-3 mx-auto mt-4" style={{ maxWidth: '95%' }}>
            <div className="col-md-12">
                
                <div className="row mb-2">
                    <div className="col-12"> 
                        {successMessage && <div className="alert alert-success text-center">{successMessage}</div>}
                        {errorMessage && <div className="alert alert-danger text-center">{errorMessage}</div>}
                    </div>
                </div>

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

                <div className="card shadow mb-4">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">Transacciones</h5>
                    </div>
                    <div className="card-body p-0">
                        <DataTable
                            title={`Historial de Transacciones de: ${getFormattedAddress()}`}
                            columns={columns}
                            data={filteredPayments}
                            progressPending={loading}
                            pagination
                            highlightOnHover
                            striped
                            noDataComponent="Esta dirección no tiene pagos registrados."
                        />
                    </div>
                </div>
                
                <button 
                    className="btn btn-secondary mt-3" 
                    onClick={() => navigate('/addresses')}
                >
                    Volver a Direcciones
                </button>
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
                                <p>¿Está seguro de que desea anular el pago por el monto de <strong>${parseFloat(paymentToCancel.amount || paymentToCancel.fee?.amount || 0).toFixed(2)}</strong>?</p>
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
        </div>
    );
};

export default PaymentHistoryPage;