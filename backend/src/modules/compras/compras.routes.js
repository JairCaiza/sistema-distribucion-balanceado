const express = require('express');
const router = express.Router();
const comprasController = require('./compras.controller');

router.post('/', comprasController.createCompra);
router.get('/', comprasController.getCompras);
router.get('/:id', comprasController.getCompraById);

module.exports = router;