const pool = require("../config/db");

const authorizeRole = (roleName) => {
    return async (req, res, next) => {
        try {
            const result = await pool.query(
                "SELECT nombre FROM roles WHERE id = $1",
                [req.user.rol_id]
            );

            if (result.rows.length === 0) {
                return res.status(403).json({ message: "Rol no válido" });
            }

            if (result.rows[0].nombre !== roleName) {
                return res.status(403).json({ message: "Acceso denegado" });
            }

            next();
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
};

module.exports = authorizeRole;