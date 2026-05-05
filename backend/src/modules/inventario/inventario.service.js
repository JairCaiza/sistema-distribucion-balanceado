const pool = require('../../config/db');

const getInventarioGeneral = async () => {
    const result = await pool.query(`
    SELECT 
        p.id,
        p.nombre,
        COALESCE(SUM(l.cantidad_actual), 0) AS stock_total,
        COALESCE(SUM(l.cantidad_actual * l.costo_unitario), 0) AS valor_total
    FROM productos p
    LEFT JOIN lotes l ON l.producto_id = p.id
    GROUP BY p.id, p.nombre
    ORDER BY p.nombre
  `);

    return result.rows;
};
const getKardexByProducto = async (productoId) => {
    const result = await pool.query(`
    SELECT 
        m.id,
        m.fecha,
        m.tipo,
        m.motivo,
        m.cantidad,
        m.costo_unitario,
        l.codigo_lote,
        SUM(
            CASE 
                WHEN m.tipo = 'ENTRADA' THEN m.cantidad
                WHEN m.tipo = 'SALIDA' THEN -m.cantidad
            END
        ) OVER (ORDER BY m.fecha ASC) AS saldo_acumulado
    FROM movimientos_inventario m
    LEFT JOIN lotes l ON l.id = m.lote_id
    WHERE m.producto_id = $1
    ORDER BY m.fecha ASC
  `, [productoId]);

    return result.rows;
};

module.exports = {
    getInventarioGeneral, getKardexByProducto
};