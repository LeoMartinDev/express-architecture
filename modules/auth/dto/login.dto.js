const Joi = require('joi');
const { GRANT_TYPES } = require('../auth.constants');

module.exports = {
  grantType: Joi.string().valid(Object.values(GRANT_TYPES)).required(),
  login: Joi.string().when('grantType', { is: GRANT_TYPES.PASSWORD, then: Joi.string().email().required() }),
  password: Joi.string().when('grantType', { is: GRANT_TYPES.PASSWORD, then: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required() }),
  refreshToken: Joi.string().when('grantType', { is: GRANT_TYPES.REFRESH_TOKEN, then: Joi.string().required() }),
};