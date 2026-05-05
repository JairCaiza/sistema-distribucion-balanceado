const bcrypt = require("bcrypt");
const pool = require("../../config/db");
const auditoriaService = require("../auditoria/auditoria.service");

const createUser = async (userData, usuarioAccionId) => {
    const { nombre, apellido, email, password, rol_id } = userData;

    const emailExists = await pool.query(
        "SELECT id FROM usuarios WHERE email = $1",
        [email]
    );

    if (emailExists.rows.length > 0) {
        throw new Error("El email ya está registrado");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `INSERT INTO usuarios (nombre, apellido, email, password, rol_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, nombre, apellido, email, rol_id`,
        [nombre, apellido, email, hashedPassword, rol_id]
    );

    // 🔐 Auditoría
    await auditoriaService.registrarAuditoria(
        usuarioAccionId,
        "CREAR",
        "usuarios",
        result.rows[0].id
    );

    return result.rows[0];
};

module.exports = {
    createUser
};