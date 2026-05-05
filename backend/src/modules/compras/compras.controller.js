const { createCompraSchema } = require('./compras.schema');
const comprasService = require('./compras.service');

const createCompra = async (req, res) => {
    try {
        const { error } = createCompraSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            });
        }

        const compra = await comprasService.createCompra(req.body);

        res.status(201).json({
            message: 'Compra registrada correctamente',
            data: compra
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};
const getCompras = async (req, res) => {
    try {
        const compras = await comprasService.getCompras();
        res.json(compras);
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const getCompraById = async (req, res) => {
    try {
        const compra = await comprasService.getCompraById(req.params.id);

        if (!compra) {
            return res.status(404).json({
                message: 'Compra no encontrada'
            });
        }

        res.json(compra);
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = {
    createCompra,
    getCompras,
    getCompraById
};