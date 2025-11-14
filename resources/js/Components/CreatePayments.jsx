import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageContext } from './MessageContext';

const PaymentForm = () => {
    const { id: residentId } = useParams();
    const [residentName, setResidentName] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [feeId, setFeeId] = useState('');
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [paidMonths, setPaidMonths] = useState([]);
    const [year, setYear] = useState('');
    const [fees, setFees] = useState([]);
    const [formValidated, setFormValidated] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [validationWarning, setValidationWarning] = useState(false);

    const { setSuccessMessage, setErrorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    const axiosOptions = {
        withCredentials: true,
        headers: {
            Accept: 'application/json',
        },
    };

    const getLocalDate = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localDate = new Date(now.getTime() - offset * 60000);
        return localDate.toISOString().split('T')[0];
    };

    // Fetch resident name (English Code Comments)
    useEffect(() => {
        const fetchResidentName = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/residents/${residentId}`, axiosOptions);
                setResidentName(response.data.name);
            } catch (error) {
                console.error('Error fetching resident name:', error);
            }
        };
        fetchResidentName();
    }, [residentId]);

    // Fetch fees (English Code Comments)
    useEffect(() => {
        const fetchFees = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/fees', axiosOptions);
                
                // CRITICAL FIX: Filter out soft-deleted fees (where deleted_at is NOT null)
                // We only keep fees where fee.deleted_at is falsy (i.e., null or undefined).
                const activeFees = (response.data.data || []).filter(fee => !fee.deleted_at);
                
                setFees(activeFees);
            } catch (error) {
                console.error('Error fetching fees:', error);
            }
        };
        fetchFees();
        setPaymentDate(getLocalDate());
    }, []);

    // Fetch paid months (English Code Comments)
    useEffect(() => {
        const fetchPaidMonths = async () => {
            if (!year || !feeId) return;
            try {
                const response = await axios.get(
                    `http://localhost:8000/api/resident_payments/${residentId}/${year}?fee_id=${feeId}`,
                    axiosOptions
                );
                setPaidMonths(response.data.months.map(m => parseInt(m)));
            } catch (error) {
                console.error('Error fetching paid months:', error);
                setPaidMonths([]);
            }
        };
        fetchPaidMonths();
        setSelectedMonths([]);
    }, [year, residentId, feeId]);

    // Handle fee selection (English Code Comments)
    const handleFeeChange = (e) => {
        const selectedFee = fees.find(fee => fee.id === parseInt(e.target.value));
        setFeeId(e.target.value);
        setPaidMonths([]);
        setSelectedMonths([]);
        setYear('');
        if (selectedFee) {
            // Source amount and description from the selected fee data (Normalization)
            setAmount(selectedFee.amount);
            setDescription(selectedFee.description);
        } else {
            setAmount('');
            setDescription('');
        }
    };

    // Handle submit (English Code Comments)
    const handleConfirmSubmit = async () => {
        setErrorMessage('');
        setSuccessMessage('');

        const unpaidSelectedMonths = selectedMonths.filter(
            (month) => !paidMonths.includes(Number(month))
        );

        if (unpaidSelectedMonths.length === 0) {
            setErrorMessage('Por favor, seleccione al menos un mes no pagado.');
            setShowModal(false);
            return;
        }

        // Prepare data for API (excluding redundant amount/description fields)
        const paymentData = {
            resident_id: residentId,
            fee_id: feeId,
            // amount and description are not sent to be saved in resident_payments
            payment_date: paymentDate,
            year,
            months: unpaidSelectedMonths,
        };

        try {
            await axios.post('http://localhost:8000/api/resident_payments', paymentData, axiosOptions);
            setSuccessMessage('Pago(s) registrado(s) exitosamente.');
            setShowModal(false);
            navigate('/residents');
        } catch (error) {
            if (error.response?.status === 422 && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                console.error('Error registering payment(s):', error);
                setErrorMessage('Fallo al registrar el/los pago(s).');
            }
            setShowModal(false);
        }
    };

    const months = [
        { value: 1, label: 'Enero' },
        { value: 2, label: 'Febrero' },
        { value: 3, label: 'Marzo' },
        { value: 4, label: 'Abril' },
        { value: 5, label: 'Mayo' },
        { value: 6, label: 'Junio' },
        { value: 7, label: 'Julio' },
        { value: 8, label: 'Agosto' },
        { value: 9, label: 'Septiembre' },
        { value: 10, label: 'Octubre' },
        { value: 11, label: 'Noviembre' },
        { value: 12, label: 'Diciembre' },
    ];

    const currentYear = new Date().getFullYear();
    const years = [
        { value: '', label: 'Seleccionar Año' },
        { value: currentYear - 2, label: currentYear - 2 },
        { value: currentYear - 1, label: currentYear - 1 },
        { value: currentYear, label: currentYear },
        { value: currentYear + 1, label: currentYear + 1 },
        { value: currentYear + 2, label: currentYear + 2 }
    ];

    const toggleMonth = (monthValue) => {
        if (paidMonths.includes(Number(monthValue))) return;
        setSelectedMonths(prev =>
            prev.includes(monthValue)
                ? prev.filter(m => m !== monthValue)
                : [...prev, monthValue]
        );
    };

    const handleSelectAllMonths = (e) => {
        if (e.target.checked) {
            const unpaid = months
                .map(m => m.value)
                .filter(m => !paidMonths.includes(m.value));
            setSelectedMonths(unpaid);
        } else {
            setSelectedMonths([]);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Registrar Pago para {residentName}</h2>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setFormValidated(true);

                    const hasUnpaidSelected = selectedMonths.some(month => !paidMonths.includes(Number(month)));

                    if (!feeId || !year || !hasUnpaidSelected || !paymentDate) {
                        setValidationWarning(true);
                    } else {
                        setShowModal(true);
                    }
                }}
                noValidate
                className={formValidated ? 'was-validated' : ''}
            >
                <div className="form-group">
                    <label>Cuota</label>
                    <select
                        value={feeId}
                        onChange={handleFeeChange}
                        className="form-control"
                        required
                    >
                        <option value="">Seleccionar Cuota</option>
                        {fees.map(fee => (
                            <option key={fee.id} value={fee.id}>{fee.name}</option>
                        ))}
                    </select>
                    <div className="invalid-feedback">Por favor, seleccione una cuota.</div>
                </div>

                <div className="form-group d-flex align-items-center">
                    <label className="mb-0 mr-2" style={{ width: '100px' }}>Monto:</label>
                    <span>{amount}</span>
                </div>

                <div className="form-group d-flex align-items-center">
                    <label className="mb-0 mr-2" style={{ width: '100px' }}>Descripción:</label>
                    <span>{description}</span>
                </div>

                <div className="form-group">
                    <label>Año</label>
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="form-control"
                        required
                    >
                        {years.map(year => (
                            <option key={year.value} value={year.value}>{year.label}</option>
                        ))}
                    </select>
                    <div className="invalid-feedback">Por favor, seleccione un año.</div>
                </div>

                <div className="form-group">
                    <label>Meses</label>
                    <div className="form-check mb-2">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="selectAllMonths"
                            checked={selectedMonths.length === months.filter(m => !paidMonths.includes(m.value)).length}
                            onChange={handleSelectAllMonths}
                        />
                        <label className="form-check-label" htmlFor="selectAllMonths">
                            Seleccionar Todos
                        </label>
                    </div>

                    <div className="d-flex flex-wrap">
                        {months.map((monthObj) => {
                            const isPaid = paidMonths.includes(Number(monthObj.value));
                            const isChecked = selectedMonths.includes(monthObj.value) || isPaid;

                            return (
                                <div key={monthObj.value} className="form-check mr-3">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id={`month-${monthObj.value}`}
                                        value={monthObj.value}
                                        checked={isChecked}
                                        onChange={() => toggleMonth(monthObj.value)}
                                        disabled={isPaid}
                                    />
                                    <label className="form-check-label" htmlFor={`month-${monthObj.value}`}>
                                        {monthObj.label}
                                    </label>
                                </div>
                            );
                        })}
                    </div>

                    {formValidated && selectedMonths.filter(m => !paidMonths.includes(m)).length === 0 && (
                        <div className="text-danger mt-2">Por favor, seleccione al menos un mes no pagado.</div>
                    )}
                </div>

                <div className="form-group mt-3">
                    <label>Fecha de Pago</label>
                    <input
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        type='date'
                        className='form-control'
                        required
                    />
                    <div className="invalid-feedback">Por favor, seleccione una fecha de pago.</div>
                </div>

                <button type="submit" className="btn btn-primary mt-3">Registrar Pago</button>
            </form>

            {/* Confirmation Modal */}
            <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirmar Pago</h5>
                            <button type="button" className="close" onClick={() => setShowModal(false)}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            ¿Está seguro de que desea registrar este pago?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button type="button" className="btn btn-primary" onClick={handleConfirmSubmit}>Confirmar</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Validation Warning Modal */}
            <div className={`modal ${validationWarning ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header bg-warning">
                            <h5 className="modal-title text-dark">Validación Requerida</h5>
                            <button type="button" className="close" onClick={() => setValidationWarning(false)}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className="modal-body text-dark">
                            Por favor, revise el formulario. Faltan campos obligatorios o contienen datos no válidos.
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setValidationWarning(false)}>Aceptar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentForm;