const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
const { USER_MODEL } = require('./users.constants');
const { AUTH_MODEL } = require('../auth/auth.constants');

const Schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  _auth: {
    type: mongoose.Schema.Types.ObjectId,
    ref: AUTH_MODEL,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

Schema.plugin(uniqueValidator);

module.exports = mongoose.model(USER_MODEL, Schema);