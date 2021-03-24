import React, { useState } from 'react';
import axios from 'axios';
import { Alert, Spinner } from 'react-bootstrap';
import { URL } from '../Utils/Config';
import ChessBG from '../../assets/chess_bg_1.jpg';

function ResetPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axios.post(`${URL}/u/resetPassword`, { email: email });
            setIsLoading(false);
            setMessage(
                'Mail for reseting your password has been sent to you. Plaese check your mails and make sure to check spam folder'
            );
            setError('');
        } catch (error) {
            if (error.response && error.response.data) setError(error.response.data.error);
            setIsLoading(false);
        }
    };

    return (
        <div style={{ backgroundImage: `url(${ChessBG})`, height: '100%' }}>
            <div className='card col-lg-3 login-form'>
                {message !== '' && <Alert variant='success'>{message}</Alert>}
                {error !== '' && <Alert variant='danger'>{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label htmlFor='email'>Email Address</label>
                        <input
                            type='email'
                            className='form-control'
                            id='email'
                            aria-describedby='emailHelp'
                            placeholder='Enter Email'
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className='LoginButton'>
                        <div>
                            <button type='submit' className='btn btn-primary' disabled={isLoading}>
                                Reset Password
                            </button>
                        </div>
                        {isLoading && (
                            <div className='LoginSpinner'>
                                <Spinner animation='border' variant='primary' />
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;
