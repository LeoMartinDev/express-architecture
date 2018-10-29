const Joi = require('joi');

module.exports = (schema) => {
  return function (request, response, next) {
    // validate request.body payload against provided schema
    Joi.validate(request.body, schema, error => {
      // if validation fails, we send a Bad Request Error
      if (error) return response.status(400).send(error);
      // else we continue
      return next();
    });
  };
};