import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageContext } from './MessageContext';

const PaymentForm = () => {
    const { id: addressId } = useParams();
    const [addressDetails, setAddressDetails] = useState(null); 
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [feeId, setFeeId] = useState('');
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [waivedMonths, setWaivedMonths] = useState([]);
    
    // Almacena los objetos {month: X, status: 'Pagado'/'Condonado'}
    const [paidMonths, setPaidMonths] = useState([]); 
    
    const [year, setYear] = useState('');
    const [fees, setFees] = useState([]);
    const [formValidated, setFormValidated] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [validationWarning, setValidationWarning] = useState(false);
    
    // NEW STATE: To hold the Street Name fetched using the street_id
    const [streetName, setStreetName] = useState('Cargando...'); 

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

    // NEW EFFECT: Fetch Address Details and then fetch the Street Name using street_id
    useEffect(() => {
        const fetchAddressDetails = async () => {
            try {
                // 1. Fetch Address Details (which now contains street_id)
                const addressResponse = await axios.get(`/api/addresses/${addressId}`, axiosOptions);
                const details = addressResponse.data.data;
                setAddressDetails(details);
                
                // 2. Fetch Street Name using street_id
                if (details && details.street_id) {
                    const streetResponse = await axios.get(`/api/streets/${details.street_id}`, axiosOptions);
                    setStreetName(streetResponse.data.name || 'Calle Desconocida');
                } else {
                     setStreetName('ID de Calle no encontrado');
                }
            } catch (error) {
                console.error('Error fetching address or street details:', error);
                setErrorMessage('Fallo al cargar la dirección o el nombre de la calle.');
                setStreetName('Error de Carga');
            }
        };
        fetchAddressDetails();
    }, [addressId]);

    useEffect(() => {
        const fetchFees = async () => {
            try {
                const response = await axios.get('/api/fees', axiosOptions);
                const activeFees = (response.data.data || []).filter(fee => !fee.deleted_at);
                setFees(activeFees);
            } catch (error) {
                console.error('Error fetching fees:', error);
            }
        };
        fetchFees();
        setPaymentDate(getLocalDate());
    }, []);

    useEffect(() => {
        const fetchPaidMonths = async () => {
            if (!year || !feeId) return;
            try {
                const response = await axios.get(
                    `/api/address_payments/paid-months/${addressId}/${year}?fee_id=${feeId}`,
                    axiosOptions
                );
                // Asumimos que el backend devuelve un array de objetos {month: X, status: Y}
                setPaidMonths(response.data.months || []);
            } catch (error) {
                console.error('Error fetching paid months:', error);
                setPaidMonths([]);
            }
        };
        fetchPaidMonths();
        setSelectedMonths([]);
        setWaivedMonths([]);
    }, [year, addressId, feeId]);

    const isMonthRegistered = (monthNum) => {
        return paidMonths.some(item => item.month === monthNum);
    };

    const getMonthStatus = (monthNum) => {
        return paidMonths.find(item => item.month === monthNum);
    };

    const handleFeeChange = (e) => {
        const selectedFee = fees.find(fee => fee.id === parseInt(e.target.value));
        setFeeId(e.target.value);
        setPaidMonths([]);
        setSelectedMonths([]);
        setWaivedMonths([]);
        setYear('');
        if (selectedFee) {
            setAmount(selectedFee.amount);
            setDescription(selectedFee.description);
        } else {
            setAmount('');
            setDescription('');
        }
    };

    const handleActionChange = (monthValue, action) => {
        const monthNum = Number(monthValue);

        setSelectedMonths(prevSelected => {
            let newSelected = prevSelected.filter(m => m !== monthNum);
            let newWaived = waivedMonths.filter(m => m !== monthNum);

            if (action === 'pay') {
                newSelected.push(monthNum);
                setWaivedMonths(newWaived);
            } else if (action === 'waive') {
                newSelected.push(monthNum);
                newWaived.push(monthNum);
                setWaivedMonths(newWaived);
            } else {
                setWaivedMonths(newWaived);
            }

            return newSelected;
        });
    };
    
    // NEW HANDLER: Seleccionar Todos los meses disponibles y ponerlos en 'Pagar'
    const handleSelectAllMonths = (e) => {
        const isChecked = e.target.checked;
        const unpaidMonthsNums = months
            .map(m => m.value)
            .filter(m => !isMonthRegistered(m));

        if (isChecked) {
            // Activar 'Pagar' para todos los meses no registrados
            setSelectedMonths(unpaidMonthsNums);
            // Asegurarse de que no haya meses condonados
            setWaivedMonths([]);
        } else {
            // Deseleccionar todo
            setSelectedMonths([]);
            setWaivedMonths([]);
        }
    };


    const handleConfirmSubmit = async () => {
        setErrorMessage('');
        setSuccessMessage('');

        const unpaidSelectedMonths = selectedMonths.filter(
            (month) => !isMonthRegistered(Number(month))
        );
        
        const monthsToWaive = unpaidSelectedMonths.filter(month => 
            waivedMonths.includes(month)
        );

        if (unpaidSelectedMonths.length === 0) {
            setErrorMessage('Por favor, seleccione al menos un mes no pagado/condonado.');
            setShowModal(false);
            return;
        }

        const paymentData = {
            address_id: addressId, 
            fee_id: feeId,
            payment_date: paymentDate,
            year,
            months: unpaidSelectedMonths,
            waived_months: monthsToWaive,
        };

        try {
            // NOTE: Using 'addressPayments' model as per saved user info.
            await axios.post('/api/address_payments', paymentData, axiosOptions);
            setSuccessMessage('Registro de movimiento(s) exitoso.');
            setShowModal(false);
            
            navigate('/addresses', { replace: true });
        } catch (error) {
            console.error('Payment Submission Error:', error); 
            if (error.response) {
                const msg = error.response.data.message || 
                                        `Error ${error.response.status}: El servidor no pudo procesar la solicitud. Revise la consola.`;
                setErrorMessage(msg);
            } else if (error.request) {
                setErrorMessage('Error de red: No se pudo conectar con el servidor API.');
            } else {
                setErrorMessage('Ocurrió un error inesperado al preparar el pago.');
            }
            setShowModal(false); 
        }
    };

    const months = [
        { value: 1, label: 'Ene' }, { value: 2, label: 'Feb' }, { value: 3, label: 'Mar' }, 
        { value: 4, label: 'Abr' }, { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
        { value: 7, label: 'Jul' }, { value: 8, label: 'Ago' }, { value: 9, label: 'Sep' }, 
        { value: 10, label: 'Oct' }, { value: 11, label: 'Nov' }, { value: 12, label: 'Dic' },
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
    
    // UPDATED: Now uses streetName state instead of reading 'street' directly from addressDetails.
    const getFormattedAddress = () => {
        if (!addressDetails) return 'Cargando Dirección...';
        const { street_number, type } = addressDetails;
        // Uses the fetched streetName
        return `${streetName} #${street_number} (${type})`;
    };
    
    const isFeeSelected = !!feeId;
    const isFilterValid = isFeeSelected && !!year;
    
    const MONTH_COL_WIDTH = 'col'; 
    const LABEL_COL_WIDTH = 'col-1'; 

    // Determina si todos los meses no registrados están seleccionados (para el checkbox maestro)
    const allUnpaidSelected = months.filter(m => !isMonthRegistered(m.value)).length === selectedMonths.length && selectedMonths.length > 0;


    return (
        <div className="container mt-5">
            <h2>Registrar pago: **{getFormattedAddress()}**</h2>
            
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setFormValidated(true);

                    const hasSelectedUnpaid = selectedMonths.some(month => !isMonthRegistered(Number(month)));

                    if (!feeId || !year || !hasSelectedUnpaid || !paymentDate) {
                        setValidationWarning(true);
                    } else {
                        setShowModal(true);
                    }
                }}
                noValidate
                className={formValidated ? 'was-validated' : ''}
            >
                {/* 1. SELECCIÓN DE CUOTA (SIEMPRE VISIBLE) */}
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
                
                {/* 2. CONTENIDO DEPENDIENTE DE LA CUOTA (MONTO, DESCRIPCIÓN, AÑO) */}
                {isFeeSelected && (
                    <>
                        <div className="form-group d-flex align-items-center">
                            <label className="mb-0 mr-2" style={{ width: '100px' }}>Monto:</label>
                            <span>{amount}</span>
                        </div>

                        <div className="form-group d-flex align-items-center">
                            <label className="mb-0 mr-2" style={{ width: '100px' }}>Descripción:</label>
                            <span>{description}</span>
                        </div>

                        {/* 3. SELECCIÓN DEL AÑO (DEPENDIENTE DE LA CUOTA) */}
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
                    </>
                )}

                {/* 4. TABLA DE MESES Y SUBMIT (DEPENDIENTE DE LA CUOTA Y EL AÑO) */}
                {isFilterValid && (
                    <>
                        <div className="form-group">
                            <label>Acción por Mes</label>
                            
                            {/* CHECKBOX SELECCIONAR TODOS */}
                            <div className="form-check mb-2">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="selectAllMonths"
                                    checked={allUnpaidSelected}
                                    onChange={handleSelectAllMonths}
                                />
                                <label className="form-check-label" htmlFor="selectAllMonths">
                                    Seleccionar Todos (Pagar)
                                </label>
                            </div>

                            <div className="border p-3">
                                <div className="table-responsive">
                                    <table className="table table-bordered mb-0" style={{ tableLayout: 'fixed' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '8%', borderRight: '2px solid #dee2e6' }}></th>
                                                {months.map((monthObj) => (
                                                    <th 
                                                        key={`header-${monthObj.value}`} 
                                                        className="text-center"
                                                        style={{ 
                                                            width: '7.66%', 
                                                            borderRight: '1px solid #dee2e6',
                                                            padding: '8px 4px'
                                                        }}
                                                    >
                                                        <span className="text-dark fw-bold">{monthObj.label}</span>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td 
                                                    className="fw-bold align-middle"
                                                    style={{ 
                                                        width: '8%',
                                                        borderRight: '2px solid #dee2e6',
                                                        verticalAlign: 'middle'
                                                    }}
                                                >
                                                    Acción:
                                                </td>
                                                
                                                {months.map((monthObj) => {
                                                    const monthValue = monthObj.value;
                                                    const monthNum = Number(monthValue);
                                                    const registeredData = getMonthStatus(monthNum);
                                                    const isRegistered = !!registeredData;
                                                    
                                                    const isPaySelected = selectedMonths.includes(monthNum) && !waivedMonths.includes(monthNum);
                                                    const isWaiveSelected = waivedMonths.includes(monthNum);
                                                    
                                                    const isDisabled = isRegistered || !isFilterValid; 

                                                    return (
                                                        <td 
                                                            key={`action-${monthValue}`}
                                                            style={{ 
                                                                width: '7.66%',
                                                                borderRight: '1px solid #dee2e6',
                                                                verticalAlign: 'middle',
                                                                padding: '8px 4px'
                                                            }}
                                                        >
                                                            {isRegistered ? (
                                                                <div className="text-center">
                                                                    <span className={
                                                                        registeredData.status === 'Condonado' ? 'text-info fw-bold' : 'text-success fw-bold'
                                                                    }>
                                                                        {registeredData.status}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className='d-flex flex-column align-items-start justify-content-center ms-1' style={{ fontSize: '0.8em' }}>
                                                                    
                                                                    {/* Radio: Pagar */}
                                                                    <div className='form-check mb-1'>
                                                                        <input
                                                                            type="radio"
                                                                            className="form-check-input"
                                                                            name={`month_action_${monthNum}`}
                                                                            id={`pay-${monthNum}`}
                                                                            value="pay"
                                                                            checked={isPaySelected}
                                                                            onChange={() => handleActionChange(monthNum, 'pay')}
                                                                            disabled={isDisabled}
                                                                            style={{ marginRight: '4px' }}
                                                                        />
                                                                        <label className="form-check-label" htmlFor={`pay-${monthNum}`} style={{ userSelect: 'none' }}>Pagar</label>
                                                                    </div>
                                                                    
                                                                    {/* Radio: Condonar */}
                                                                    <div className='form-check'>
                                                                        <input
                                                                            type="radio"
                                                                            className="form-check-input"
                                                                            name={`month_action_${monthNum}`}
                                                                            id={`waive-${monthNum}`}
                                                                            value="waive"
                                                                            checked={isWaiveSelected}
                                                                            onChange={() => handleActionChange(monthNum, 'waive')}
                                                                            disabled={isDisabled}
                                                                            style={{ marginRight: '4px' }}
                                                                        />
                                                                        <label className="form-check-label text-info" htmlFor={`waive-${monthNum}`} style={{ userSelect: 'none' }}>Condonar</label>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Validación de selección de meses */}
                            {formValidated && selectedMonths.filter(m => !isMonthRegistered(m)).length === 0 && (
                                <div className="text-danger mt-2">Por favor, seleccione al menos un mes no pagado.</div>
                            )}
                        </div>

                        {/* Fecha de Pago y Botón de Submit */}
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
                    </>
                )}
            </form>

            {/* Confirmation Modal */}
            <div className={`modal ${showModal ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirmar Registro</h5>
                            <button type="button" className="close" onClick={() => setShowModal(false)}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            ¿Está seguro de que desea registrar estos movimientos (Pagos y/o Condonaciones)?
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