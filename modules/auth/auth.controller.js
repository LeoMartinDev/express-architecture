const express = require('express');
const Router = express.Router();
const DTOMiddleware = require('../../shared/dto.middleware');

function login(request, response, next) {

}

function register(request, response, next) {

}


Router
  .route('/auth')
/*   .post(DTOMiddleware(registerDTO), register)
  .post(DTOMiddleware(loginDTO), login); */

module.exports = Router;