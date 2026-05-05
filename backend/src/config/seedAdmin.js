const bcrypt = require("bcrypt");
const pool = require("./db");

const seedAdmin = async () => {
    try {
        const roleResult = await pool.query(
            "SELECT id FROM roles WHERE nombre = $1",
            ["Administrador"]
        );

        if (roleResult.rows.length === 0) {
            console.log("⚠️ Rol Administrador no existe");
            return;
        }

        const roleId = roleResult.rows[0].id;

        const userResult = await pool.query(
            "SELECT id FROM usuarios WHERE email = $1",
            ["caizaj24@gmail.com"]
        );

        if (userResult.rows.length > 0) {
            console.log("✅ Administrador ya existe");
            return;
        }

        const hashedPassword = await bcrypt.hash("Admin123", 10);

        await pool.query(
            `INSERT INTO usuarios (nombre, apellido, email, password, rol_id)
       VALUES ($1, $2, $3, $4, $5)`,
            ["Jairo", "Caiza", "caizaj24@gmail.com", hashedPassword, roleId]
        );

        console.log("🔥 Administrador creado correctamente");
    } catch (error) {
        console.error("❌ Error creando admin:", error.message);
    }
};

module.exports = { seedAdmin };