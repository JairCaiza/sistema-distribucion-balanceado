const pool = require('../../config/db');

const createProducto = async (data) => {
    const { nombre, categoria_id, unidad_medida } = data;

    const result = await pool.query(
        `INSERT INTO productos (nombre, categoria_id, unidad_medida)
     VALUES ($1, $2, $3)
     RETURNING *`,
        [nombre, categoria_id, unidad_medida]
    );

    return result.rows[0];
};

module.exports = { createProducto };