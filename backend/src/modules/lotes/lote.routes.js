const express = require('express');
const router = express.Router();
const loteController = require('./lote.controller');

router.post('/', loteController.createLote);
router.post('/salida', loteController.registrarSalida);

module.exports = router;