const Joi = require("joi");

const createUserSchema = Joi.object({
    nombre: Joi.string().min(3).max(50).required(),
    apellido: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    rol_id: Joi.number().integer().required()
});

module.exports = {
    createUserSchema
};