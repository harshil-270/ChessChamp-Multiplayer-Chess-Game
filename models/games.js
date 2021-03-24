const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
    fen: {
        type: String,
        required: true,
    },
    whitePlayer: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    blackPlayer: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    bothPlayerJoined: {
        type: Boolean,
        default: false,
    },
    moves: [{from: String, to: String}],
    winner: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
});

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;
