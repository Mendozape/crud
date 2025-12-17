import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { MessageContext } from './MessageContext';
import usePermission from "../hooks/usePermission"; 

const axiosOptions = {
    withCredentials: true,
    headers: {
        Accept: 'application/json',
    },
};

const PaymentHistoryPage = ({ user }) => {
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
    
    const [streetName, setStreetName] = useState('Cargando...'); 

    // 🚨 Initialize the permission hook
    const { can } = usePermission(user);

    // 🛡️ Extraction to constant
    const canCancelPayment = user ? can('Eliminar-pagos') : false;

    const getMonthName = (monthNum) => {
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return monthNum >= 1 && monthNum <= 12 ? monthNames[monthNum - 1] : 'N/A';
    };
    
    const getFormattedAddress = () => {
        if (!addressDetails) return 'Cargando Dirección...';
        const { street_number, type } = addressDetails;
        return `${streetName} #${street_number} (${type})`;
    };

    const fetchPaymentHistory = async () => {
        setLoading(true);
        try {
            const addressResponse = await axios.get(
                `/api/addresses/${addressId}`, 
                axiosOptions
            );
            const addressData = addressResponse.data.data || addressResponse.data;
            setAddressDetails(addressData);

            if (addressData && addressData.street_id) {
                const streetResponse = await axios.get(`/api/streets/${addressData.street_id}`, axiosOptions);
                setStreetName(streetResponse.data.name || 'Calle Desconocida');
            }
            
            const paymentsResponse = await axios.get(
                `/api/address_payments/history/${addressId}`, 
                axiosOptions
            );
            const fetchedPayments = paymentsResponse.data?.data || paymentsResponse.data || [];
            setPayments(fetchedPayments);
            setFilteredPayments(fetchedPayments);
            
        } catch (error) {
            console.error('Error fetching data:', error);
            setErrorMessage('Error al cargar el historial de pagos.'); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (addressId) fetchPaymentHistory();
    }, [addressId]); 
    
    useEffect(() => {
        const paymentsArray = Array.isArray(payments) ? payments : []; 
        const result = paymentsArray.filter(payment => 
            (payment.fee?.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (payment.status || '').toLowerCase().includes(search.toLowerCase())
        );
        setFilteredPayments(result);
    }, [search, payments]);

    const handleCancellation = async () => {
        if (!cancellationReason.trim()) {
            setErrorMessage('Debe especificar un motivo de cancelación.');
            return;
        }

        try {
            await axios.post(`/api/address_payments/cancel/${paymentToCancel.id}`, 
                { reason: cancellationReason }, 
                axiosOptions
            );
            setSuccessMessage('Pago anulado exitosamente.');
            setShowCancelModal(false); 
            fetchPaymentHistory(); 
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Fallo al anular el pago.');
        }
    };

    const columns = useMemo(() => [
        { name: 'Cuota', selector: row => row.fee ? row.fee.name : 'N/A', sortable: true, wrap: true }, 
        { 
            name: 'Monto', 
            selector: row => `$${parseFloat(row.amount || row.fee?.amount || 0).toFixed(2)}`, 
            sortable: true, 
            right: true 
        },
        { name: 'Periodo', selector: row => `${getMonthName(row.month)} ${row.year}`, sortable: false },
        { name: 'Fecha Pago', selector: row => row.payment_date, sortable: true },
        { 
            name: 'Estado', 
            selector: row => row.status, 
            cell: row => (
                <span className={`badge ${row.status === 'Pagado' ? 'bg-info' : 'bg-danger'}`}>
                    {row.status}
                </span>
            ),
        },
        { name: 'Motivo Cancelación', selector: row => row.deletion_reason || '', wrap: true },
        {
            name: 'Acción',
            cell: row => (
                <div className="d-flex justify-content-end w-100">
                    {row.status === 'Anulado' ? (
                        <span className="text-muted small">Anulado</span>
                    ) : (
                        /* 🛡️ Solo mostrar botón si tiene permiso Y el estado permite anular */
                        canCancelPayment && (row.status === 'Pagado' || row.status === 'Condonado') && (
                            <button 
                                className="btn btn-outline-danger btn-sm" 
                                onClick={() => {
                                    setPaymentToCancel(row);
                                    setShowCancelModal(true);
                                    setCancellationReason('');
                                }}
                            >
                                <i className="fas fa-times me-1"></i> Anular
                            </button>
                        )
                    )}
                </div>
            ),
            minWidth: '120px',
        },
    ], [canCancelPayment, navigate]);

    return (
        <div className="row mb-4 border border-primary rounded p-3 mx-auto mt-4" style={{ maxWidth: '95%' }}>
            <div className="col-md-12">
                {successMessage && <div className="alert alert-success text-center">{successMessage}</div>}
                
                <div className="row justify-content-end mb-3">
                    <div className="col-md-4">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Buscar por Cuota o Estado..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="card shadow mb-4">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">Historial de Transacciones</h5>
                    </div>
                    <div className="card-body p-0">
                        <DataTable
                            title={getFormattedAddress()}
                            columns={columns}
                            data={filteredPayments}
                            progressPending={loading}
                            pagination
                            highlightOnHover
                            striped
                            noDataComponent="No hay pagos registrados."
                        />
                    </div>
                </div>
                
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/addresses')}>
                    Volver a Direcciones
                </button>
            </div>
            
            {/* Modal de Anulación */}
            <div className={`modal fade ${showCancelModal ? 'show d-block' : ''}`} tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header bg-danger text-white">
                            <h5 className="modal-title">Confirmar Anulación</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={() => setShowCancelModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <p>¿Confirma la anulación del pago por <strong>${parseFloat(paymentToCancel?.amount || 0).toFixed(2)}</strong>?</p>
                            <div className="form-group">
                                <label className="fw-bold">Motivo de la Anulación *</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={cancellationReason}
                                    onChange={(e) => setCancellationReason(e.target.value)}
                                    placeholder="Explique por qué se anula este pago..."
                                ></textarea>
                            </div>
                            {errorMessage && <div className="alert alert-danger mt-2 small">{errorMessage}</div>}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>Cerrar</button>
                            <button className="btn btn-danger" onClick={handleCancellation} disabled={!cancellationReason.trim()}>
                                Confirmar Anulación
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