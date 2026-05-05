const db = require("../../config/db");

const registrarTransformacion = async (data, usuario_id) => {

    const client = await db.connect();

    try {

        await client.query("BEGIN");

        const {
            producto_origen_id,
            lote_origen_id,
            cantidad_procesada,
            merma,
            observaciones,
            resultados
        } = data;

        // 1️⃣ verificar stock disponible
        const lote = await client.query(
            `SELECT cantidad_actual
       FROM lotes
       WHERE id = $1`,
            [lote_origen_id]
        );

        if (lote.rows.length === 0) {
            throw new Error("Lote no existe");
        }

        if (lote.rows[0].cantidad_actual < cantidad_procesada) {
            throw new Error("Stock insuficiente en el lote");
        }

        // 2️⃣ registrar transformación
        const transformacion = await client.query(
            `
      INSERT INTO transformaciones
      (producto_origen_id,lote_origen_id,cantidad_procesada,merma,usuario_id,observaciones)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
            [
                producto_origen_id,
                lote_origen_id,
                cantidad_procesada,
                merma || 0,
                usuario_id,
                observaciones
            ]
        );

        const transformacion_id = transformacion.rows[0].id;

        // 3️⃣ descontar inventario
        await client.query(
            `
      UPDATE lotes
      SET cantidad_actual = cantidad_actual - $1
      WHERE id = $2
      `,
            [cantidad_procesada, lote_origen_id]
        );

        // 4️⃣ registrar salida en kardex
        await client.query(
            `
      INSERT INTO movimientos_inventario
      (producto_id,lote_id,tipo,cantidad,modulo_origen)
      VALUES ($1,$2,'SALIDA',$3,'TRANSFORMACION')
      `,
            [producto_origen_id, lote_origen_id, cantidad_procesada]
        );

        // 5️⃣ registrar productos generados
        for (const r of resultados) {

            const nuevoLote = await client.query(
                `
        INSERT INTO lotes
        (producto_id,codigo_lote,cantidad_inicial,cantidad_actual,costo_unitario,fecha_ingreso,tipo_origen)
        VALUES ($1,concat('PROD-',NOW()),$2,$2,0,CURRENT_DATE,'AJUSTE')
        RETURNING id
        `,
                [r.producto_id, r.cantidad]
            );

            const lote_resultado_id = nuevoLote.rows[0].id;

            await client.query(
                `
        INSERT INTO transformacion_resultados
        (transformacion_id,producto_resultado_id,lote_resultado_id,cantidad)
        VALUES ($1,$2,$3,$4)
        `,
                [
                    transformacion_id,
                    r.producto_id,
                    lote_resultado_id,
                    r.cantidad
                ]
            );

            // movimiento entrada inventario
            await client.query(
                `
        INSERT INTO movimientos_inventario
        (producto_id,lote_id,tipo,cantidad,modulo_origen)
        VALUES ($1,$2,'ENTRADA',$3,'TRANSFORMACION')
        `,
                [r.producto_id, lote_resultado_id, r.cantidad]
            );

        }

        await client.query("COMMIT");

        return transformacion.rows[0];

    } catch (error) {

        await client.query("ROLLBACK");
        throw error;

    } finally {

        client.release();

    }

};

module.exports = {
    registrarTransformacion
};