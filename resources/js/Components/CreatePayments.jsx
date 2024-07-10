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
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [fees, setFees] = useState([]);
    const { setSuccessMessage, setErrorMessage } = useContext(MessageContext);
    const [formValidated, setFormValidated] = useState(false);
    const navigate = useNavigate();

    const authHeaders = {
        headers: {
            'Authorization': 'Bearer 19|QrjZXV4Drh50B7Ql0WRhv27IIHy4l6vZHn2Oo71Zdf859653',
            'Accept': 'application/json',
        },
    };

    useEffect(() => {
        const fetchResidentName = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/residents/${residentId}`, authHeaders);
                setResidentName(response.data.name);
            } catch (error) {
                console.error('Error fetching resident name:', error);
            }
        };

        fetchResidentName();
    }, [residentId]);

    useEffect(() => {
        const fetchFees = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/fees', authHeaders);
                setFees(response.data);
            } catch (error) {
                console.error('Error fetching fees:', error);
            }
        };

        fetchFees();

        // Set current date
        const currentDate = new Date().toISOString().split('T')[0];
        setPaymentDate(currentDate);
    }, []);

    const handleFeeChange = (e) => {
        const selectedFee = fees.find(fee => fee.id === parseInt(e.target.value));
        setFeeId(e.target.value);
        if (selectedFee) {
            setAmount(selectedFee.amount);
            setDescription(selectedFee.description);
        }
    };

    const store = async (e) => {
        e.preventDefault();
        setFormValidated(true);

        const paymentData = {
            resident_id: residentId,
            fee_id: feeId,
            amount,
            description,
            payment_date: paymentDate,
            month,
            year
        };

        try {
            const response = await axios.post('http://localhost:8000/api/resident_payments', paymentData, authHeaders);
            setSuccessMessage('Payment registered successfully.');
            navigate('/resident');
        } catch (error) {
            console.error('Error registering payment:', error);
            setErrorMessage('Failed to register payment.');
        }
    };

    const months = [
        { value: '', label: 'Select Month' },
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ];

    const currentYear = new Date().getFullYear();
    const years = [
        { value: '', label: 'Select Year' },
        { value: currentYear - 2, label: currentYear - 2 },
        { value: currentYear - 1, label: currentYear - 1 },
        { value: currentYear, label: currentYear },
        { value: currentYear + 1, label: currentYear + 1 },
        { value: currentYear + 2, label: currentYear + 2 }
    ];

    return (
        <div className="container mt-5">
            <h2>Register Payment for {residentName}</h2>
            <form onSubmit={store} noValidate className={formValidated ? 'was-validated' : ''}>
                <div className="form-group">
                    <label>Fee</label>
                    <select
                        value={feeId}
                        onChange={handleFeeChange}
                        className="form-control"
                        required
                    >
                        <option value="">Select Fee</option>
                        {fees.map(fee => (
                            <option key={fee.id} value={fee.id}>{fee.name}</option>
                        ))}
                    </select>
                    <div className="invalid-feedback">
                        Please select a fee.
                    </div>
                </div>
                <div className="form-group">
                    <label>Amount</label>
                    <input
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        type='number'
                        className='form-control'
                        required
                    />
                    <div className="invalid-feedback">
                        Please enter an amount.
                    </div>
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        type='text'
                        className='form-control'
                        required
                    />
                    <div className="invalid-feedback">
                        Please enter a description.
                    </div>
                </div>
                <div className="form-group">
                    <label>Payment Date</label>
                    <input
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        type='date'
                        className='form-control'
                        required
                    />
                    <div className="invalid-feedback">
                        Please select a payment date.
                    </div>
                </div>
                <div className="form-group">
                    <label>Month</label>
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="form-control"
                        required
                    >
                        {months.map(month => (
                            <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                    </select>
                    <div className="invalid-feedback">
                        Please select a month.
                    </div>
                </div>
                <div className="form-group">
                    <label>Year</label>
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
                    <div className="invalid-feedback">
                        Please select a year.
                    </div>
                </div>
                <button type="submit" className="btn btn-primary mt-3">Register Payment</button>
            </form>
        </div>
    );
};

export default PaymentForm;