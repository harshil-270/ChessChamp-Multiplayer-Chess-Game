const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 5,
        },
        confirmed: {
            type: Boolean,
            default: false,
        },
        rating: {
            type: Number,
            default: 1000,
        },
        resetToken: {
            type: String,
        },
        expiryTime: {
            type: Number,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
