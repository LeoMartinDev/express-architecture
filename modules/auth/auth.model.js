const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const { AUTH_STATUS, GROUPS, AUTH_MODEL } = require('./auth.constants');

const Schema = new mongoose.Schema({
    login: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: AUTH_STATUS.EMAIL_CONFIRMATION,
        enum: Object.values(AUTH_STATUS),
    },
    activationToken: {
        type: String,
    },
    activationTokenExpiry: {
        type: Date,
    },
    refreshToken: {
        type: String,
        unique: true,
    },
    refreshTokenExpiry: {
        type: Date,
    },
    group: {
        type: String,
        default: GROUPS.USER,
        enum: Object.values(GROUPS),
    },
}, {
        timestamps: true,
    });

Schema.plugin(uniqueValidator);

module.exports = mongoose.model(AUTH_MODEL, Schema);