const express = require('express');
const cors = require('cors');

const errorHandler = require('./middlewares/error.middleware');
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/users.routes');
const productoRoutes = require('./modules/productos/producto.routes');
const loteRoutes = require('./modules/lotes/lote.routes');
const inventarioRoutes = require('./modules/inventario/inventario.routes');
const proveedoresRoutes = require('./modules/proveedores/proveedores.routes');
const comprasRoutes = require('./modules/compras/compras.routes');
const produccionRoutes = require("./modules/produccion/produccion.routes");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   RUTAS
========================= */

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/productos', productoRoutes);
app.use('/api/lotes', loteRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/compras', comprasRoutes);
app.use("/api/produccion", produccionRoutes);

/* =========================
   MIDDLEWARE DE ERRORES
========================= */

app.use(errorHandler);

module.exports = app;