const Joi = require('joi');

const createLoteSchema = Joi.object({
    producto_id: Joi.number().integer().required(),
    codigo_lote: Joi.string().max(50).required(),
    cantidad_inicial: Joi.number().positive().required(),
    costo_unitario: Joi.number().min(0).required(),
    fecha_ingreso: Joi.date().required()
});

module.exports = {
    createLoteSchema
};