-- Crear base de datos
CREATE DATABASE IF NOT EXISTS autolote_db;
USE autolote_db;

-- Eliminar tablas si existen (para empezar limpio)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS Venta;
DROP TABLE IF EXISTS PruebaManejo;
DROP TABLE IF EXISTS Consulta;
DROP TABLE IF EXISTS Vehiculo;
DROP TABLE IF EXISTS Cliente;
DROP TABLE IF EXISTS Usuario;
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- TABLA: Usuario
-- =============================================
CREATE TABLE Usuario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'vendedor', 'cliente') DEFAULT 'cliente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: Vehiculo
-- =============================================
CREATE TABLE Vehiculo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    año INT NOT NULL,
    precio_usd DECIMAL(10,2) NOT NULL,
    estado ENUM('disponible', 'vendido', 'reservado') DEFAULT 'disponible',
    imagenes TEXT,
    descripcion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: Cliente
-- =============================================
CREATE TABLE Cliente (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: Consulta
-- =============================================
CREATE TABLE Consulta (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    vehiculo_id INT,
    mensaje TEXT NOT NULL,
    fecha_consulta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES Cliente(id) ON DELETE CASCADE,
    FOREIGN KEY (vehiculo_id) REFERENCES Vehiculo(id) ON DELETE SET NULL
);

-- =============================================
-- TABLA: PruebaManejo
-- =============================================
CREATE TABLE PruebaManejo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    vehiculo_id INT NOT NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_programada DATETIME,
    estado ENUM('pendiente', 'confirmada', 'realizada', 'cancelada') DEFAULT 'pendiente',
    FOREIGN KEY (cliente_id) REFERENCES Cliente(id),
    FOREIGN KEY (vehiculo_id) REFERENCES Vehiculo(id)
);

-- =============================================
-- TABLA: Venta
-- =============================================
CREATE TABLE Venta (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehiculo_id INT NOT NULL,
    cliente_id INT NOT NULL,
    vendedor_id INT NOT NULL,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    precio_total_usd DECIMAL(10,2) NOT NULL,
    precio_total_hnl DECIMAL(10,2) NOT NULL,
    impuestos_usd DECIMAL(10,2) NOT NULL,
    impuestos_hnl DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (vehiculo_id) REFERENCES Vehiculo(id),
    FOREIGN KEY (cliente_id) REFERENCES Cliente(id),
    FOREIGN KEY (vendedor_id) REFERENCES Usuario(id)
);

-- =============================================
-- DATOS DE PRUEBA
-- =============================================

-- Usuarios de prueba
INSERT INTO Usuario (nombre, apellido, email, password, rol) VALUES
('Admin', 'Sistema', 'admin@autolote.com', '$2b$10$X8z9X8z9X8z9X8z9X8z9X8z9X8z9X8z9X8z9X8z9', 'admin'),
('Juan', 'Perez', 'juan@autolote.com', '$2b$10$X8z9X8z9X8z9X8z9X8z9X8z9X8z9X8z9X8z9X8z9', 'vendedor'),
('Maria', 'Lopez', 'maria@autolote.com', '$2b$10$X8z9X8z9X8z9X8z9X8z9X8z9X8z9X8z9X8z9X8z9', 'vendedor');

-- Vehículos de prueba
INSERT INTO Vehiculo (marca, modelo, año, precio_usd, estado, descripcion) VALUES
('Toyota', 'Hilux', 2023, 35000.00, 'disponible', 'Pickup 4x4 doble cabina, color blanco'),
('Honda', 'Civic', 2022, 22000.00, 'disponible', 'Sedán 4 puertas, color negro, transmisión automática'),
('Mazda', 'CX-5', 2023, 28000.00, 'disponible', 'SUV, color gris, 20,000 km'),
('Nissan', 'Sentra', 2022, 18000.00, 'disponible', 'Sedán, color azul, un dueño'),
('Ford', 'Ranger', 2023, 32000.00, 'disponible', 'Pickup, color rojo, 4x4'),
('Kia', 'Sportage', 2022, 24000.00, 'disponible', 'SUV, color plata');

-- Clientes de prueba
INSERT INTO Cliente (nombre, apellido, email, telefono, direccion) VALUES
('Carlos', 'Martínez', 'carlos@email.com', '9999-9999', 'Colonia Palmira, Tegucigalpa'),
('Ana', 'García', 'ana@email.com', '8888-8888', 'Barrio Guadalupe, San Pedro Sula'),
('Roberto', 'Hernández', 'roberto@email.com', '7777-7777', 'Residencial Los Pinos, Comayagua'),
('Laura', 'Fernández', 'laura@email.com', '6666-6666', 'Colonia Moderna, La Ceiba');

-- Consultas de prueba
INSERT INTO Consulta (cliente_id, vehiculo_id, mensaje) VALUES
(1, 1, '¿El vehículo tiene garantía? ¿Cuántos kilómetros tiene?'),
(2, 3, '¿Aceptan financiamiento? ¿Cuál es la tasa de interés?'),
(3, 2, '¿Puedo ver el vehículo este sábado?'),
(4, 5, '¿El precio incluye impuestos?');

-- Pruebas de manejo
INSERT INTO PruebaManejo (cliente_id, vehiculo_id, fecha_programada, estado) VALUES
(1, 1, '2024-03-25 10:00:00', 'confirmada'),
(2, 3, '2024-03-26 14:30:00', 'pendiente'),
(3, 2, '2024-03-27 09:00:00', 'pendiente');

-- Ventas de prueba
INSERT INTO Venta (vehiculo_id, cliente_id, vendedor_id, precio_total_usd, precio_total_hnl, impuestos_usd, impuestos_hnl) VALUES
(4, 3, 2, 18000.00, 445500.00, 2700.00, 66825.00),
(2, 1, 3, 22000.00, 544500.00, 3300.00, 81675.00);

-- Mensaje de confirmación
SELECT '✅ Base de datos creada exitosamente!' as Mensaje;
SELECT '📊 Tablas creadas:' as Info;
SHOW TABLES;
SELECT '📈 Registros insertados:' as Info;
SELECT COUNT(*) as Total_Usuarios FROM Usuario;
SELECT COUNT(*) as Total_Vehiculos FROM Vehiculo;
SELECT COUNT(*) as Total_Clientes FROM Cliente;
SELECT COUNT(*) as Total_Ventas FROM Venta;