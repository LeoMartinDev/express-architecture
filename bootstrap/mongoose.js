const mongoose = require('mongoose');
const config = require('../config');

module.exports = next => {
  mongoose.set('useFindAndModify', false);
  mongoose.connect('mongodb://localhost/e', { useNewUrlParser: true }, next);
};