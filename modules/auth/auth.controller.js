const express = require('express');
const Router = express.Router();
const DTOMiddleware = require('../../shared/dto.middleware');
const mongoose = require('mongoose');
const { USER_MODEL } = require('../users/users.constants.js');
const { GRANT_TYPES } = require('./auth.constants');
const userModel = mongoose.model(USER_MODEL);
const authService = require('./auth.service');

const GRANT_METHOD = {
  [GRANT_TYPES.PASSWORD]: authService.passwordGrant,
  [GRANT_TYPES.REFRESH_TOKEN]: authService.refreshTokenGrant,
};

async function login(request, response, next) {
  const { grantType } = request.body;
  try {
    const userAuth = await GRANT_METHOD[grantType](request.body);
    const token = authService.createAccessToken(userAuth);
    let result = {
      ...token,
    };
    if (grantType !== GRANT_TYPES.REFRESH_TOKEN) {
      if (!userAuth._auth.refreshToken) {
        const refreshToken = await authService.createRefreshToken(userAuth);
  
        result = {
          ...result,
          ...refreshToken,
        };
      } else {
        result = {
          ...result,
          refreshToken: userAuth._auth.refreshToken,
          refreshTokenExpiry: userAuth._auth.refreshTokenExpiry,
        };
      }
    }
    return response.status(200).send(result);
  } catch (error) {
    console.log('error :: ', error);
    return response.status(401).send({ message: 'Forbidden!' });
  }
}

async function register(request, response, next) {
  const payload = request.body;
  const auth = await authService.createAuth(payload.email, payload.password);
  const user = await userModel.create({ ...payload, _auth: auth._id });

  return response.status(201).send(user);
}

function test(request, response, next) {
  return response.send({ message: 'ok' })
}


/*   .post(DTOMiddleware(registerDTO), register)
  .post(DTOMiddleware(loginDTO), login); */

module.exports = {
  login,
  register,
  test,
};