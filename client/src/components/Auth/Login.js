import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Alert, Spinner } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import { URL } from '../Utils/Config';
import UserContext from '../../context/UserContext';
import ChessBG from '../../assets/chess_bg_1.jpg';

function Login(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const history = useHistory();
    const User = useContext(UserContext);

    useEffect(() => {
        // if it is redirected from different component then it might have also included some error message.
        if (props.location.state && props.location.state.message) {
            setError(props.location.state.message);
        }
        // when user confirms email address. they are redirected to login page with params indicating that user has confirmed email address.
        if (new URLSearchParams(props.location.search).get('EmailConfirmedRedirect') === 'true') {
            setMessage('Your Email address is confirmed successfully. Now login to continue');
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsLoading(true);
        try {
            const res = await axios.post(`${URL}/u/login`, { email: email, password: password });

            setIsLoading(false);
            // set the user data in UserContext
            User.setUser({
                id: res.data.id,
                username: res.data.username,
                rating: res.data.rating,
                isValid: true,
            });
            localStorage.setItem('token', res.data.token);

            // if previously user was redirected from some component to login then after login redirect back to original component.
            // else redirect to home apge
            if (props.location.state && props.location.state.from) {
                history.push(props.location.state.from);
            } else {
                history.push('/');
            }
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
                    <div>
                        <Link to='/resetPassword'>Forgot password?</Link>
                    </div>
                    <div className='LoginButton'>
                        <div>
                            <button type='submit' className='btn btn-primary' disabled={isLoading}>
                                Login
                            </button>
                        </div>
                        {isLoading && (
                            <div className='LoginSpinner'>
                                <Spinner animation='border' variant='primary' />
                            </div>
                        )}
                    </div>
                    <div>
                        Don't have an account? <Link to='/register'>Register Now</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
