const proveedoresService = require('./proveedores.service');
const { createProveedorSchema } = require('./proveedores.schema');

/**
 * Crear proveedor
 */
const createProveedor = async (req, res) => {
    try {
        // Validación con Joi
        const { error } = createProveedorSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            });
        }

        // Crear proveedor
        const proveedor = await proveedoresService.createProveedor(req.body);

        return res.status(201).json(proveedor);

    } catch (error) {
        console.error('Error al crear proveedor:', error);
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Obtener lista de proveedores
 */
const getProveedores = async (req, res) => {
    try {
        const proveedores = await proveedoresService.getProveedores();
        return res.status(200).json(proveedores);

    } catch (error) {
        console.error('Error al obtener proveedores:', error);
        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

module.exports = {
    createProveedor,
    getProveedores
};