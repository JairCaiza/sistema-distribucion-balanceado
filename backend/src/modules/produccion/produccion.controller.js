const service = require("./produccion.service");

const registrarProduccion = async (req, res, next) => {

    try {

        const usuario_id = req.user?.id || null;

        const result = await service.registrarTransformacion(
            req.body,
            usuario_id
        );

        res.status(201).json({
            message: "Producción registrada correctamente",
            data: result
        });

    } catch (error) {
        next(error);
    }

};

module.exports = {
    registrarProduccion
};