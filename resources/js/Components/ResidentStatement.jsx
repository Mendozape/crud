import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { MessageContext } from './MessageContext';

const ResidentStatement = ({ user }) => {
    // --- STATE MANAGEMENT ---
    const [addressDetails, setAddressDetails] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const [paidMonths, setPaidMonths] = useState([]);
    const [loading, setLoading] = useState(true);
    const { setErrorMessage } = useContext(MessageContext);

    const axiosOptions = {
        withCredentials: true,
        headers: { Accept: 'application/json' },
    };

    // Month mapping for display in Spanish
    const months = [
        { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
        { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
        { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
        { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' },
    ];

    const currentYear = new Date().getFullYear();
    const availableYears = [currentYear - 1, currentYear, currentYear + 1];

    /**
     * Effect: Load the property linked to the logged-in user.
     * Refresh data from API to ensure synchronization.
     */
    useEffect(() => {
        const fetchMyAddress = async () => {
            try {
                if (user && user.address) {
                    setAddressDetails(user.address);
                } else {
                    const response = await axios.get('/api/user', axiosOptions);
                    const freshUser = response.data;
                    if (freshUser.address) {
                        setAddressDetails(freshUser.address);
                    } else {
                        setErrorMessage("No se encontró ningún predio activo vinculado a su cuenta.");
                    }
                }
            } catch (error) {
                console.error("Error detecting address:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyAddress();
    }, [user, setErrorMessage]);

    /**
     * Effect: Fetch the payment records for the selected year.
     */
    useEffect(() => {
        const fetchStatement = async () => {
            if (!addressDetails || !year) return;
            try {
                const response = await axios.get(
                    `/api/address_payments/paid-months/${addressDetails.id}/${year}`,
                    axiosOptions
                );
                setPaidMonths(response.data.months || []);
            } catch (error) {
                console.error("Error fetching payment status:", error);
                setPaidMonths([]);
            }
        };
        fetchStatement();
    }, [year, addressDetails]);

    /**
     * Finds if a specific month is registered in the paidMonths state.
     */
    const getMonthStatus = (monthNum) => paidMonths.find(item => item.month === monthNum);

    if (loading) return (
        <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2">Cargando detalles de la cuenta...</p>
        </div>
    );

    return (
        <div className="container mt-4">
            <div className="card shadow-sm border-primary">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h3 className="mb-0 h5"><i className="fas fa-file-invoice-dollar me-2"></i>Estado de Cuenta</h3>
                    <span className="badge bg-light text-primary">{addressDetails?.community || 'Residencial'}</span>
                </div>
                <div className="card-body">
                    {addressDetails ? (
                        <>
                            <div className="row mb-4 bg-light p-3 rounded mx-0 border">
                                <div className="col-md-6">
                                    <small className="text-muted text-uppercase fw-bold">Propiedad:</small>
                                    <h4 className="fw-bold mb-0">
                                        {addressDetails.street?.name || 'Calle'} #{addressDetails.street_number}
                                    </h4>
                                    <span className="badge bg-secondary">{addressDetails.type}</span>
                                </div>
                                <div className="col-md-6 text-md-end mt-3 mt-md-0">
                                    <label className="form-label text-muted d-block small fw-bold">CONSULTAR OTRO AÑO:</label>
                                    <div className="btn-group">
                                        {availableYears.map(y => (
                                            <button 
                                                key={y} 
                                                className={`btn btn-sm ${year === y ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => setYear(y)}
                                            >
                                                {y}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-hover text-center align-middle border">
                                    <thead className="table-dark">
                                        <tr>
                                            <th className="text-start ps-4">Mes</th>
                                            <th>Estado</th>
                                            <th>Concepto (Cuota)</th>
                                            <th>Fecha de Pago</th>
                                            <th className="text-end pe-4">Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {months.map(m => {
                                            const status = getMonthStatus(m.value);
                                            return (
                                                <tr key={m.value} className={!status ? 'table-light' : ''}>
                                                    <td className="fw-bold text-start ps-4">{m.label}</td>
                                                    <td>
                                                        {status ? (
                                                            <span className={`badge ${status.status === 'Condonado' ? 'bg-info' : 'bg-success'} w-75 p-2`}>
                                                                {status.status}
                                                            </span>
                                                        ) : (
                                                            <span className="badge bg-danger w-75 p-2">Pendiente</span>
                                                        )}
                                                    </td>
                                                    <td className="text-muted small">
                                                        {status?.fee_name || '--'}
                                                    </td>
                                                    <td className="small text-muted">
                                                        {status?.payment_date || '--'}
                                                    </td>
                                                    <td className="text-end pe-4 fw-bold">
                                                        {status ? (
                                                            `$${parseFloat(status.amount_paid || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                                                        ) : (
                                                            <span className="text-muted opacity-50">$0.00</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="alert alert-warning border-warning shadow-sm">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            <strong>Sin predio asignado:</strong> No tienes una propiedad vinculada a tu cuenta. 
                            Por favor, contacta al administrador para completar tu registro.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResidentStatement;