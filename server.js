const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');
require('dotenv').config();

const app = express();

const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: 'http://localhost:3000',
        credentials: true,
    },
});

io.on('connection', (socket) => {
    socket.on('join', ({ gameId }) => {
        socket.join(gameId);
        io.to(gameId).emit('userJoined');
    });
    socket.on('postMove', (data) => {
        io.to(data.gameId).emit('receiveMove', data);
    });
});

app.use(express.json());
app.use(cors());

// setting the routers
const gameRouter = require('./routes/gameRouter');
const userRouter = require('./routes/userRouter');
app.use('/g', gameRouter);
app.use('/u', userRouter);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

// connect to mongodb database
mongoose.connect(
    process.env.MONGO_URI,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
    (err) => {
        if (err) throw err;
        console.log('MongoDB is connected');
    }
);

const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Server is up and running at port: ${port}`);
});
