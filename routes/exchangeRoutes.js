const express = require('express');
const axios = require('axios');
const router = express.Router();
const db = require('../config/db');

// Tasas por defecto en caso de error de API
const TASAS_DEFECTO = {
    USD: 1,
    HNL: 24.75,
    EUR: 0.92,
    GTQ: 7.75,
    NIO: 36.50
};

// Función para obtener tasas reales desde API externa
async function obtenerTasas() {
    try {
        console.log('🌐 Consultando API externa de tasas de cambio...');
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
            timeout: 5000 // 5 segundos de timeout
        });
        
        // Verificar que la respuesta tiene datos
        if (response.data && response.data.rates) {
            console.log('✅ Tasas obtenidas exitosamente');
            // Asegurar que HNL existe
            if (!response.data.rates.HNL) {
                response.data.rates.HNL = 24.75;
            }
            return response.data.rates;
        } else {
            console.log('⚠️ API devolvió datos inválidos, usando tasas por defecto');
            return TASAS_DEFECTO;
        }
    } catch (error) {
        console.log('⚠️ Error en API externa:', error.message);
        console.log('📊 Usando tasas por defecto');
        return TASAS_DEFECTO;
    }
}

// GET /api/exchange/rates - Obtener todas las tasas
router.get('/rates', async (req, res) => {
    try {
        const rates = await obtenerTasas();
        
        res.status(200).json({
            status: 200,
            base: 'USD',
            rates: rates,
            lempiras_por_dolar: rates.HNL || 24.75,
            fecha: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error en /rates:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al obtener tasas de cambio',
            error: error.message
        });
    }
});

// GET /api/exchange/to-hnl/:monto - Convertir USD a Lempiras
router.get('/to-hnl/:monto', async (req, res) => {
    try {
        const montoUSD = parseFloat(req.params.monto);
        
        if (isNaN(montoUSD)) {
            return res.status(400).json({ 
                status: 400, 
                message: 'El monto debe ser un número válido' 
            });
        }
        
        const rates = await obtenerTasas();
        const tasaHNL = rates.HNL || 24.75;
        const montoHNL = montoUSD * tasaHNL;
        
        res.status(200).json({
            status: 200,
            monto_usd: montoUSD,
            monto_hnl: montoHNL,
            tasa_cambio: tasaHNL,
            moneda: 'Lempiras (HNL)'
        });
    } catch (error) {
        console.error('Error en /to-hnl:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error en la conversión',
            error: error.message
        });
    }
});

// POST /api/exchange/convert - Convertir a múltiples monedas
router.post('/convert', async (req, res) => {
    try {
        const { monto_usd } = req.body;
        
        if (!monto_usd) {
            return res.status(400).json({ 
                status: 400, 
                message: 'El monto en USD es requerido' 
            });
        }

        const rates = await obtenerTasas();
        
        res.status(200).json({
            status: 200,
            monto_original_usd: monto_usd,
            conversiones: {
                lempiras: {
                    monto: monto_usd * (rates.HNL || 24.75),
                    tasa: rates.HNL || 24.75,
                    simbolo: 'L'
                },
                euros: {
                    monto: monto_usd * (rates.EUR || 0.92),
                    tasa: rates.EUR || 0.92,
                    simbolo: '€'
                }
            }
        });
    } catch (error) {
        console.error('Error en /convert:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error en la conversión',
            error: error.message
        });
    }
});

// GET /api/exchange/precio-vehiculo/:vehiculoId - Precio de vehículo en Lempiras
router.get('/precio-vehiculo/:vehiculoId', async (req, res) => {
    try {
        const vehiculoId = parseInt(req.params.vehiculoId);
        
        if (isNaN(vehiculoId)) {
            return res.status(400).json({ 
                status: 400, 
                message: 'ID de vehículo inválido' 
            });
        }
        
        // Obtener vehículo de la base de datos
        const [vehiculo] = await db.query('SELECT * FROM Vehiculo WHERE id = ?', [vehiculoId]);
        
        if (vehiculo.length === 0) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Vehículo no encontrado' 
            });
        }
        
        // Obtener tasas de cambio
        const rates = await obtenerTasas();
        const tasaHNL = rates.HNL || 24.75;
        const precioUSD = parseFloat(vehiculo[0].precio_usd);
        const precioHNL = precioUSD * tasaHNL;
        
        res.status(200).json({
            status: 200,
            vehiculo: {
                id: vehiculo[0].id,
                marca: vehiculo[0].marca,
                modelo: vehiculo[0].modelo,
                año: vehiculo[0].año
            },
            precio_original_usd: `$${precioUSD.toFixed(2)}`,
            precio_en_lempiras: `L ${precioHNL.toFixed(2)}`,
            tasa_del_dia: `1 USD = L ${tasaHNL.toFixed(2)}`,
            fecha_consulta: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error en precio-vehiculo:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al obtener precio del vehículo',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;