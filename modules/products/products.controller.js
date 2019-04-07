const express = require('express');
const Router = express.Router();
const DTOMiddleware = require('../../shared/dto.middleware');
const createProductDTO = require('./dto/create.dto');
const ProductService = require('./product.service');

async function getAllProducts(request, response, next) {
  try {
    const products = await ProductService.getAll();

    return response.status(200).send(products);
  } catch (error) {
    // TODO: define status code depending on error's type 
    // and implement a global error handler (as a middleware) so we can simply do
    // `return next(error)`
    return response.status(500).send(error);
  }
}

async function createProduct(request, response, next) {
  const {
    name,
    price
  } = request.body;

  try {
    const product = await ProductService.create({
      name,
      price
    });

    return response.status(201).send(product);
  } catch (error) {
    return response.status(500).send(error);
  }
}

Router
  .route('/products')
  .get(getAllProducts)
  .post(DTOMiddleware(createProductDTO), createProduct);

module.exports = Router;