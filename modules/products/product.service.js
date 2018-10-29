const mongoose = require('mongoose');

const { PRODUCT_MODEL } = require('./product.constants');
const ProductModel = mongoose.model(PRODUCT_MODEL);

function create({ name, price }) {
  return ProductModel.create({ name, price });
}

function getAll() {
  return ProductModel.find();
}

module.exports = {
  create,
  getAll,
};