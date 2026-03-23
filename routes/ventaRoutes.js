const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Tasa de cambio fija para cálculos
const TASA_HNL = 24.75;

// GET /api/ventas - Listar ventas con detalles
router.get('/', async (req, res) => {
    try {
        const sql = `SELECT v.*, 
                            ve.marca, ve.modelo, ve.año,
                            c.nombre as cliente_nombre, c.apellido as cliente_apellido,
                            u.nombre as vendedor_nombre, u.apellido as vendedor_apellido
                     FROM Venta v
                     JOIN Vehiculo ve ON v.vehiculo_id = ve.id
                     JOIN Cliente c ON v.cliente_id = c.id
                     JOIN Usuario u ON v.vendedor_id = u.id
                     ORDER BY v.fecha_venta DESC`;
        
        const [results] = await db.query(sql);
        
        res.status(200).json({ 
            status: 200, 
            message: 'Lista de ventas',
            data: results 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Error en la consulta SQL' });
    }
});

// GET /api/ventas/:id - Ver venta específica
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        const sql = `SELECT v.*, 
                            ve.marca, ve.modelo, ve.año,
                            c.nombre as cliente_nombre, c.apellido as cliente_apellido, 
                            c.email, c.telefono,
                            u.nombre as vendedor_nombre, u.apellido as vendedor_apellido
                     FROM Venta v
                     JOIN Vehiculo ve ON v.vehiculo_id = ve.id
                     JOIN Cliente c ON v.cliente_id = c.id
                     JOIN Usuario u ON v.vendedor_id = u.id
                     WHERE v.id = ?`;
        
        const [results] = await db.query(sql, [id]);
        
        if (results.length === 0) {
            return res.status(404).json({ status: 404, message: 'Venta no encontrada' });
        }
        
        res.status(200).json({ status: 200, message: 'Success', data: results[0] });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error en la consulta SQL' });
    }
});

// POST /api/ventas - Registrar nueva venta
router.post('/', async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        const { vehiculo_id, cliente_id, vendedor_id, precio_total_usd } = req.body;

        // Validaciones
        if (!vehiculo_id || !cliente_id || !vendedor_id || !precio_total_usd) {
            return res.status(400).json({ 
                status: 400, 
                message: 'Todos los campos son obligatorios' 
            });
        }

        await connection.beginTransaction();

        // Verificar que el vehículo esté disponible
        const [vehiculo] = await connection.query(
            'SELECT estado FROM Vehiculo WHERE id = ?', 
            [vehiculo_id]
        );
        
        if (vehiculo.length === 0) {
            await connection.rollback();
            return res.status(404).json({ status: 404, message: 'Vehículo no encontrado' });
        }
        
        if (vehiculo[0].estado !== 'disponible') {
            await connection.rollback();
            return res.status(400).json({ 
                status: 400, 
                message: 'El vehículo no está disponible para la venta' 
            });
        }

        // Calcular impuestos (15% en Honduras)
        const impuestos_usd = precio_total_usd * 0.15;
        const precio_total_hnl = precio_total_usd * TASA_HNL;
        const impuestos_hnl = impuestos_usd * TASA_HNL;

        // Insertar venta
        const sqlVenta = `INSERT INTO Venta 
                          (vehiculo_id, cliente_id, vendedor_id, precio_total_usd, precio_total_hnl, impuestos_usd, impuestos_hnl) 
                          VALUES (?, ?, ?, ?, ?, ?, ?)`;
        
        const [result] = await connection.query(sqlVenta, [
            vehiculo_id, cliente_id, vendedor_id, 
            precio_total_usd, precio_total_hnl, 
            impuestos_usd, impuestos_hnl
        ]);

        // Actualizar estado del vehículo a 'vendido'
        await connection.query('UPDATE Vehiculo SET estado = ? WHERE id = ?', ['vendido', vehiculo_id]);

        await connection.commit();

        res.status(201).json({ 
            status: 201, 
            message: 'Venta registrada exitosamente',
            data: { 
                id: result.insertId,
                vehiculo_id,
                cliente_id,
                vendedor_id,
                precio_total_usd,
                precio_total_hnl,
                impuestos_usd,
                impuestos_hnl,
                total_con_impuestos_usd: precio_total_usd + impuestos_usd,
                total_con_impuestos_hnl: precio_total_hnl + impuestos_hnl,
                fecha: new Date()
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ status: 500, message: 'Error en la consulta SQL' });
    } finally {
        connection.release();
    }
});

// GET /api/ventas/vendedor/:vendedorId - Ventas por vendedor
router.get('/vendedor/:vendedorId', async (req, res) => {
    try {
        const vendedorId = parseInt(req.params.vendedorId);
        
        const sql = `SELECT v.*, 
                            ve.marca, ve.modelo,
                            c.nombre as cliente_nombre, c.apellido as cliente_apellido
                     FROM Venta v
                     JOIN Vehiculo ve ON v.vehiculo_id = ve.id
                     JOIN Cliente c ON v.cliente_id = c.id
                     WHERE v.vendedor_id = ?
                     ORDER BY v.fecha_venta DESC`;
        
        const [results] = await db.query(sql, [vendedorId]);
        
        // Calcular totales
        let totalVentasUSD = 0;
        let totalVentasHNL = 0;
        let totalImpuestosUSD = 0;
        let totalImpuestosHNL = 0;
        
        results.forEach(venta => {
            totalVentasUSD += parseFloat(venta.precio_total_usd);
            totalVentasHNL += parseFloat(venta.precio_total_hnl);
            totalImpuestosUSD += parseFloat(venta.impuestos_usd);
            totalImpuestosHNL += parseFloat(venta.impuestos_hnl);
        });
        
        res.status(200).json({ 
            status: 200, 
            message: `Ventas del vendedor ${vendedorId}`,
            data: {
                ventas: results,
                resumen: {
                    cantidad_ventas: results.length,
                    total_ventas_usd: totalVentasUSD,
                    total_ventas_hnl: totalVentasHNL,
                    total_impuestos_usd: totalImpuestosUSD,
                    total_impuestos_hnl: totalImpuestosHNL,
                    total_con_impuestos_usd: totalVentasUSD + totalImpuestosUSD,
                    total_con_impuestos_hnl: totalVentasHNL + totalImpuestosHNL
                }
            }
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error en la consulta SQL' });
    }
});

module.exports = router;