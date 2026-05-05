const { createLoteSchema } = require('./lote.schema');
const loteService = require('./lote.service');

const createLote = async (req, res) => {
    try {
        // Validar
        const { error } = createLoteSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.message });
        }

        const lote = await loteService.createLote(req.body);

        res.status(201).json({
            message: 'Lote creado correctamente',
            data: lote
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const registrarSalida = async (req, res) => {
    try {
        const result = await loteService.registrarSalida(req.body);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createLote, registrarSalida
};