-- =========================================
-- SISTEMA INTEGRAL AGROINDUSTRIAL V2
-- OPTIMIZADO PARA PRODUCCIÓN
-- =========================================

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- =========================
-- ROLES
-- =========================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- USUARIOS
-- =========================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol_id INT NOT NULL REFERENCES roles(id),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email);

-- =========================
-- AUDITORIA
-- =========================
CREATE TABLE auditoria (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id),
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(100),
    registro_id INT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);

-- =========================
-- CATEGORIAS
-- =========================
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

-- =========================
-- PRODUCTOS
-- =========================
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    categoria_id INT REFERENCES categorias(id),
    tipo VARCHAR(50) CHECK (tipo IN ('Materia Prima','Producto Transformado','Balanceado')),
    unidad_medida VARCHAR(20) CHECK (unidad_medida IN ('qq','kg','tonelada')),
    stock_minimo NUMERIC(12,2) DEFAULT 0 CHECK (stock_minimo >= 0),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- LOTES
-- =========================
CREATE TABLE lotes (
    id SERIAL PRIMARY KEY,
    producto_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    codigo_lote VARCHAR(50) NOT NULL,
    cantidad_inicial NUMERIC(12,2) CHECK (cantidad_inicial >= 0),
    cantidad_actual NUMERIC(12,2) CHECK (cantidad_actual >= 0),
    costo_unitario NUMERIC(12,2) CHECK (costo_unitario >= 0),
    fecha_ingreso DATE NOT NULL,
    estado VARCHAR(50) DEFAULT 'DISPONIBLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lotes_producto ON lotes(producto_id);

-- =========================
-- PROVEEDORES
-- =========================
CREATE TABLE proveedores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(50),
    email VARCHAR(100),
    direccion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- CLIENTES
-- =========================
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(50),
    direccion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- INSERT ROLES BASE
-- =========================
INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Acceso total al sistema'),
('Producción', 'Gestión de producción'),
('Ventas', 'Gestión de ventas y clientes'),
('Repartidor', 'Gestión de entregas');



-- =========================================
-- FIN SCRIPT V2
-- =========================================
ALTER TABLE lotes 
ALTER COLUMN cantidad_inicial SET NOT NULL;

ALTER TABLE lotes 
ALTER COLUMN cantidad_actual SET NOT NULL;

ALTER TABLE lotes 
ALTER COLUMN costo_unitario SET NOT NULL;
ALTER TABLE lotes
DROP CONSTRAINT lotes_cantidad_inicial_check;

ALTER TABLE lotes
ADD CONSTRAINT lotes_cantidad_inicial_check
CHECK (cantidad_inicial > 0);

CREATE TABLE movimientos_inventario (
    id SERIAL PRIMARY KEY,
    producto_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    lote_id INT REFERENCES lotes(id) ON DELETE SET NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ENTRADA', 'SALIDA')),
    cantidad NUMERIC(12,2) NOT NULL CHECK (cantidad > 0),
    costo_unitario NUMERIC(12,2),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE movimientos_inventario
ADD COLUMN motivo VARCHAR(50);
UPDATE movimientos_inventario
SET motivo = 'COMPRA'
WHERE tipo = 'ENTRADA';


CREATE TABLE compras (
    id SERIAL PRIMARY KEY,
    proveedor_id INTEGER REFERENCES proveedores(id),
    fecha TIMESTAMP DEFAULT NOW(),
    total NUMERIC(12,2) NOT NULL,
    forma_pago VARCHAR(20) NOT NULL, -- CONTADO, TRANSFERENCIA, DEPOSITO, CREDITO
    estado VARCHAR(20) DEFAULT 'PENDIENTE', -- PENDIENTE, PAGADO
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE detalle_compras (
    id SERIAL PRIMARY KEY,
    compra_id INTEGER REFERENCES compras(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id),
    cantidad NUMERIC(12,2) NOT NULL,
    costo_unitario NUMERIC(12,4) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL
);

-- ==========================================================
-- INICIO TRANSACCION ESTRUCTURAL
-- ==========================================================
BEGIN;

-- ==========================================================
-- 1️⃣ CREAR ENUMS (SI NO EXISTEN)
-- ==========================================================

DO $$ BEGIN
    CREATE TYPE tipo_origen_enum AS ENUM (
        'COMPRA',
        'INVENTARIO_INICIAL',
        'AJUSTE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE modulo_origen_enum AS ENUM (
        'COMPRA',
        'VENTA',
        'TRANSFORMACION',
        'INVENTARIO_INICIAL',
        'AJUSTE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- ==========================================================
-- 2️⃣ MODIFICAR TABLA LOTES
-- ==========================================================

ALTER TABLE lotes
ADD COLUMN IF NOT EXISTS compra_id INTEGER;

ALTER TABLE lotes
ADD COLUMN IF NOT EXISTS tipo_origen tipo_origen_enum
NOT NULL DEFAULT 'COMPRA';

ALTER TABLE lotes
ADD COLUMN IF NOT EXISTS observacion TEXT;

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_lotes_producto_id
ON lotes(producto_id);

CREATE INDEX IF NOT EXISTS idx_lotes_compra_id
ON lotes(compra_id);

-- Llave foránea hacia compras (se agrega después de crear compras)


-- ==========================================================
-- 3️⃣ MODIFICAR TABLA MOVIMIENTOS_INVENTARIO
-- ==========================================================

ALTER TABLE movimientos_inventario
ADD COLUMN IF NOT EXISTS modulo_origen modulo_origen_enum;

CREATE INDEX IF NOT EXISTS idx_mov_producto
ON movimientos_inventario(producto_id);

CREATE INDEX IF NOT EXISTS idx_mov_lote
ON movimientos_inventario(lote_id);

CREATE INDEX IF NOT EXISTS idx_mov_fecha
ON movimientos_inventario(fecha);


-- ==========================================================
-- 4️⃣ CREAR TABLA COMPRAS
-- ==========================================================

CREATE TABLE IF NOT EXISTS compras (
    id SERIAL PRIMARY KEY,
    proveedor_id INTEGER NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    numero_factura VARCHAR(100),
    total NUMERIC(14,2) NOT NULL DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'REGISTRADA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_compras_proveedor
    FOREIGN KEY (proveedor_id)
    REFERENCES proveedores(id)
    ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_compras_proveedor
ON compras(proveedor_id);

CREATE INDEX IF NOT EXISTS idx_compras_fecha
ON compras(fecha);


-- ==========================================================
-- 5️⃣ CREAR TABLA DETALLE_COMPRAS
-- ==========================================================

CREATE TABLE IF NOT EXISTS detalle_compras (
    id SERIAL PRIMARY KEY,
    compra_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad NUMERIC(14,2) NOT NULL,
    precio_unitario NUMERIC(14,4) NOT NULL,
    subtotal NUMERIC(14,2) NOT NULL,

    CONSTRAINT fk_detalle_compra
    FOREIGN KEY (compra_id)
    REFERENCES compras(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_detalle_producto
    FOREIGN KEY (producto_id)
    REFERENCES productos(id)
    ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_detalle_compra_id
ON detalle_compras(compra_id);

CREATE INDEX IF NOT EXISTS idx_detalle_producto_id
ON detalle_compras(producto_id);


-- ==========================================================
-- 6️⃣ AGREGAR FOREIGN KEY LOTES → COMPRAS
-- ==========================================================

ALTER TABLE lotes
ADD CONSTRAINT fk_lotes_compra
FOREIGN KEY (compra_id)
REFERENCES compras(id)
ON DELETE SET NULL;

-- ==========================================================
-- FIN
-- ==========================================================
COMMIT;

ALTER TABLE compras
ADD COLUMN numero_factura VARCHAR(50),
ADD COLUMN forma_pago VARCHAR(30);
ALTER TABLE compras
ADD COLUMN fecha DATE NOT NULL DEFAULT CURRENT_DATE;
-- =========================
-- Nuevas tablas agregadas
-- =========================

-- =========================
-- DETALLE FORMULAS
-- =========================
CREATE TABLE formula_detalles (
    id SERIAL PRIMARY KEY,
    formula_id INT NOT NULL REFERENCES formulas(id) ON DELETE CASCADE,
    producto_id INT NOT NULL REFERENCES productos(id),
    porcentaje NUMERIC(8,4),
    cantidad NUMERIC(12,2)
);

CREATE INDEX idx_formula_detalle
ON formula_detalles(formula_id);

-- =========================
-- PRODUCCION
-- =========================
CREATE TABLE producciones (
    id SERIAL PRIMARY KEY,
    formula_id INT REFERENCES formulas(id),
    producto_resultado_id INT REFERENCES productos(id),
    cantidad_producida NUMERIC(12,2) NOT NULL,
    costo_total NUMERIC(14,2),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- DETALLE PRODUCCION
-- =========================
CREATE TABLE produccion_consumo (
    id SERIAL PRIMARY KEY,
    produccion_id INT REFERENCES producciones(id) ON DELETE CASCADE,
    producto_id INT REFERENCES productos(id),
    lote_id INT REFERENCES lotes(id),
    cantidad NUMERIC(12,2) NOT NULL
);

-- =========================
-- TRANSFORMACION
-- =========================
CREATE TABLE transformaciones (
    id SERIAL PRIMARY KEY,

    producto_origen_id INT NOT NULL
        REFERENCES productos(id),

    lote_origen_id INT NOT NULL
        REFERENCES lotes(id),

    cantidad_procesada NUMERIC(12,2) NOT NULL
        CHECK (cantidad_procesada > 0),

    merma NUMERIC(12,2) DEFAULT 0
        CHECK (merma >= 0),

    costo_produccion NUMERIC(14,2),

    usuario_id INT
        REFERENCES usuarios(id),

    observaciones TEXT,

    estado VARCHAR(20) DEFAULT 'COMPLETADA'
        CHECK (estado IN ('COMPLETADA','ANULADA')),

    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- RESULTADO TRANSFORMACION
-- =========================
CREATE TABLE transformacion_resultados (
    id SERIAL PRIMARY KEY,

    transformacion_id INT NOT NULL
        REFERENCES transformaciones(id)
        ON DELETE CASCADE,

    producto_resultado_id INT NOT NULL
        REFERENCES productos(id),

    lote_resultado_id INT
        REFERENCES lotes(id),

    cantidad NUMERIC(12,2) NOT NULL
        CHECK (cantidad > 0),

    costo_unitario NUMERIC(14,4),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- CAJA
-- =========================
CREATE TABLE cajas (
    id SERIAL PRIMARY KEY,
    fecha DATE DEFAULT CURRENT_DATE,
    saldo_inicial NUMERIC(14,2),
    saldo_final NUMERIC(14,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- MOVIMIENTOS CAJA
-- =========================
CREATE TABLE movimientos_caja (
    id SERIAL PRIMARY KEY,
    caja_id INT REFERENCES cajas(id),
    tipo VARCHAR(20) CHECK (tipo IN ('INGRESO','EGRESO')),
    monto NUMERIC(14,2) NOT NULL,
    descripcion TEXT,
    referencia_id INT,
    modulo_origen VARCHAR(50),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- =========================
-- CUENTAS POR COBRAR
-- =========================
CREATE TABLE cuentas_por_cobrar (
    id SERIAL PRIMARY KEY,
    venta_id INT REFERENCES ventas(id),
    cliente_id INT REFERENCES clientes(id),
    monto_total NUMERIC(14,2),
    monto_pagado NUMERIC(14,2) DEFAULT 0,
    saldo NUMERIC(14,2),
    estado VARCHAR(20) DEFAULT 'PENDIENTE'
);

-- =========================
-- CUENTAS POR PAGAR
-- =========================
CREATE TABLE cuentas_por_pagar (
    id SERIAL PRIMARY KEY,
    compra_id INT REFERENCES compras(id),
    proveedor_id INT REFERENCES proveedores(id),
    monto_total NUMERIC(14,2),
    monto_pagado NUMERIC(14,2) DEFAULT 0,
    saldo NUMERIC(14,2),
    estado VARCHAR(20) DEFAULT 'PENDIENTE'
);