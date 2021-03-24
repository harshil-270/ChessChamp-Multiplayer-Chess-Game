import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Spinner, Table } from 'react-bootstrap';
import { Link, useHistory } from 'react-router-dom';
import { URL } from '../Utils/Config';
import UserContext from '../../context/UserContext';

function MatchHistory(props) {
    const [user, setUser] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [validUser, setValidUser] = useState(false);

    const User = useContext(UserContext);
    const history = useHistory();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // get the user id from parameters
                const userId = props.match.params.userId;
                const res = await axios.get(`${URL}/u/getUserWithMatches`, { params: { userId: userId } });
                // data will be from first match to latest match. we want latest match first.
                res.data.matches.reverse();
                setUser(res.data);
                setIsLoading(false);
                setValidUser(true);
            } catch (error) {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [props.match.params.userId]);

    if (isLoading) {
        return (
            <div className='Spinner'>
                <Spinner animation='border' variant='primary' />
            </div>
        );
    }

    if (!validUser) {
        return <Alert variant='warning'>404 User Not Found</Alert>;
    }

    return (
        <div className='profile-container'>
            <div>
                <ul className='nav nav-tabs'>
                    <li className='nav-item'>
                        <Link className='nav-link' to={`/u/${props.match.params.userId}`}>
                            View Profile
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link
                            className='nav-link active profile-active-tab'
                            aria-current='page'
                            to={`/u/${props.match.params.userId}/matches`}>
                            Match History
                        </Link>
                    </li>
                    {props.match.params.userId == User.user.id && (
                        <li className='nav-item'>
                            <Link className='nav-link' to='/u/updateProfile'>
                                Update Profile
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
            <div id='match-history-container'>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Index</th>
                            <th>Opponent</th>
                            <th>Time</th>
                            <th>Status</th>
                            {User.user.id == props.match.params.userId && <th>Goto Match</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {user.matches.map((match, index) => {
                            let status = '';
                            if (match.winner === '') {
                                status = 'Not Finished';
                            } else if (match.winner === 'draw') {
                                status = 'draw';
                            } else {
                                if (
                                    (match.winner === 'white' && match.whitePlayer._id == props.match.params.userId) ||
                                    (match.winner === 'black' && match.blackPlayer._id == props.match.params.userId)
                                ) {
                                    status = 'Won';
                                } else {
                                    status = 'Lose';
                                }
                            }
                            return (
                                <tr key={index}>
                                    <td>{index}</td>
                                    <td>
                                        {match.whitePlayer._id == props.match.params.userId
                                            ? match.blackPlayer.username
                                            : match.whitePlayer.username}
                                    </td>
                                    <td>{match.createdAt.substr(0, 16).replace('T', ' | ')}</td>
                                    <td>{status}</td>
                                    {User.user.id == props.match.params.userId && (
                                        <td>
                                            <button className='btn btn-dark' onClick={() => history.push(`/g/${match._id}`)}>
                                                GO
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}

export default MatchHistory;
