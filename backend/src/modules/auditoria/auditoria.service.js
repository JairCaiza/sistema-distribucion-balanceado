const pool = require("../../config/db");

const registrarAuditoria = async (
    usuarioId,
    accion,
    tablaAfectada,
    registroId
) => {
    await pool.query(
        `INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id)
     VALUES ($1, $2, $3, $4)`,
        [usuarioId, accion, tablaAfectada, registroId]
    );
};

module.exports = {
    registrarAuditoria
};