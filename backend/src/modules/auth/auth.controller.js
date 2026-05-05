const bcrypt = require("bcrypt");
const pool = require("../../config/db");
const generateToken = require("../../utils/generateToken");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            "SELECT * FROM usuarios WHERE email = $1 AND activo = true",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }

        const user = result.rows[0];

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }

        const token = generateToken(user);

        res.json({
            success: true,
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { login };