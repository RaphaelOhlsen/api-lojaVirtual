const Joi = require('joi');

const AvaliacaoValidation = {
  index: {
    query: {
      loja: Joi.string().alphanum().length(24).required(),
      produto: Joi.string().alphanum().length(24).required()
    }
  },
  show: {
    query: {
      loja: Joi.string().alphanum().length(24).required(),
      produto: Joi.string().alphanum().length(24).required()
    },
    params: {
      id: Joi.string().alphanum().length(24).required(),
    }
  },
  store: {
    body: {
      nome: Joi.string().required(),
      texto: Joi.string().required(),
      pontuacao: Joi.number().min(1).max(5).required(),
    },
    query: {
      loja: Joi.string().alphanum().length(24).required(),
      produto: Joi.string().alphanum().length(24).required()
    },
  },
  remove: {
    params: {
      id: Joi.string().alphanum().length(24).required(),
    }
  }
};

module.exports = { AvaliacaoValidation };
