import React, { useState } from 'react';
import axios from 'axios';
import { Alert, Spinner } from 'react-bootstrap';
import { URL } from '../Utils/Config';
import { Link } from 'react-router-dom';
import ChessBG from '../../assets/chess_bg_1.jpg';

function Register() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axios.post(`${URL}/u/register`, {
                email: email,
                username: username,
                password: password,
                confirmPassword: confirmPassword,
            });
            setError('');
            setSuccessMessage(
                'Registered successfully. Please Confirm your email address. Confirmation mail is sent to your email address. Make sure to check your spam folder.'
            );
            setIsLoading(false);
        } catch (error) {
            setError(error.response.data.error);
            setIsLoading(false);
        }
    };

    return (
        <div style={{ backgroundImage: `url(${ChessBG})`, height: '100%' }}>
            <div className='card col-lg-3 register-form'>
                {successMessage !== '' && <Alert variant='success'>{successMessage}</Alert>}
                {error !== '' && <Alert variant='danger'>{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label htmlFor='username'>Username</label>
                        <input
                            type='text'
                            className='form-control'
                            id='username'
                            placeholder='Enter Username'
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='email'>Email Address</label>
                        <input
                            type='email'
                            className='form-control'
                            id='email'
                            placeholder='Enter Email'
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='password'>Password</label>
                        <input
                            type='password'
                            className='form-control'
                            id='password'
                            placeholder='Password'
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='confirmPassword'>Confirm Password</label>
                        <input
                            type='password'
                            className='form-control'
                            id='confirmPassword'
                            placeholder='Confirm Password'
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <div className='RegisterButton'>
                        <div>
                            <button type='submit' className='btn btn-primary' disabled={isLoading}>
                                Register
                            </button>
                        </div>
                        {isLoading && (
                            <div className='RegisterSpinner'>
                                <Spinner animation='border' variant='primary' />
                            </div>
                        )}
                    </div>

                    <div>
                        Already have an account? <Link to='/login'>Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
