const express = require("express");
const router = express.Router();

const controller = require("./produccion.controller");

router.post(
    "/transformar",
    controller.registrarProduccion
);

module.exports = router;