const { productoSchema } = require('./producto.schema');
const productoService = require('./producto.service');
const { registrarAuditoria } = require('../auditoria/auditoria.service');

const createProducto = async (req, res) => {
    try {
        const { error } = productoSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const producto = await productoService.createProducto(req.body);

        // Auditoría
        await registrarAuditoria(
            req.user.id,
            'CREAR',
            'productos',
            producto.id
        );

        res.status(201).json({
            success: true,
            producto
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = { createProducto };