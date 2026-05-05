const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")) {

            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const result = await pool.query(
                "SELECT id, rol_id FROM usuarios WHERE id = $1 AND activo = true",
                [decoded.id]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({ message: "Usuario no válido" });
            }

            req.user = result.rows[0];

            next();
        } else {
            return res.status(401).json({ message: "No autorizado" });
        }

    } catch (error) {
        return res.status(401).json({ message: "Token inválido" });
    }
};

module.exports = protect;