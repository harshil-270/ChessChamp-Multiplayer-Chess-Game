import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import Chess from 'chess.js';
import Chessboard from 'chessboardjsx';
import { URL } from '../Utils/Config';
import Modal from 'react-bootstrap/Modal';
import { Redirect } from 'react-router-dom';
import { Alert, Spinner, Table } from 'react-bootstrap';
import UserContext from '../../context/UserContext';
import chess_move_sound from '../../assets/chess_move_sound.mp3';

// Learn more about what is fen in chess from here.
// https://www.chess.com/terms/fen-chess

/*
-first some user creates a game.
-when someone tries to join game by using game link, first it is checked that game is full or not.
-if game is not full then user is joined to that game and socket event is fired to other player that opponent has joined.
-when any player moves the piece, after validating that move another socket event is emitted for the move.
*/

let socket = io(URL);

function Game(props) {
    const [fen, setFen] = useState(
        'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    );
    const [moves, setMoves] = useState([]);
    const [turn, setTurn] = useState('');
    const [playerColor, setPlayerColor] = useState('');
    const [matchStatus, setMatchStatus] = useState('Ongoing');
    const [inCheck, setInCheck] = useState('');

    // when game ends a popup is used to show the status(Win, Lose, Draw)
    const [showPopUp, setShowPopUp] = useState(false);

    const [opponentDetails, setOpponentDetails] = useState({
        username: '',
        rating: 0,
    });

    // when user hovers over a piece on board. to indicate all possible positions, this positions are given different styling.
    const [squareStyles, setSquareStyles] = useState({});

    const [redirectToLogin, setRedirectToLogin] = useState(false);
    const [isLoading, setisLoading] = useState(true);
    const [isLobbyFull, setIsLobbyFull] = useState(false);

    let chess = new Chess(fen);
    const User = useContext(UserContext);
    const gameId = props.match.params.gameId;
    const signal = axios.CancelToken.source();

    const movesRef = useRef(moves);
    const turnRef = useRef(turn);
    const playerColorRef = useRef(playerColor);
    const isMounted = useRef(true);

    const checkWinStatus = async (lastMoveColor) => {
        // check if game is ended or not. if ended then determine the winner using who played last move.
        let winner = '';
        if (chess.in_draw()) {
            winner = 'draw';
        } else if (chess.in_checkmate()) {
            winner = lastMoveColor;
        }
        if (winner !== '') {
            if (winner === 'd') {
                setMatchStatus('Game draw');
            } else if (lastMoveColor === playerColor) {
                setMatchStatus('You Won');
            } else {
                setMatchStatus('You Lose');
            }
            setShowPopUp(true);
            try {
                await axios.post(
                    `${URL}/g/gameStatus`,
                    { winner: winner, gameId: gameId },
                    { cancelToken: signal.token }
                );
            } catch (error) {
                if (axios.isCancel(error)) {
                    console.error('Error: ', error.message);
                }
            }
        }
    };
    const updateScroll = () => {
        // if moves history doesn't fit in window then scroll down to latest move.
        var element = document.getElementById('moves-table-container');
        if (element) element.scrollTop = element.scrollHeight;
    };

    const fetchOpponentDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${URL}/g/getOpponentDetails`, {
                headers: { token: token },
                params: { gameId: gameId, color: playerColorRef.current },
            });
            if (res.data.bothPlayerJoined) {
                setOpponentDetails({
                    username: res.data.username,
                    rating: res.data.rating,
                });
            }
        } catch (error) {
            if (axios.isCancel(error)) {
                console.error('Error: ', error.message);
            }
        }
    };

    useEffect(() => {
        // if new move is added then scroll down to latest move.
        if (movesRef.current.length !== moves.length) updateScroll();
        turnRef.current = turn;
        playerColorRef.current = playerColor;
        movesRef.current = moves;
    });

    useEffect(() => {
        const JoinGame = async () => {
            if (!socket) {
                socket = io(URL);
            }
            try {
                // CHecking if user has logged in or not.
                // if not then redirect user to login page.
                const token = localStorage.getItem('token');
                const user = await axios.post(`${URL}/u/verifyToken`, {
                    token: token,
                });
                if (!user.data.isValid) {
                    setRedirectToLogin(true);
                    return;
                }

                // now retrive the current game data.
                const game = await axios.post(
                    `${URL}/g/join`,
                    { gameId: gameId, userId: user.data.id },
                    { cancelToken: signal.token }
                );

                if (isMounted.current) {
                    // setting up the chess configs
                    chess.load(game.data.fen);
                    setFen(game.data.fen);
                    setMoves(game.data.moves);
                    setInCheck(chess.in_check() && !chess.in_checkmate());
                    setPlayerColor(game.data.playerColor);

                    // get current player's turn from fen notation.
                    game.data.fen.split(' ')[1] === 'w'
                        ? setTurn('white')
                        : setTurn('black');
                    // if match is over then find the game status.
                    if (game.data.winner !== '') {
                        if (game.data.winner === 'draw') {
                            setMatchStatus('Game Draw');
                        } else if (game.data.winner === game.data.playerColor) {
                            setMatchStatus('You Won');
                        } else {
                            setMatchStatus('You lose');
                        }
                    }
                    await fetchOpponentDetails();
                    setisLoading(false);

                    // make the socket connection/
                    socket.emit('join', { gameId: gameId });
                    socket.on('receiveMove', (data) => {
                        // check if this move is of opponents or not.
                        if (data.playerColor !== playerColorRef.current) {
                            const audioEl =
                                document.getElementsByClassName(
                                    'audio-element'
                                )[0];
                            audioEl.play();

                            chess.load(data.fen);
                            checkWinStatus(data.playerColor);

                            if (isMounted.current) {
                                setFen(chess.fen());
                                setMoves([
                                    ...movesRef.current,
                                    { from: data.move.from, to: data.move.to },
                                ]);
                                setInCheck(
                                    chess.in_check() && !chess.in_checkmate()
                                );
                                setTurn(playerColorRef.current);
                            }
                        }
                    });
                    // whenever opponent joins set the  opponentDetail state.
                    socket.on('userJoined', async () => {
                        fetchOpponentDetails();
                    });
                }
            } catch (error) {
                if (axios.isCancel(error))
                    console.error('Error: ', error.message);
                else setIsLobbyFull(true);
                setisLoading(false);
            }
        };
        JoinGame();

        return () => {
            isMounted.current = false;
            if (socket) {
                socket.close();
                socket = null;
            }
            signal.cancel('Api calls are being cancelled');
        };
    }, []);

    const handleMove = async (move) => {
        // if user tries to move some piece but it is not that user's turn then return.
        if (turn !== playerColor) {
            return;
        }
        if (chess.move(move)) {
            // plat the chess move sound.
            const audioEl = document.getElementsByClassName('audio-element')[0];
            audioEl.play();

            const newFen = chess.fen();
            socket.emit('postMove', {
                gameId,
                playerColor,
                move,
                fen: newFen,
            });

            checkWinStatus(playerColor);

            if (isMounted.current) {
                setFen(newFen);
                setMoves([...moves, { from: move.from, to: move.to }]);
                setInCheck(chess.in_check() && !chess.in_checkmate());
                // get the player's turn from fen notation.
                if (newFen.split(' ')[1] === 'w') {
                    setTurn('white');
                } else {
                    setTurn('black');
                }
            }

            try {
                await axios.post(
                    `${URL}/g/postMove`,
                    { gameId: gameId, move: move, fen: newFen },
                    { cancelToken: signal.token }
                );
            } catch (error) {
                if (axios.isCancel(error)) {
                    console.error('Error: ', error.message);
                }
            }
        }
    };

    const onMouseOverSquare = (square) => {
        // when user puts mouse over some square then generate possible movement from that square and display it.
        const moves = chess.moves({ square: square, verbose: true });
        const styling = {};
        for (let i = 0; i < moves.length; i++) {
            styling[moves[i].to] = {
                background:
                    'radial-gradient(circle, #b5e48c 38%, transparent 40%)',
                borderRadius: '50%',
            };
        }
        setSquareStyles(styling);
    };
    const onMouseOutSquare = () => {
        setSquareStyles({});
    };

    // if user is not logged in then redirect to login page.
    if (redirectToLogin) {
        return (
            <Redirect
                to={{
                    pathname: '/login',
                    state: {
                        from: props.location.pathname,
                        message: 'Login to play the game',
                    },
                }}
            />
        );
    }
    if (isLoading) {
        return (
            <div className="Spinner">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }
    // if both player joined already in the game then displat lobby full message.
    if (isLobbyFull) {
        return (
            <Alert variant="warning">
                Lobby is already full and game is started. Create new game to
                play with friends
            </Alert>
        );
    }

    return (
        <div id="GameContainer">
            <Modal
                show={showPopUp}
                backdrop="static"
                onHide={() => setShowPopUp(false)}
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{matchStatus}</Modal.Title>
                </Modal.Header>
            </Modal>

            <div id="wrapper">
                <div id="left-sidebar-wrapper">
                    <Table striped bordered hover variant="dark">
                        <tbody>
                            {inCheck ? (
                                <tr>
                                    <td colSpan="2" id="in-check-text">
                                        {turn.charAt(0).toUpperCase() +
                                            turn.slice(1)}{' '}
                                        in Check
                                    </td>
                                </tr>
                            ) : (
                                <></>
                            )}
                            <tr>
                                <td>Turn</td>
                                <td>{turn}</td>
                            </tr>
                            <tr>
                                <td>Your Color</td>
                                <td>{playerColor}</td>
                            </tr>
                            <tr>
                                <td>Status</td>
                                {matchStatus === 'Ongoing' ? (
                                    <td>{matchStatus}</td>
                                ) : matchStatus === 'You Won' ? (
                                    <td id="win-status">You Won</td>
                                ) : (
                                    <td id="lose-status">You Lose</td>
                                )}
                            </tr>
                        </tbody>
                    </Table>
                    <div id="game-link-container">
                        <h6>Share this link to anyone to play</h6>
                        <textarea
                            className="form-control"
                            id="game-link"
                            value={window.location.href}
                            disabled={true}
                        />
                        <button
                            className="btn btn-light"
                            id="copy-button"
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    window.location.href
                                );
                            }}
                        >
                            Copy link
                        </button>
                    </div>
                </div>

                <div id="chessboard-wrapper">
                    <div id="player-information-opponent">
                        {opponentDetails.username !== '' ? (
                            <>
                                <div>Username: {opponentDetails.username}</div>
                                <div>Rating: {opponentDetails.rating}</div>
                            </>
                        ) : (
                            <div>Waiting for opponent to Join...</div>
                        )}
                    </div>
                    <div id="chessboard">
                        <Chessboard
                            width={'550'}
                            position={fen}
                            onDrop={(move) => {
                                handleMove({
                                    from: move.sourceSquare,
                                    to: move.targetSquare,
                                    promotion: 'q',
                                });
                            }}
                            orientation={playerColor}
                            onMouseOverSquare={onMouseOverSquare}
                            onMouseOutSquare={onMouseOutSquare}
                            squareStyles={squareStyles}
                            lightSquareStyle={{ backgroundColor: 'AliceBlue' }}
                            darkSquareStyle={{ backgroundColor: '#007f5f' }}
                            // darkSquareStyle={{ backgroundColor: "#4a4e69" }}
                            // darkSquareStyle={{ backgroundColor: "CornFlowerBlue" }}
                        />
                    </div>
                    <div id="player-information-you">
                        <div>Username: {User.user.username}</div>
                        <div>Rating: {User.user.rating}</div>
                    </div>
                </div>

                <div id="right-sidebar-wrapper">
                    <div id="moves-table-container">
                        <Table striped bordered hover variant="dark">
                            <thead>
                                <tr>
                                    <th colSpan="2" id="moves-header">
                                        Moves
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {moves.map((move, index) => {
                                    if (index % 2 === 0) {
                                        return (
                                            <tr key={index}>
                                                <td className="move-color-indicator-white"></td>
                                                <td className="move-text">{`${move.from} -> ${move.to}`}</td>
                                            </tr>
                                        );
                                    } else {
                                        return (
                                            <tr key={index}>
                                                <td className="move-color-indicator-black"></td>
                                                <td className="move-text">{`${move.from} -> ${move.to}`}</td>
                                            </tr>
                                        );
                                    }
                                })}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>
            <audio className="audio-element">
                <source type="audio/mp3" src={chess_move_sound}></source>
            </audio>
        </div>
    );
}

export default Game;
