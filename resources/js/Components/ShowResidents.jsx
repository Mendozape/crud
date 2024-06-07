import React, {useEffect, useState} from 'react'
import axios from 'axios'
import {Link} from 'react-router-dom'
import { createRoot } from 'react-dom/client';
//import './app';
//import Notis from './testing2';
const endpoint = 'http://localhost:8000/api'
//const ShowEmployees = () => {
export default function ShowEmployees() {
    const [employees, setEmployees] = useState([])
    useEffect ( ()=> {
        getAllEmployees()
    }, [])
    const getAllEmployees = async () => {
        const response = await axios.get(`${endpoint}/residents`)
        setEmployees(response.data)
    }
    const deleteEmployee = async (id) => {
       await axios.delete(`${endpoint}/residents/${id}`)
       getAllEmployees()
    }
    return (
    <div>
        <div className='d-grid gap-2'>
            
        </div>
        <table className='table table-striped'>
            <thead className='bg-primary text-white'>
                <tr>
                    <th>Name</th>
                    <th>Last Name</th>
                    <th>Job</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Age</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                { employees.map( (employee) => (
                    <tr key={employee.id}>
                        <td>{employee.photo}</td>
                        <td>{employee.name}</td>
                        <td>{employee.last_name}</td>
                        <td>{employee.email}</td>
                        <td>{employee.street}</td>
                        <td>{employee.street_number}</td>
                        <td>{employee.community}</td>
                        <td>{employee.comments}</td>
                        <td>
                            
                            <button onClick={ ()=>deleteEmployee(employee.id)} className='btn btn-danger'>Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  )
}
if (document.getElementById('Residents')) {
    createRoot(document.getElementById('Residents')).render(<ShowEmployees />)
}

//export default ShowEmployees