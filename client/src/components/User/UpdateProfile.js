import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { Link, Redirect } from 'react-router-dom';
import { URL } from '../Utils/Config';
import UserContext from '../../context/UserContext';

function UpdateProfile(props) {
    const [username, setUsername] = useState();
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [validUser, setValidUser] = useState(false);
    
    const User = useContext(UserContext);
    
    useEffect(() => {
        const fetchData = async () => {
            try {            
                const token = localStorage.getItem('token');
                const res = await axios.get(`${URL}/u/getUser`, { headers: {token: token}, params: { userId: User.user.id } });
                setUsername(res.data.username);
                setValidUser(true);
                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);


    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${URL}/u/updateProfile`, {username: username} ,{headers: {token: token}})
            setMessage('Updated Successfully');
            setError('');
            setIsUpdating(false);
        } catch (error) {
            setMessage('');
            setError('Update Failed. Please try again');
            setIsUpdating(false);
        }
    }



    if (isLoading) {
        return (
            <div className='Spinner'>
                <Spinner animation='border' variant='primary' />
            </div>
        );
    }

    // if user has not logged in then redirect to login page.
    if (!validUser) {
        return <Redirect to={{
            pathname: '/login',
            state: {from: props.location.pathname, message: 'Please Login to continue'}
        }} />
    }

    return (
        <div className='profile-container'>
            <div>
                <ul className='nav nav-tabs'>
                    <li className='nav-item'>
                        <Link className='nav-link' aria-current='page' to={`/u/${User.user.id}`}>
                            View Profile
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link className='nav-link' to={`/u/${User.user.id}/matches`}>
                            Match History
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link className='nav-link active profile-active-tab' to='/u/updateProfile'>
                            Update Profile
                        </Link>
                    </li>
                </ul>
            </div>

            <div id='update-profile-container'>
                <div className='card col-lg-3 login-form'>
                    {message !== '' && <Alert variant='success'>{message}</Alert>}
                    {error !== '' && <Alert variant='danger'>{error}</Alert>}
                    <form onSubmit={handleUpdate}>
                        
                        <div className='form-group'>
                            <label htmlFor='username'>Username</label>
                            <input
                                type='text'
                                className='form-control'
                                id='username'
                                placeholder='Enter New Username'
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className='LoginButton'>
                            <div>
                                <button type='submit' className='btn btn-primary' disabled={isLoading}>
                                    Update
                                </button>
                            </div>
                            {isUpdating && (
                                <div className='LoginSpinner'>
                                    <Spinner animation='border' variant='primary' />
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default UpdateProfile;
