// see: https://github.com/hapijs/joi
const Joi = require('joi');

module.exports = {
  email: Joi.email().required(),
  password: Joi.password().required(),
  name: Joi.string().min(5).required(),
};