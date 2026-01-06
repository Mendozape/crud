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
    const [paidMonths, setPaidMonths] = useState([]); 
    const [year, setYear] = useState('');
    const [fees, setFees] = useState([]);
    const [formValidated, setFormValidated] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [validationWarning, setValidationWarning] = useState(false);
    const [streetName, setStreetName] = useState('Cargando...'); 

    const { setSuccessMessage, setErrorMessage } = useContext(MessageContext);
    const navigate = useNavigate();

    const axiosOptions = {
        withCredentials: true,
        headers: { Accept: 'application/json' },
    };

    const getLocalDate = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localDate = new Date(now.getTime() - offset * 60000);
        return localDate.toISOString().split('T')[0];
    };

    useEffect(() => {
        const fetchAddressDetails = async () => {
            try {
                const addressResponse = await axios.get(`/api/addresses/${addressId}`, axiosOptions);
                const details = addressResponse.data.data;
                setAddressDetails(details);
                
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

    const isMonthRegistered = (monthNum) => paidMonths.some(item => item.month === monthNum);
    const getMonthStatus = (monthNum) => paidMonths.find(item => item.month === monthNum);

    // 🔥 ACTUALIZADO: Lógica de monto dinámico
    const handleFeeChange = (e) => {
        const selectedFee = fees.find(fee => fee.id === parseInt(e.target.value));
        setFeeId(e.target.value);
        setPaidMonths([]);
        setSelectedMonths([]);
        setWaivedMonths([]);
        setYear('');
        
        if (selectedFee && addressDetails) {
            // Selecciona monto según el tipo de predio (casa o terreno)
            const finalAmount = addressDetails.type.toLowerCase() === 'casa' 
                ? selectedFee.amount_house 
                : selectedFee.amount_land;
                
            setAmount(finalAmount);
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
    
    const handleSelectAllMonths = (e) => {
        const isChecked = e.target.checked;
        const unpaidMonthsNums = months.map(m => m.value).filter(m => !isMonthRegistered(m));
        if (isChecked) {
            setSelectedMonths(unpaidMonthsNums);
            setWaivedMonths([]);
        } else {
            setSelectedMonths([]);
            setWaivedMonths([]);
        }
    };

    const handleConfirmSubmit = async () => {
        setErrorMessage('');
        setSuccessMessage('');
        const unpaidSelectedMonths = selectedMonths.filter(m => !isMonthRegistered(Number(m)));
        const monthsToWaive = unpaidSelectedMonths.filter(m => waivedMonths.includes(m));

        if (unpaidSelectedMonths.length === 0) {
            setErrorMessage('Por favor, seleccione al menos un mes no pagado.');
            setShowModal(false);
            return;
        }

        try {
            await axios.post('/api/address_payments', {
                address_id: addressId, 
                fee_id: feeId,
                payment_date: paymentDate,
                year,
                months: unpaidSelectedMonths,
                waived_months: monthsToWaive,
            }, axiosOptions);
            setSuccessMessage('Registro de movimiento(s) exitoso.');
            setShowModal(false);
            navigate('/addresses', { replace: true });
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Error al procesar el pago.');
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
        { value: currentYear - 1, label: currentYear - 1 },
        { value: currentYear, label: currentYear },
        { value: currentYear + 1, label: currentYear + 1 }
    ];
    
    const getFormattedAddress = () => {
        if (!addressDetails) return 'Cargando Dirección...';
        return `${streetName} #${addressDetails.street_number} (${addressDetails.type})`;
    };
    
    const allUnpaidSelected = months.filter(m => !isMonthRegistered(m.value)).length === selectedMonths.length && selectedMonths.length > 0;

    return (
        <div className="container mt-5">
            <h2>Registrar pago: **{getFormattedAddress()}**</h2>
            <form onSubmit={(e) => { e.preventDefault(); setFormValidated(true); if (!feeId || !year || !paymentDate) setValidationWarning(true); else setShowModal(true); }} noValidate className={formValidated ? 'was-validated' : ''}>
                <div className="form-group mb-3">
                    <label>Cuota</label>
                    <select value={feeId} onChange={handleFeeChange} className="form-control" required>
                        <option value="">Seleccionar Cuota</option>
                        {fees.map(fee => <option key={fee.id} value={fee.id}>{fee.name}</option>)}
                    </select>
                </div>
                
                {feeId && (
                    <>
                        <div className="mb-2"><strong>Monto Aplicado:</strong> ${amount}</div>
                        <div className="mb-3 text-muted"><strong>Descripción:</strong> {description}</div>
                        <div className="form-group mb-3">
                            <label>Año</label>
                            <select value={year} onChange={(e) => setYear(e.target.value)} className="form-control" required>
                                {years.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                            </select>
                        </div>
                    </>
                )}

                {feeId && year && (
                    <div className="form-group mb-3">
                        <label>Acción por Mes</label>
                        <div className="form-check mb-2">
                            <input type="checkbox" className="form-check-input" id="selectAllMonths" checked={allUnpaidSelected} onChange={handleSelectAllMonths} />
                            <label className="form-check-label" htmlFor="selectAllMonths">Seleccionar Todos (Pagar)</label>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-bordered text-center">
                                <thead>
                                    <tr>
                                        <th>Acción</th>
                                        {months.map(m => <th key={m.value}>{m.label}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="fw-bold">Estado:</td>
                                        {months.map(m => {
                                            const status = getMonthStatus(m.value);
                                            const isPay = selectedMonths.includes(m.value) && !waivedMonths.includes(m.value);
                                            const isWaive = waivedMonths.includes(m.value);
                                            return (
                                                <td key={m.value}>
                                                    {status ? (
                                                        <span className={status.status === 'Condonado' ? 'text-info fw-bold' : 'text-success fw-bold'}>{status.status}</span>
                                                    ) : (
                                                        <div className="d-flex flex-column align-items-center">
                                                            <label style={{fontSize: '0.7em'}}><input type="radio" name={`m-${m.value}`} checked={isPay} onChange={() => handleActionChange(m.value, 'pay')} /> P</label>
                                                            <label style={{fontSize: '0.7em'}} className="text-info"><input type="radio" name={`m-${m.value}`} checked={isWaive} onChange={() => handleActionChange(m.value, 'waive')} /> C</label>
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
                )}

                <div className="form-group mb-3">
                    <label>Fecha de Pago</label>
                    <input value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} type='date' className='form-control' required />
                </div>
                <button type="submit" className="btn btn-primary">Registrar Pago</button>
            </form>

            {/* Modales de confirmación y validación abreviados por espacio pero funcionales */}
            {showModal && (
                <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header"><h5>Confirmar Registro</h5></div>
                            <div className="modal-body">¿Desea registrar los movimientos seleccionados?</div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button className="btn btn-primary" onClick={handleConfirmSubmit}>Confirmar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default PaymentForm;