const pool = require('../../config/db');

const createProveedor = async (data) => {
    const { nombre, apellido, identificacion, telefono, direccion } = data;

    const result = await pool.query(
        `INSERT INTO proveedores 
     (nombre, apellido, identificacion, telefono, direccion)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
        [nombre, apellido, identificacion, telefono, direccion]
    );

    return result.rows[0];
};

const getProveedores = async () => {
    const result = await pool.query(
        `SELECT * FROM proveedores ORDER BY created_at DESC`
    );

    return result.rows;
};

module.exports = {
    createProveedor,
    getProveedores
};