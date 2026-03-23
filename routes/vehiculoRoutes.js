const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/vehiculos - Listar todos con filtros
router.get('/', async (req, res) => {
    try {
        let sql = 'SELECT * FROM Vehiculo WHERE 1=1';
        const params = [];

        if (req.query.marca) {
            sql += ' AND marca LIKE ?';
            params.push(`%${req.query.marca}%`);
        }
        if (req.query.modelo) {
            sql += ' AND modelo LIKE ?';
            params.push(`%${req.query.modelo}%`);
        }
        if (req.query.precio_max) {
            sql += ' AND precio_usd <= ?';
            params.push(req.query.precio_max);
        }
        if (req.query.estado) {
            sql += ' AND estado = ?';
            params.push(req.query.estado);
        }

        const [results] = await db.query(sql, params);
        res.status(200).json({ 
            status: 200, 
            message: 'Lista de vehículos', 
            data: results 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Error en la consulta SQL' });
    }
});

// GET /api/vehiculos/:id - Obtener un vehículo
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const [results] = await db.query('SELECT * FROM Vehiculo WHERE id = ?', [id]);
        
        if (results.length === 0) {
            return res.status(404).json({ status: 404, message: 'Vehículo no encontrado' });
        }
        
        res.status(200).json({ status: 200, message: 'Success', data: results[0] });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error en la consulta SQL' });
    }
});

// POST /api/vehiculos - Crear vehículo
router.post('/', async (req, res) => {
    try {
        const { marca, modelo, año, precio_usd, estado, imagenes, descripcion } = req.body;

        if (!marca || !modelo || !año || !precio_usd) {
            return res.status(400).json({ 
                status: 400, 
                message: 'Marca, modelo, año y precio son obligatorios' 
            });
        }

        const sql = 'INSERT INTO Vehiculo (marca, modelo, año, precio_usd, estado, imagenes, descripcion) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [result] = await db.query(sql, [marca, modelo, año, precio_usd, estado || 'disponible', imagenes || '', descripcion || '']);

        res.status(201).json({ 
            status: 201, 
            message: 'Vehículo registrado exitosamente',
            data: { id: result.insertId, ...req.body }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Error en la consulta SQL' });
    }
});

// PUT /api/vehiculos/:id - Actualizar
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { marca, modelo, año, precio_usd, estado, imagenes, descripcion } = req.body;

        const sql = 'UPDATE Vehiculo SET marca = ?, modelo = ?, año = ?, precio_usd = ?, estado = ?, imagenes = ?, descripcion = ? WHERE id = ?';
        const [result] = await db.query(sql, [marca, modelo, año, precio_usd, estado, imagenes, descripcion, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 404, message: 'Vehículo no encontrado' });
        }

        res.status(200).json({ status: 200, message: 'Vehículo actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error en la consulta SQL' });
    }
});

// DELETE /api/vehiculos/:id - Eliminar
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const [result] = await db.query('DELETE FROM Vehiculo WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 404, message: 'Vehículo no encontrado' });
        }

        res.status(200).json({ status: 200, message: 'Vehículo eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error en la consulta SQL' });
    }
});

module.exports = router;