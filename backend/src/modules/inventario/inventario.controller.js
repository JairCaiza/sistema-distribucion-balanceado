const inventarioService = require('./inventario.service');

const getInventarioGeneral = async (req, res) => {
    try {
        const inventario = await inventarioService.getInventarioGeneral();
        res.json(inventario);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getKardexByProducto = async (req, res) => {
    try {
        const { producto_id } = req.params;

        const data = await inventarioService.getKardexByProducto(producto_id);

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getInventarioGeneral, getKardexByProducto
};