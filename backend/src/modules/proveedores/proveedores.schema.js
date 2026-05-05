const Joi = require('joi');

const createProveedorSchema = Joi.object({
    nombre: Joi.string().min(2).max(100).required(),
    apellido: Joi.string().min(2).max(100).allow(null, ''),
    identificacion: Joi.string().max(20).allow(null, ''),
    telefono: Joi.string().max(20).allow(null, ''),
    direccion: Joi.string().max(150).allow(null, '')
});

module.exports = {
    createProveedorSchema
};