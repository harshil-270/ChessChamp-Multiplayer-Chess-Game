import React, { useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import UserContext from '../context/UserContext';

function Header() {
    const history = useHistory();
    const User = useContext(UserContext);
    const handleRegister = () => {
        history.push('/register');
    };
    const handleLogin = () => {
        history.push('/login');
    };
    const handleLogout = () => {
        // remove user data form UserContext and remove token from local storage
        User.setUser({
            isValid: false,
            username: undefined,
            id: undefined,
            rating: undefined,
        });
        localStorage.setItem('token', '');
        history.push('/');
    };
    return (
        <nav className='navbar navbar-dark bg-primary'>
            <div style={{ display: 'flex' }}>
                <Link to='/'>
                    <div className='navbar-brand title'>Chess Champ</div>
                </Link>
                <Link to='/'>
                    <div className='navbar-item-div'>Home</div>
                </Link>
                {User.user.isValid && (
                    <Link to={`/u/${User.user.id}`}>
                        <div className='navbar-item-div'>Profile</div>
                    </Link>
                )}
                <Link to='/g/leaderboard'>
                    <div className='navbar-item-div'>Leaderboard</div>
                </Link>
            </div>
            <div>
                {User.user.isValid ? (
                    <button onClick={handleLogout} className='btn btn-dark'>
                        Logout
                    </button>
                ) : (
                    <>
                        <button onClick={handleRegister} className='btn btn-dark navbar-register-button'>
                            Register
                        </button>
                        <button onClick={handleLogin} className='btn btn-dark'>
                            Login
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Header;
