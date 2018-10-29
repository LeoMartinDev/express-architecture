// see: https://github.com/hapijs/joi
const Joi = require('joi');

module.exports = {
  name: Joi.string().min(5),
  price: Joi.number(),
};