import React, {useEffect, useState} from 'react'
import axios from 'axios'
import {Link} from 'react-router-dom'
const endpoint = 'http://localhost:8000/api'
export default function ShowEmployees() {
    const [employees, setEmployees] = useState([]);
    useEffect ( ()=> {
        getAllEmployees();
    }, [])
    const getAllEmployees = async () => {
        const response = await axios.get(`${endpoint}/residents`, { 
            headers: {
                'Authorization': 'Bearer 16|6Ll4eMbEkYq321VPmLqHOxHjEY2Jls3U9wreBqiE747f93f6',
                'Accept': 'application/json',
            },
        });
        setEmployees(response.data)
    }
    const deleteEmployee = async (id) => {
        await axios.delete(`${endpoint}/residents/${id}`, { 
            headers: {
                'Authorization': 'Bearer 16|6Ll4eMbEkYq321VPmLqHOxHjEY2Jls3U9wreBqiE747f93f6',
                'Accept': 'application/json',
            },
        });
       getAllEmployees();
    }
    return (
    <div>
        <div className='d-grid gap-2'>
            <Link to="/create" className='btn btn-success btn-lg mt-2 mb-2 text-white'>Create</Link>
        </div>
        <table className='table table-striped'>
            <thead className='bg-primary text-white'>
                <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Last Name</th>
                    <th>email</th>
                    <th>street</th>
                    <th>street number</th>
                    <th>Community</th>
                    <th>Comments</th>
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
                            <Link to={`/edit/${employee.id}`} className='btn btn-info'>Edit</Link>
                            <button onClick={ ()=>deleteEmployee(employee.id)} className='btn btn-danger'>Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  )
}


//export default ShowEmployees