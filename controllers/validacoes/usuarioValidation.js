const BaseJoi = require('joi');
const Extensions = require('joi-date-extensions');

const Joi = BaseJoi.extend(Extensions);

const UsuarioValidation = {
  login: {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }
  }
};

module.exports = {
  UsuarioValidation
};
