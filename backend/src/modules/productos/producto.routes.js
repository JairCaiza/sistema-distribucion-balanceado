const express = require('express');
const router = express.Router();

const { createProducto } = require('./producto.controller');

const verifyToken = require('../../middlewares/auth.middleware');
const authorizeRoles = require('../../middlewares/role.middleware');

router.post(
    '/',
    verifyToken,
    authorizeRoles('Administrador', 'Bodega'),
    createProducto
);

module.exports = router;