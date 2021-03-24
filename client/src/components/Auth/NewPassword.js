import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, Spinner } from 'react-bootstrap';
import { URL } from '../Utils/Config';
import ChessBG from '../../assets/chess_bg_1.jpg';

function NewPassword(props) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isVerifyingData, setIsVerifyingData] = useState(true);
    const [isUrlValid, setIsUrlValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                // check if reset token is valid(expired or wrong token) or not.
                await axios.post(`${URL}/u/confirmResetToken`, {resetToken: props.match.params.resetToken})      
                setIsVerifyingData(false);
                setIsUrlValid(true);
            } catch (error) {
                if (error.response && error.response.data)setError(error.response.data.error);
                setIsVerifyingData(false);
                setIsUrlValid(false);
            }
        }
        verifyToken();
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axios.post(`${URL}/u/newPassword`, { password: password, confirmPassword: confirmPassword, resetToken: props.match.params.resetToken });
            setMessage('Your Password has been reset')
            setError('');
            setIsLoading(false);
        } catch (error) {
            if (error.response && error.response.data)setError(error.response.data.error);
            setIsLoading(false);
        }
    };

    // if reset token is begin verified then show loading spinner
    if (isVerifyingData) {
        return (
            <div className='Spinner'>
                <Spinner animation='border' variant='primary' />
            </div>
        );
    }

    // if reset token is not valid then show error message
    if ( !isUrlValid ) {
        return (
            <Alert variant='warning'>{error}</Alert>
        )
    } 

    return (
        <div style={{ backgroundImage: `url(${ChessBG})`, height: '100%' }}>
            <div className='card col-lg-3 login-form'>
                {error !== '' && <Alert variant='danger'>{error}</Alert>}
                {message !== '' && <Alert variant='success'>{message}</Alert>}
                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label htmlFor='password'>Password</label>
                        <input
                            type='password'
                            className='form-control'
                            id='password'
                            placeholder='Enter new password'
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='confirmPassword'>Confirm Password</label>
                        <input
                            type='password'
                            className='form-control'
                            id='confirmPassword'
                            placeholder='Enter new password'
                            onChange={(e) => setConfirmPassword(e.target.value)}
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

export default NewPassword;
