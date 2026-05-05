const Joi = require("joi");

const transformarSchema = Joi.object({

    producto_origen_id: Joi.number()
        .integer()
        .required(),

    lote_origen_id: Joi.number()
        .integer()
        .required(),

    cantidad_procesada: Joi.number()
        .positive()
        .required(),

    merma: Joi.number()
        .min(0)
        .optional(),

    observaciones: Joi.string()
        .allow(null, ""),

    resultados: Joi.array()
        .items(
            Joi.object({
                producto_id: Joi.number().integer().required(),
                cantidad: Joi.number().positive().required()
            })
        )
        .min(1)
        .required()

});

module.exports = {
    transformarSchema
};