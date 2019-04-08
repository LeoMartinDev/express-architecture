const express = require('express');
const Router = express.Router();
const DTOMiddleware = require('../../shared/dto.middleware');

function login(request, response, next) {
  return response.send('ok')
}

function register(request, response, next) {

}



/*   .post(DTOMiddleware(registerDTO), register)
  .post(DTOMiddleware(loginDTO), login); */

module.exports = {
  login,
  register,
};