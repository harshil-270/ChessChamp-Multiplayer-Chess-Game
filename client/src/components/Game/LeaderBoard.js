import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Spinner, Table } from 'react-bootstrap';
import { URL } from '../Utils/Config';
import { Link } from 'react-router-dom';
import ChessBG from '../../assets/chess_bg_1.jpg'

function LeaderBoard() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getTopUsers = async () => {
            const res = await axios.get(`${URL}/g/topUsers`);
            setUsers(res.data.users);
            setIsLoading(false);
        };
        getTopUsers();
    }, []);

    if (isLoading) {
        return (
            <div className='Spinner'>
                <Spinner animation='border' variant='primary' />
            </div>
        );
    }

    return (
        <div style={{backgroundImage: `url(${ChessBG})`, height: '100%'}}>
            <div id='leaderboard-container'>
                <Table striped bordered hover variant="dark">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Username</th>
                            <th>Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => {
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td><Link to={`/u/${user._id}`}  style={{color: 'white', fontWeight: 'bold'}} >{user.username}</Link></td>
                                    <td>{user.rating}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}

export default LeaderBoard;
