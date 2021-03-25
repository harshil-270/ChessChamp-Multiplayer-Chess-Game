const Router = require('express').Router();
const User = require('../models/users');
const Game = require('../models/games');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userAuth = require('../auth/userAuth');
const transporter = require('../auth/emailAuth');
const crypto = require('crypto');
const {SERVER_URL, CLIENT_URL } = require('../config/config');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;



Router.post('/register', async (req, res) => {
    
    // validate the user data.
    if (!req.body.username || !req.body.email || !req.body.password || !req.body.confirmPassword) {
        return res.status(400).json({ error: 'Please fill all the fields' });
    }
    if (req.body.password.length < 5) {
        return res.status(400).json({ error: 'Password length must be greater than 5' });
    }
    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ error: 'Password and confirm password must be same' });
    }

    try {
        let user = await User.findOne({ $or: [{ email: req.body.email }, { username: req.body.username }] });
        if (user) {
            if (user.confirmed) {
                if (user.username === req.body.username) {
                    return res.status(400).json({ error: 'Username is already taken.' });
                } else {
                    return res.status(400).json({ error: 'EmailID is already registered' });
                }
            } else {
                // if difference between current time and account creation time is greater than 1 day(24*60 minutes). then delete it.
                const diffInMin = (Date.now() - user.createdAt.getTime()) / (1000 * 60);
                if (diffInMin <= 24 * 60) {
                    // if username is already taken but email id is not confirmed then
                    // if account was created less than 1 day ago then some other user cant take this username.
                    if (user.username === req.body.username) {
                        return res.status(400).json({ error: 'Username is already taken. Please choose another username' });
                    }
                }
                await User.findByIdAndDelete(user._id);
            }
        }

        // hash the password and then store it in database
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        user = new User({
            email: req.body.email,
            username: req.body.username,
            password: hashedPassword,
        });
        user = await user.save();

        // send email verification mail to user
        jwt.sign({ user: user._id }, JWT_SECRET, { expiresIn: '1d' }, (err, emailToken) => {
            if (err) {
                console.log(err);
            }
            const url = `${SERVER_URL}/u/confirmation/${emailToken}`;
            transporter
                .sendMail({
                    to: user.email,
                    subject: 'Account confirmation for Chess-Champ ',
                    html: `<h3>You registered for Chess-Champ.</h3>Please click on this <a href="${url}">link</a> to confirm your email`,
                })
                .catch((error) => {
                    console.log(error);
                    return res.status(500).json({ error: 'server error' });
                });
            return res.status(200).json({ msg: 'User registered' });
        });
    } catch (error) {
        return res.status(500).json({ error: 'server error' });
    }
});

Router.get('/confirmation/:token', async (req, res) => {
    try {
        // verify the email verification token;
        const data = jwt.verify(req.params.token, JWT_SECRET);
        const id = data.user;
        let user = await User.findById(id);
        if (!user) return res.status(400).json({ err: 'Invalid token' });

        user.confirmed = true;
        await user.save();

        return res.redirect(`${CLIENT_URL}/login?EmailConfirmedRedirect=true`);
    } catch (error) {
        return res.status(500).json({ error: 'server error' });
    }
});

Router.post('/login', async (req, res) => {
    try {
        if (!req.body.email || !req.body.password) {
            return res.status(400).json({ error: 'Please fill all the fields' });
        }
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            // check if user has verified email id or not.
            if (!user.confirmed) {
                return res.status(400).json({ error: 'Please Confirm Your email to login' });
            }
            // comparing password
            let isSame = await bcrypt.compare(req.body.password, user.password);
            if (isSame) {
                const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
                return res.json({
                    token,
                    id: user._id,
                    username: user.username,
                    rating: user.rating,
                });
            } else {
                return res.status(400).json({ error: 'Wrong Email ID or Password' });
            }
        } else {
            return res.status(400).json({ error: 'Account does not exist. Please register first' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'server error' });
    }
});

Router.post('/verifyToken', async (req, res) => {
    try {
        // check if there is auth token in request or not.
        const token = req.body.token;
        if (!token) return res.json({ isValid: false });

        // verify the auth token.
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified) return res.json({ isValid: false });

        const user = await User.findById(verified.id);
        if (user) {
            res.json({
                id: user._id,
                username: user.username,
                rating: user.rating,
                isValid: true,
            });
        } else {
            return res.json({ isValid: false });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'server error' });
    }
});

Router.post('/resetPassword', async (req, res) => {
    try {
        // check if user exists or not.
        let user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ error: 'Email Id is not registered' });

        // generate random token for reseting password.
        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken = token;
        user.expiryTime = Date.now() + 600000; // 10 minutes in millisecond.

        user = await user.save();

        // send mail to user with reset token.
        const url = `${CLIENT_URL}/reset/${token}`;
        transporter
            .sendMail({
                to: user.email,
                subject: 'Password reset for Chess-Champ',
                html: `
            <h3>You have requested for password reset</h3>
            <p><b>Please click on this <a href="${url}">link</a> to reset your password<b></p>`,
            })
            .catch((error) => {
                return res.status(500).json({ error: 'server error' });
            });

        res.status(200).json({ msg: 'Mail for reseting password has been sent' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'server error' });
    }
});

Router.post('/confirmResetToken', async (req, res) => {
    try {
        // check if password reset oktne is valid and has not expired.
        const user = await User.findOne({ resetToken: req.body.resetToken, expiryTime: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).json({ error: 'Your session has expired. Please try reseting password again' });
        }
        return res.status(200).json({ msg: 'reset token is valid' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'server error' });
    }
});

Router.post('/newPassword', async (req, res) => {
    try {
        if (req.body.password.length < 5) {
            return res.status(400).json({ error: 'Password length must be greater than 5' });
        }
        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({ error: 'Password and confirm password must be same' });
        }

        let user = await User.findOne({ resetToken: req.body.resetToken, expiryTime: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ error: 'Your session has expired. Please try reseting password again' });

        // store hashedpassword in database.
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.expiryTime = undefined;
        await user.save();
        res.json({ msg: 'Password updated successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'server error' });
    }
});

Router.get('/getUser', userAuth, async (req, res) => {
    try {
        // get user data
        let user = await User.findById(req.query.userId);
        if (user) {
            res.status(200).json({ username: user.username });
        } else {
            res.status(404).json({ msg: 'User Not Found' });
        }
    } catch (error) {
        console.log(error);
    }
});

Router.post('/updateProfile', userAuth, async (req, res) => {
    try {
        let user = await User.findById(req.user);
        if (user) {
            user.username = req.body.username;
            await user.save();
            res.status(200).json({ msg: 'Updated Successfully' });
        } else {
            res.status(404).json({ msg: 'User Not Found' });
        }
    } catch (error) {
        console.log(error);
    }
});

Router.get('/getUserWithMatches', async (req, res) => {
    try {
        let user = await User.findById(req.query.userId);
        if (user) {
            // find all the matches of given user.
            const games = await Game.find({
                $and: [{ $or: [{ whitePlayer: user._id }, { blackPlayer: user._id }] }, { bothPlayerJoined: true }],
            })
                .select({ whitePlayer: 1, blackPlayer: 1, createdAt: 1, winner: 1 })
                .sort({ createdAt: 1 })
                .populate('whitePlayer', 'username')
                .populate('blackPlayer', 'username')
                .exec();

            res.status(200).json({
                username: user.username,
                rating: user.rating,
                matches: games,
            });
        } else {
            res.status(404).json({ msg: 'User Not Found' });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'server error' });
    }
});

module.exports = Router;
