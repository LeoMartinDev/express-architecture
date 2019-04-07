const mongoose = require('mongoose');
const config = require('../config');

module.exports = next => {
  mongoose.connect('mongodb://localhost/auth', { useNewUrlParser: true }, next);
};