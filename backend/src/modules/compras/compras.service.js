const pool = require('../../config/db');

const createCompra = async (data) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { proveedor_id, fecha, numero_factura, forma_pago, productos } = data;

        // Validación básica
        if (!proveedor_id || !fecha || !forma_pago || !productos || productos.length === 0) {
            throw new Error('Datos de compra incompletos');
        }

        // Crear compra con total inicial en 0
        const compraResult = await client.query(
            `INSERT INTO compras 
             (proveedor_id, fecha, numero_factura, forma_pago, total)
             VALUES ($1, $2, $3, $4, 0)
             RETURNING *`,
            [proveedor_id, fecha, numero_factura, forma_pago]
        );

        const compra = compraResult.rows[0];
        let totalCompra = 0;

        for (const item of productos) {

            const cantidad = Number(item.cantidad);
            const costoUnitario = Number(item.costo_unitario);

            if (!item.producto_id || isNaN(cantidad) || isNaN(costoUnitario)) {
                throw new Error('Producto con datos inválidos');
            }

            const subtotal = cantidad * costoUnitario;
            totalCompra += subtotal;

            // Insertar detalle_compra
            await client.query(
                `INSERT INTO detalle_compras
                 (compra_id, producto_id, cantidad, costo_unitario, subtotal)
                 VALUES ($1, $2, $3, $4, $5)`,
                [compra.id, item.producto_id, cantidad, costoUnitario, subtotal]
            );

            // Generar código de lote
            const codigoLote = `LOT-${compra.id}-${item.producto_id}-${Date.now()}`;

            // Crear lote
            const loteResult = await client.query(
                `INSERT INTO lotes
                 (producto_id, compra_id, codigo_lote, cantidad_inicial, cantidad_actual, costo_unitario, fecha_ingreso, estado, tipo_origen)
                 VALUES ($1, $2, $3, $4, $4, $5, $6, 'DISPONIBLE', 'COMPRA')
                 RETURNING *`,
                [
                    item.producto_id,
                    compra.id,
                    codigoLote,
                    cantidad,
                    costoUnitario,
                    fecha
                ]
            );

            const lote = loteResult.rows[0];

            // Registrar movimiento de inventario (CON costo_unitario)
            await client.query(
                `INSERT INTO movimientos_inventario
   (producto_id, lote_id, tipo, cantidad, costo_unitario, fecha, modulo_origen, motivo)
   VALUES ($1, $2, 'ENTRADA', $3, $4, NOW(), 'COMPRA', 'Ingreso por compra')`,
                [item.producto_id, lote.id, cantidad, costoUnitario]
            );
        }

        // Actualizar total de la compra
        await client.query(
            `UPDATE compras SET total = $1 WHERE id = $2`,
            [totalCompra, compra.id]
        );

        // Si es crédito → crear cuenta por pagar
        if (forma_pago === 'CREDITO') {
            await client.query(
                `INSERT INTO cuentas_por_pagar
                 (compra_id, monto_total, saldo_pendiente)
                 VALUES ($1, $2, $2)`,
                [compra.id, totalCompra]
            );
        }

        // 🔥 Traer compra actualizada con total correcto
        const compraActualizada = await client.query(
            `SELECT * FROM compras WHERE id = $1`,
            [compra.id]
        );

        await client.query('COMMIT');

        // 🔥 RETORNAMOS LA COMPRA ACTUALIZADA
        return compraActualizada.rows[0];

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};
// Obtener todas las compras
const getCompras = async () => {
    const result = await pool.query(`
        SELECT 
            c.id,
            c.fecha,
            c.numero_factura,
            c.total,
            p.nombre AS proveedor
        FROM compras c
        JOIN proveedores p ON p.id = c.proveedor_id
        ORDER BY c.fecha DESC
    `);

    return result.rows;
};
// Obtener compra por ID con detalles
const getCompraById = async (id) => {

    const compraResult = await pool.query(`
        SELECT 
            c.id,
            c.fecha,
            c.numero_factura,
            c.total,
            c.forma_pago,
            p.nombre AS proveedor
        FROM compras c
        JOIN proveedores p ON p.id = c.proveedor_id
        WHERE c.id = $1
    `, [id]);

    if (compraResult.rows.length === 0) {
        return null;
    }

    const detalleResult = await pool.query(`
        SELECT 
            dc.producto_id,
            pr.nombre AS producto,
            dc.cantidad,
            dc.costo_unitario,
            dc.subtotal
        FROM detalle_compras dc
        JOIN productos pr ON pr.id = dc.producto_id
        WHERE dc.compra_id = $1
    `, [id]);

    return {
        ...compraResult.rows[0],
        detalles: detalleResult.rows
    };
};
module.exports = {
    createCompra,
    getCompras,
    getCompraById
};