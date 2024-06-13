import axios from 'axios'
import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'
const endpoint = 'http://localhost:8000/api/residents'
//const CreateEmployee = () => {
export default function CreateEmployee() {
    const [photo, setPhoto] = useState('')
    const [name, setName] = useState('')
    const [last_name, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [street, setStreet] = useState('')
    const [street_number, setStreetNumber] = useState('')
    const [community, setCommunity] = useState('')
    const [comments, setComments] = useState('')
    const navigate = useNavigate()
    const store = async (e) => {
        e.preventDefault();
        await axios.post(
            endpoint, 
            {
                photo: photo,
                name: name,
                last_name: last_name,
                email: email,
                street: street,
                street_number: street_number,
                community: community,
                comments: comments
            },
            {
                headers: {
                    'Authorization': 'Bearer 16|6Ll4eMbEkYq321VPmLqHOxHjEY2Jls3U9wreBqiE747f93f6',
                    'Accept': 'application/json',
                },
            }
        )
        navigate('/resident')
    }
  return (
    <div>
        <h2>Creat a new resident</h2>
        <form onSubmit={store}>
            <div className='mb-3'>
                <label className='form-label'>Photo</label>
                <input 
                    value={photo} 
                    onChange={ (e)=> setPhoto(e.target.value)}
                    type='text'
                    className='form-control'
                />
            </div>
            <div className='mb-3'>
                <label className='form-label'>Name</label>
                <input 
                    value={name} 
                    onChange={ (e)=> setName(e.target.value)}
                    type='text'
                    className='form-control'
                />
            </div>
            <div className='mb-3'>
                <label className='form-label'>Last Name</label>
                <input 
                    value={last_name} 
                    onChange={ (e)=> setLastName(e.target.value)}
                    type='text'
                    className='form-control'
                />
            </div>
            <div className='mb-3'>
                <label className='form-label'>Email</label>
                <input 
                    value={email} 
                    onChange={ (e)=> setEmail(e.target.value)}
                    type='text'
                    className='form-control'
                />
            </div>
            <div className='mb-3'>
                <label className='form-label'>Street</label>
                <input 
                    value={street} 
                    onChange={ (e)=> setStreet(e.target.value)}
                    type='text'
                    className='form-control'
                />
            </div>
            <div className='mb-3'>
                <label className='form-label'>Street Number</label>
                <input 
                    value={street_number} 
                    onChange={ (e)=> setStreetNumber(e.target.value)}
                    type='text'
                    className='form-control'
                />
            </div>
            <div className='mb-3'>
                <label className='form-label'>Community</label>
                <input 
                    value={community} 
                    onChange={ (e)=> setCommunity(e.target.value)}
                    type='text'
                    className='form-control'
                />
            </div>
            <div className='mb-3'>
                <label className='form-label'>Comments</label>
                <input 
                    value={comments} 
                    onChange={ (e)=> setComments(e.target.value)}
                    type='text'
                    className='form-control'
                />
            </div>
            <button type='submit' className='btn btn-success'>Save</button>
        </form>
    </div>
  )
}
//export default CreateEmployee