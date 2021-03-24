import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import Chess from 'chess.js';
import Chessboard from 'chessboardjsx';
import { Spinner, Table, Modal } from 'react-bootstrap';
import UserContext from '../../context/UserContext';
import { GenerateMove } from '../Utils/GenerateMove';

import chess_move_sound from '../../assets/chess_move_sound.mp3';



/*
for the generation of computer's move minimax algorithm is used. it is further optimized using alpha beta pruning.
*/




function Computer() {
    const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    const [moves, setMoves] = useState([]);
    const [playerColor, setPlayerColor] = useState('');
    const [turn, setTurn] = useState('');
    const [matchStatus, setMatchStatus] = useState('Ongoing');
    const [inCheck, setInCheck] = useState('');
    const [showPopUp, setShowPopUp] = useState(false);
    const [squareStyles, setSquareStyles] = useState({})

    const [isLoading, setisLoading] = useState(true);

    let chess = new Chess(fen);
    const signal = axios.CancelToken.source();
    const User = useContext(UserContext);

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
            if (winner === 'draw') {
                setMatchStatus('Game draw');
            } else if (lastMoveColor === playerColor) {
                setMatchStatus('You Won');
            } else {
                setMatchStatus('You Lose')
            }
            setShowPopUp(true);
        }
    };


    const updateScroll = () => {
        // if moves history doesn't fit in window then scroll down to latest move.
        var element = document.getElementById("moves-table-container");
        if (element)
            element.scrollTop = element.scrollHeight;
    }
    useEffect(() => {
        // if new move is added then scroll down to latest move.
        if (movesRef.current.length !== moves.length)
            updateScroll();
        turnRef.current = turn;
        playerColorRef.current = playerColor;
        movesRef.current = moves;
    });

    useEffect(() => {
        const JoinGame = async () => {
            try {
                // user will play white and computer will play black.
                setTurn('white');
                setPlayerColor('white');
                setisLoading(false);
            } catch (error) {
                if (axios.isCancel(error)) {
                    console.error('Error: ', error.message);
                } else {
                    console.log(error.response.data.error)
                }
                setisLoading(false);
            }
        };
        JoinGame();
        
        return () => {
            isMounted.current = false;
            signal.cancel('Api calls are being cancelled');
        };
    }, []);

    const handleMove = async (move) => {
        // if user tries to move some piece but it is not user's turn then return.
        if (turn !== playerColor) {
            return;
        }
        if (chess.move(move)) {
            
            // play chess move sound.
            const audioEl = document.getElementsByClassName("audio-element")[0]
            audioEl.play();

            const newFen = chess.fen();
            checkWinStatus(playerColor);

            if (isMounted.current) {
                // update all the states.
                setFen(newFen);
                setMoves([...movesRef.current, {from: move.from, to: move.to}]);
                setInCheck(chess.in_check() && !chess.in_checkmate());
                if (newFen.split(' ')[1] === 'w') {
                    setTurn('white');
                } else {
                    setTurn('black');
                }
            }

            if (chess.in_draw() || chess.in_checkmate())
                return ;

            setTimeout(() => {
                // playing random moves
                // const generatedMoves = chess.moves({ verbose: true });
                // const index = parseInt(Math.random() * (generatedMoves.length - 1));
                // move = generatedMoves[index];


                // generate move using minimax and alpha beta pruning.
                move = GenerateMove(chess.fen());
                chess.move(move);

                
                setFen(chess.fen());
                setMoves([...movesRef.current, {from: move.from, to: move.to}]);
                setInCheck(chess.in_check() && !chess.in_checkmate());
                setTurn('white');
                checkWinStatus('black')
                
                setTimeout(() => {
                    const audioEl2 = document.getElementsByClassName("audio-element2")[0]
                    audioEl2.play();
                }, 300)
            }, 50)
        }
    };

    const onMouseOverSquare = (square) => {
        // when user puts mouse over some square then generate possible movement from that square.
        const moves = chess.moves({ square: square, verbose: true})
        const styling = {}
        for (let i = 0; i < moves.length; i++) {
            styling[moves[i].to] = {
                background:"radial-gradient(circle, #b5e48c 38%, transparent 40%)",
                borderRadius: "50%"
            }
        }
        setSquareStyles(styling)
    }
    const onMouseOutSquare = () => {
        setSquareStyles({})
    }

    
    if (isLoading) {
        return <div className="Spinner" >
            <Spinner animation="border" variant="primary" />
        </div>
    }

    return (
        <div id="GameContainer">
            
            {/* after game ends this modal will show game status to the user */}
            <Modal show={showPopUp} backdrop="static" onHide={() => setShowPopUp(false)} keyboard={false} >
                <Modal.Header closeButton>
                    <Modal.Title>{matchStatus}</Modal.Title>
                </Modal.Header>
            </Modal>


            <div id="wrapper">
                <div id="left-sidebar-wrapper">
                    <Table striped bordered hover variant="dark">
                        <tbody>
                            {inCheck && (
                                <tr>
                                    <td colSpan="2" id="in-check-text">{turn.charAt(0).toUpperCase() + turn.slice(1)} in Check</td>
                                </tr>
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
                                {
                                    matchStatus === 'Ongoing' ? (
                                        <td>{matchStatus}</td>
                                    ) : matchStatus === 'You Won' ? (
                                        <td id="win-status">You Won</td>
                                    ) : (
                                        <td id="lose-status">You Lose</td>
                                    )
                                }
                            </tr>
                        </tbody>
                    </Table>
                </div>

                <div id="chessboard-wrapper">
                    <div id="player-information-opponent">
                        <div>Computer</div>
                        <div>Rating: Unknown</div>
                    </div>

                    {/* render chessboard with config */}
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
                            lightSquareStyle={{ backgroundColor: "AliceBlue" }}
                            darkSquareStyle={{ backgroundColor: "#007f5f" }}
                        />
                    </div>
                    <div id="player-information-you">
                        <div>Username: {User.user.username || 'Unknown'}</div>
                        <div>Rating: {User.user.rating || 'Unknown'}</div>
                    </div>
                </div>

                
                <div id="right-sidebar-wrapper">
                    <div id="moves-table-container">
                        <Table striped bordered hover variant="dark">
                            <thead>
                                <tr>
                                    <th colSpan="2" id="moves-header" >Moves</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    moves.map((move, index) => {
                                        if (index % 2 === 0) {
                                            return <tr key={index}>
                                                <td className='move-color-indicator-white'></td>
                                                <td className='move-text'>{`${move.from} -> ${move.to}`}</td>
                                            </tr>
                                        } else {
                                            return <tr key={index}>
                                                <td className='move-color-indicator-black'></td>
                                                <td className='move-text'>{`${move.from} -> ${move.to}`}</td>
                                            </tr>
                                        }
                                    })
                                }
                            </tbody>
                        </Table>
                    </div>  
                </div>
            </div>

            <audio className="audio-element">
                <source type="audio/mp3" src={chess_move_sound}></source>
            </audio>
            <audio className="audio-element2">
                <source type="audio/mp3" src={chess_move_sound}></source>
            </audio>
        </div>
    );
}

export default Computer;
