const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// =============================================
// CRUD DE CLIENTES
// =============================================

// GET /api/clientes - Listar todos
router.get('/', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM Cliente ORDER BY fecha_registro DESC');
        res.status(200).json({ 
            status: 200, 
            message: 'Lista de clientes', 
            data: results 
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error en la consulta SQL' });
    }
});

// GET /api/clientes/:id - Obtener un cliente
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const [results] = await db.query('SELECT * FROM Cliente WHERE id = ?', [id]);
        
        if (results.length === 0) {
            return res.status(404).json({ status: 404, message: 'Cliente no encontrado' });
        }
        
        res.status(200).json({ status: 200, message: 'Success', data: results[0] });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error en la consulta SQL' });
    }
});

// POST /api/clientes - Crear cliente
router.post('/', async (req, res) => {
    try {
        const { nombre, apellido, email, telefono, direccion } = req.body;

        if (!nombre || !apellido || !email) {
            return res.status(400).json({ 
                status: 400, 
                message: 'Nombre, apellido y email son obligatorios' 
            });
        }

        const sql = 'INSERT INTO Cliente (nombre, apellido, email, telefono, direccion) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(sql, [nombre, apellido, email, telefono || '', direccion || '']);

        res.status(201).json({ 
            status: 201, 
            message: 'Cliente registrado exitosamente',
            data: { id: result.insertId, ...req.body }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ status: 400, message: 'El email ya está registrado' });
        }
        res.status(500).json({ status: 500, message: 'Error en la consulta SQL' });
    }
});

// PUT /api/clientes/:id - Actualizar
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nombre, apellido, email, telefono, direccion } = req.body;

        const sql = 'UPDATE Cliente SET nombre = ?, apellido = ?, email = ?, telefono = ?, direccion = ? WHERE id = ?';
        const [result] = await db.query(sql, [nombre, apellido, email, telefono, direccion, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 404, message: 'Cliente no encontrado' });
        }

        res.status(200).json({ status: 200, message: 'Cliente actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error en la consulta SQL' });
    }
});

// DELETE /api/clientes/:id - Eliminar
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const [result] = await db.query('DELETE FROM Cliente WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 404, message: 'Cliente no encontrado' });
        }

        res.status(200).json({ status: 200, message: 'Cliente eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error en la consulta SQL' });
    }
});

// =============================================
// CONSULTAS DE CLIENTES
// =============================================

// POST /api/clientes/:clienteId/consultas - Registrar consulta
router.post('/:clienteId/consultas', async (req, res) => {
    try {
        const clienteId = parseInt(req.params.clienteId);
        const { vehiculoId, mensaje } = req.body;

        if (!mensaje) {
            return res.status(400).json({ status: 400, message: 'El mensaje es obligatorio' });
        }

        const sql = 'INSERT INTO Consulta (cliente_id, vehiculo_id, mensaje) VALUES (?, ?, ?)';
        const [result] = await db.query(sql, [clienteId, vehiculoId || null, mensaje]);

        res.status(201).json({ 
            status: 201, 
            message: 'Consulta registrada exitosamente',
            data: { id: result.insertId, fecha: new Date() }
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error en la consulta SQL' });
    }
});

// GET /api/clientes/:clienteId/consultas - Ver historial
router.get('/:clienteId/consultas', async (req, res) => {
    try {
        const clienteId = parseInt(req.params.clienteId);
        
        const sql = `SELECT c.*, v.marca, v.modelo, v.año 
                     FROM Consulta c
                     LEFT JOIN Vehiculo v ON c.vehiculo_id = v.id
                     WHERE c.cliente_id = ?
                     ORDER BY c.fecha_consulta DESC`;
        
        const [results] = await db.query(sql, [clienteId]);
        
        res.status(200).json({ 
            status: 200, 
            message: 'Historial de consultas',
            data: results 
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error en la consulta SQL' });
    }
});

// =============================================
// PRUEBAS DE MANEJO
// =============================================

// POST /api/clientes/:clienteId/pruebas - Solicitar prueba
router.post('/:clienteId/pruebas', async (req, res) => {
    try {
        const clienteId = parseInt(req.params.clienteId);
        const { vehiculoId, fecha_programada } = req.body;

        if (!vehiculoId || !fecha_programada) {
            return res.status(400).json({ 
                status: 400, 
                message: 'Vehículo y fecha programada son obligatorios' 
            });
        }

        const sql = 'INSERT INTO PruebaManejo (cliente_id, vehiculo_id, fecha_programada) VALUES (?, ?, ?)';
        const [result] = await db.query(sql, [clienteId, vehiculoId, fecha_programada]);

        res.status(201).json({ 
            status: 201, 
            message: 'Prueba de manejo solicitada exitosamente',
            data: { 
                id: result.insertId, 
                fecha_solicitud: new Date(),
                estado: 'pendiente'
            }
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error en la consulta SQL' });
    }
});

// GET /api/clientes/:clienteId/pruebas - Ver pruebas del cliente
router.get('/:clienteId/pruebas', async (req, res) => {
    try {
        const clienteId = parseInt(req.params.clienteId);
        
        const sql = `SELECT p.*, v.marca, v.modelo, v.año 
                     FROM PruebaManejo p
                     JOIN Vehiculo v ON p.vehiculo_id = v.id
                     WHERE p.cliente_id = ?
                     ORDER BY p.fecha_solicitud DESC`;
        
        const [results] = await db.query(sql, [clienteId]);
        
        res.status(200).json({ 
            status: 200, 
            message: 'Pruebas de manejo del cliente',
            data: results 
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error en la consulta SQL' });
    }
});

module.exports = router;