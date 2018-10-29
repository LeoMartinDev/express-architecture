const { PRODUCT_MODEL } = require('./product.constants');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
   name: {
     type: String,
     required: true,
   },
   price: {
     type: Number,
     required: true,
   },
}, {
  timestamps: true,
});

module.exports = mongoose.model(PRODUCT_MODEL, schema);