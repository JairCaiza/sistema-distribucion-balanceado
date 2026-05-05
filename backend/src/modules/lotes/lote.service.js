const pool = require('../../config/db');

const createLote = async (data) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const {
            producto_id,
            codigo_lote,
            cantidad_inicial,
            costo_unitario,
            fecha_ingreso
        } = data;

        // Verificar producto
        const producto = await client.query(
            'SELECT id FROM productos WHERE id = $1',
            [producto_id]
        );

        if (producto.rows.length === 0) {
            throw new Error('El producto no existe');
        }

        // Crear lote
        const loteResult = await client.query(
            `INSERT INTO lotes
       (producto_id, codigo_lote, cantidad_inicial, cantidad_actual, costo_unitario, fecha_ingreso)
       VALUES ($1, $2, $3, $3, $4, $5)
       RETURNING *`,
            [producto_id, codigo_lote, cantidad_inicial, costo_unitario, fecha_ingreso]
        );

        const lote = loteResult.rows[0];

        // Crear movimiento ENTRADA
        await client.query(
            `INSERT INTO movimientos_inventario
       (producto_id, lote_id, tipo, cantidad, costo_unitario)
       VALUES ($1, $2, 'ENTRADA', $3, $4)`,
            [producto_id, lote.id, cantidad_inicial, costo_unitario]
        );

        await client.query('COMMIT');

        return lote;

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};
const registrarSalida = async ({ producto_id, lote_id, cantidad }) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Buscar lote
        const loteResult = await client.query(
            `SELECT * FROM lotes 
       WHERE id = $1 AND producto_id = $2`,
            [lote_id, producto_id]
        );

        if (loteResult.rows.length === 0) {
            throw new Error('Lote no encontrado');
        }

        const lote = loteResult.rows[0];

        // Validar stock
        if (parseFloat(lote.cantidad_actual) < cantidad) {
            throw new Error('Stock insuficiente');
        }

        // Descontar del lote
        await client.query(
            `UPDATE lotes
       SET cantidad_actual = cantidad_actual - $1
       WHERE id = $2`,
            [cantidad, lote_id]
        );

        // Registrar movimiento
        await client.query(
            `INSERT INTO movimientos_inventario
       (producto_id, lote_id, tipo, cantidad, costo_unitario, motivo)
       VALUES ($1, $2, 'SALIDA', $3, $4, 'VENTA')`,
            [producto_id, lote_id, cantidad, lote.costo_unitario]
        );

        await client.query('COMMIT');

        return { message: 'Salida registrada correctamente' };

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    createLote,
    registrarSalida
};

