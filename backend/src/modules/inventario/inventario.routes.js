const express = require('express');
const router = express.Router();
const inventarioController = require('./inventario.controller');

router.get('/', inventarioController.getInventarioGeneral);
// Kardex por producto
router.get('/kardex/:producto_id', inventarioController.getKardexByProducto);

module.exports = router;