import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { URL } from '../Utils/Config';
import { Line } from 'react-chartjs-2';
import UserContext from '../../context/UserContext';
import ChessBG from '../../assets/chess_bg_1.jpg';

function UserProfile(props) {
    const [user, setUser] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [validUser, setValidUser] = useState(false);
    const [data, setData] = useState({});

    const User = useContext(UserContext);
    const userId = props.match.params.userId;

    // user rating graph options.
    const options = {
        scales: {
            xAxes: [
                {
                    ticks: {
                        display: false, //this will remove the x-axis label
                    },
                },
            ],
        },
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${URL}/u/getUserWithMatches`, { params: { userId: props.match.params.userId } });

                // calcuate the rating frmo match history
                // starting rating is 1000
                let rating = 1000;
                let height = [rating];
                let matchData = [''];

                for (let i = 0; i < res.data.matches.length; i++) {
                    // if match has finished then continue becuase it has no effect on rating.
                    if (res.data.matches[i].winner === '') continue;

                    // get the opponent naame to show in rating graph.
                    let opponent = '';
                    if (res.data.matches[i].blackPlayer._id == userId) opponent = res.data.matches[i].whitePlayer.username;
                    else opponent = res.data.matches[i].blackPlayer.username;

                    // if user won this match increament rating by 50 or decreament by 50.
                    if (res.data.matches[i].winner === 'white') {
                        if (res.data.matches[i].whitePlayer._id == userId) rating += 50;
                        else rating -= 50;
                    } else if (res.data.matches[i].winner === 'black') {
                        if (res.data.matches[i].blackPlayer._id == userId) rating += 50;
                        else rating -= 50;
                    } else if (res.data.matches[i].winner === 'draw') {
                    }

                    height.push(rating);
                    // format opponent name and match time and then put it in mactch data.
                    matchData.push('Vs ' + opponent + '\n' + res.data.matches[i].createdAt.substr(0, 16).replace('T', ' | '));
                }

                setData({
                    labels: matchData,
                    datasets: [
                        {
                            label: 'Rating',
                            data: height,
                            backgroundColor: 'rgba(147, 50, 158, 0.4)',
                            borderColor: 'rgba(255, 0, 92, 0.5)',
                        },
                    ],
                });
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
                        <Link className='nav-link active profile-active-tab' aria-current='page' to={`/u/${userId}`}>
                            View Profile
                        </Link>
                    </li>
                    <li className='nav-item'>
                        <Link className='nav-link' to={`/u/${userId}/matches`}>
                            Match History
                        </Link>
                    </li>
                    {userId == User.user.id && (
                        <li className='nav-item'>
                            <Link className='nav-link' to='/u/updateProfile'>
                                Update Profile
                            </Link>
                        </li>
                    )}
                </ul>
            </div>

            <div id='profile-sub-container'>
                <div id='profile-user-detail'>
                    <div id='profile-picture-container'>
                        <img src={ChessBG} alt='user profile pic' />
                    </div>
                    <div id='profile-username-rating'>
                        <div id='profile-username'>Username: {user.username}</div>
                        <div id='profile-rating'>Rating: {user.rating}</div>
                    </div>
                </div>
                <div id='user-graph-container'>
                    <Line data={data} options={options} />
                </div>
            </div>
        </div>
    );
}

export default UserProfile;
