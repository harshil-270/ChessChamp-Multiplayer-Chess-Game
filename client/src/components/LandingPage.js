import React, { useContext, useState, useEffect, useRef } from 'react';
import Home from './Home';
import UserContext from '../context/UserContext';
import { useHistory } from 'react-router-dom';
import ChessBG from '../assets/chess_bg_1.jpg';

function LandingPage() {
    const [message, setMessage] = useState('');
    const [cursor, setCursor] = useState('cursor');
    const User = useContext(UserContext);
   
    let index = 0;
    const text = 'Chess Champ';

    const history = useHistory();
    const messageRef = useRef(message);
    const cursorRef = useRef(cursor);

    useEffect(() => {
        messageRef.current = message;
        cursorRef.current = cursor;
    });

    useEffect(() => {
        // blink cursor every interval by changing the classname
        let cursor = setInterval(() => {
            if (cursorRef.current === '') {
                setCursor('cursor');
            } else {
                setCursor('');
            }
        }, 400);

        // animating "Chess Champ" text
        // add new character to current text
        let typing = setInterval(() => {
            setMessage(messageRef.current + text[index]);
            index++;
            if (index === text.length) {
                clearInterval(typing);
            }
        }, 150);

        return () => {
            clearInterval(cursor);
            clearInterval(typing);
        };
    }, []);

    return User.user.isValid ? (
        <Home />
    ) : (
        <div id='landing-page-container' style={{ backgroundImage: `url(${ChessBG})` }}>
            <div id='landing-page-title'>
                {message}
                <span id={`${cursor}`}>|</span>
                <div style={{ fontSize: '28px' }}>
                    <div>
                        <button className='btn btn-light' onClick={() => history.push('/register')} style={{ fontSize: '18px' }}>
                            Register
                        </button>{' '}
                        to play chess with your friends
                    </div>
                    <div>
                        Or{' '}
                        <button
                            className='btn btn-success'
                            onClick={() => history.push('/g/computer')}
                            style={{ fontSize: '18px' }}>
                            Play against Computer
                        </button>{' '}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;
