const express = require("express");
const router = express.Router();

const protect = require("../../middlewares/auth.middleware");
const authorizeRole = require("../../middlewares/role.middleware");
const userController = require("./users.controller");

router.post(
    "/",
    protect,
    authorizeRole("Administrador"),
    userController.createUser
);

module.exports = router;