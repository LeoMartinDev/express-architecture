// see: https://github.com/hapijs/joi
const Joi = require('joi');

module.exports = {
  email: Joi.string().email().required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
};