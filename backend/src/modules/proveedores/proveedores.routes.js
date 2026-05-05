const express = require('express');
const router = express.Router();

const controller = require('./proveedores.controller');

router.post('/', controller.createProveedor);
router.get('/', controller.getProveedores);

module.exports = router;