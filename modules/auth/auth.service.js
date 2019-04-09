const bcrypt = require('bcrypt');
const { AUTH_MODEL, AUTH_STATUS } = require('./auth.constants');
const { USER_MODEL } = require('../users/users.constants');
const mongoose = require('mongoose');
const authModel = mongoose.model(AUTH_MODEL);
const jwt = require('jsonwebtoken');
const userModel = mongoose.model(USER_MODEL);
const { promisify } = require('util');
const crypto = require('crypto');
const config = require('../../config');

const SALT_ROUNDS = 10;

function createRandomToken(size) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(size, (error, buffer) => {
      if (error) return reject(error);
      return resolve(buffer.toString('hex'));
    })
  });
}

function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

async function createRefreshToken(userAuth) {
  const token = await createRandomToken(48);
  const now = new Date();
  // 30 days
  const refreshTokenExpiry = now.setDate(now.getDate() + 30);

  userAuth._auth.refreshToken = token;
  userAuth._auth.refreshTokenExpiry = refreshTokenExpiry;
  await userAuth._auth.save();
  return {
    refreshToken: token,
    refreshTokenExpiry,
  };
}

function createAccessToken(userAuth) {
  const expiresIn = 60 * 60 * 1000, secretOrKey = config.secretKey;

  const token = jwt.sign({
    _id: userAuth._id,
    login: userAuth._auth.login,
    authId: userAuth._auth._id,
    role: userAuth.role,
  }, secretOrKey, { expiresIn });

  return {
    accessTokenExpiry: expiresIn,
    accessToken: token,
  };
}

async function checkAccessToken(token) {
  const secretOrKey = config.secretKey;
  const payload = await (promisify(jwt.verify))(token, secretOrKey);

  return payload;
}

async function createAuth(login, password) {
  let hash = await hashPassword(password);

  return authModel.create({ login, password: hash, status: AUTH_STATUS.ACTIVE });
}

async function passwordGrant({ email, password }) {
  const userAuth = await userModel.findOne({ '_auth.login': email }).populate('_auth');

  if (!userAuth) throw new Error('User does not exist!');
  if (!await comparePassword(password, userAuth._auth.password)) {
    throw new Error('Password does not match!');
  }
  return userAuth;
}

async function refreshTokenGrant({ refreshToken }) {
  const auth = await authModel.findOne({ 'refreshToken': refreshToken });
  if (!auth) throw new Error('Invalid refresh token!');
  const userAuth = await userModel.findOne({ email: auth.login }).populate('_auth');
  if (!userAuth) throw new Error('Invalid refresh token!');
  if (new Date() > userAuth._auth.refreshTokenExpiry) {
    throw new Error('Refresh token expired!');
  }
  return userAuth;
}

module.exports = {
  hashPassword,
  comparePassword,
  createAuth,
  passwordGrant,
  refreshTokenGrant,
  createAccessToken,
  createRefreshToken,
  checkAccessToken,
};