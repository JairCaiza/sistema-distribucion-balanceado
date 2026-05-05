const Joi = require('joi');

const productoSchema = Joi.object({
    nombre: Joi.string().min(3).required(),
    categoria_id: Joi.number().integer().required(),
    unidad_medida: Joi.string()
        .valid('qq', 'kg', 'tonelada')
        .required(),
    stock_minimo: Joi.number()
        .precision(2)
        .min(0)
        .optional()
});

module.exports = { productoSchema };