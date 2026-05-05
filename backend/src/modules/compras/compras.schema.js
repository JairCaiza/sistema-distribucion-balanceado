const Joi = require('joi');

const detalleSchema = Joi.object({
    producto_id: Joi.number().integer().required(),
    cantidad: Joi.number().positive().required(),
    costo_unitario: Joi.number().positive().required()
});

const createCompraSchema = Joi.object({
    proveedor_id: Joi.number().integer().required(),
    fecha: Joi.date().required(),
    numero_factura: Joi.string().max(50).required(),
    forma_pago: Joi.string().valid('CONTADO', 'CREDITO').required(),
    productos: Joi.array().items(detalleSchema).min(1).required()
});

module.exports = {
    createCompraSchema
};