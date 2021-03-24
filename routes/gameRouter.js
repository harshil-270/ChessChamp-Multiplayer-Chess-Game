const Router = require('express').Router();
const userAuth = require('../auth/userAuth');
const Game = require('../models/games');
const User = require('../models/users');
require('dotenv').config();

Router.post('/create', async (req, res) => {
    try {
        // create a game with given fen position
        let game = new Game({
            fen: req.body.fen,
        });
        game = await game.save();
        res.json({ gameId: game._id });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'server error' });
    }
});

Router.post('/join', async (req, res) => {
    try {
        const gameId = req.body.gameId;
        const game = await Game.findById(gameId);
        if (game) {
            if (game.whitePlayer == req.body.userId) {
                // user is already joined as white player.
                res.status(200).json({ playerColor: 'white', fen: game.fen, moves: game.moves, winner: game.winner });
            } else if (game.blackPlayer == req.body.userId) {
                // user is already joined as black player.
                res.status(200).json({ playerColor: 'black', fen: game.fen, moves: game.moves, winner: game.winner });
            } else if (game.bothPlayerJoined) {
                res.status(403).json({ error: 'Game is already started' });
            } else {
                if (game.whitePlayer == null) {
                    // if white player has not joined then join current user as a white player.
                    game.whitePlayer = req.body.userId;
                    await game.save();
                    res.status(200).json({ playerColor: 'white', fen: game.fen, moves: game.moves, winner: game.winner });
                } else {
                    // if black player has not joined then join current user as a black player.
                    game.blackPlayer = req.body.userId;
                    game.bothPlayerJoined = true;
                    await game.save();
                    res.status(200).json({ playerColor: 'black', fen: game.fen, moves: game.moves, winner: game.winner });
                }
            }
        } else {
            req.status(404).json({ error: 'Game not found' });
        }
    } catch (error) {
        console.log(error);
        req.status(500).json({ error: 'Server error' });
    }
});

Router.post('/postMove', async (req, res) => {
    try {
        let game = await Game.findById(req.body.gameId);
        if (game) {
            // update the fen and append move to the list
            game.fen = req.body.fen;
            game.moves.push({
                from: req.body.move.from,
                to: req.body.move.to,
            });
            await game.save();
            res.status(200).json({ msg: 'Move posted successfully' });
        } else {
            res.status(404).json({ error: 'Game not found' });
        }
    } catch (error) {
        console.log(error);
        req.status(500).json({ error: 'Server error' });
    }
});

Router.post('/gameStatus', async (req, res) => {
    try {
        const game = await Game.findById(req.body.gameId);
        if (game) {
            game.winner = req.body.winner;

            let whitePlayer = await User.findById(game.whitePlayer);
            let blackPlayer = await User.findById(game.blackPlayer);

            // if game is not draw then update user rating.
            if (req.body.winner != 'draw') {
                whitePlayer.rating += req.body.winner == 'white' ? 50 : -50;
                blackPlayer.rating += req.body.winner == 'black' ? 50 : -50;
            }

            await game.save();
            await whitePlayer.save();
            await blackPlayer.save();
            res.status(200).json({ msg: 'Win status saved successfully' });
        } else {
            res.status(404).json({ error: 'Game not found' });
        }
    } catch (error) {
        console.log(error);
        req.status(500).json({ error: 'Server error' });
    }
});

Router.get('/topUsers', async (req, res) => {
    try {
        // get the top 25 players according to the rating.
        // only select their username and rating from data
        // then sort by their rating.
        const users = await User.find({}, { username: 1, rating: 1 }).sort({ rating: -1 }).limit(25);
        res.status(200).json({ users: users });
    } catch (error) {
        console.log(error);
        req.status(500).json({ error: 'server error' });
    }
});

Router.get('/getOpponentDetails', userAuth, async (req, res) => {
    try {
        let game = await Game.findById(req.query.gameId);
        if (game) {
            // check if opponent has joined or not.
            if (!game.bothPlayerJoined) {
                return res.status(200).json({ bothPlayerJoined: false });
            }

            // if our color is white then get the black player's details.
            // else get white players details.
            let user;
            if (req.query.color == 'white') {
                user = await User.findById(game.blackPlayer);
            } else {
                user = await User.findById(game.whitePlayer);
            }
            res.status(200).json({
                username: user.username,
                rating: user.rating,
                bothPlayerJoined: game.bothPlayerJoined,
            });
        } else {
            res.status(404).json({ error: 'Game not found' });
        }
    } catch (error) {
        console.log(error);
        req.status(500).json({ error: 'Server error' });
    }
});

module.exports = Router;
