const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/authRoutes');
//const vehiculoRoutes = require('./routes/vehiculoRoutes');
//const exchangeRoutes = require('./routes/exchangeRoutes');
//const clienteRoutes = require('./routes/clienteRoutes');
//const ventaRoutes = require('./routes/ventaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================================
// RUTAS DE LA API
// =============================================

// Autenticación
app.use('/api/auth', authRoutes);

// Vehículos
//app.use('/api/vehiculos', vehiculoRoutes);

// Tasas de cambio
//app.use('/api/exchange', exchangeRoutes);

// Clientes
//app.use('/api/clientes', clienteRoutes);

// Ventas
//app.use('/api/ventas', ventaRoutes);

// =============================================
// RUTA DE PRUEBA / HEALTH CHECK
// =============================================
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth/register, /api/auth/login',
            vehiculos: '/api/vehiculos',
            exchange: '/api/exchange/rates, /api/exchange/to-hnl/:monto',
            clientes: '/api/clientes',
            ventas: '/api/ventas'
        }
    });
});

// =============================================
// MANEJO DE RUTAS NO ENCONTRADAS (404)
// =============================================
app.use((req, res) => {
    res.status(404).json({ 
        status: 404, 
        message: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method
    });
});

// =============================================
// MANEJO DE ERRORES GLOBALES
// =============================================
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        status: 500, 
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// =============================================
// INICIAR SERVIDOR
// =============================================
app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════');
    console.log('Servidor de Autolote iniciado correctamente');
    console.log(`Puerto: ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log('');
    console.log('Endpoints disponibles:');
    console.log(`   POST   /api/auth/register    - Registrar usuario`);
    console.log(`   POST   /api/auth/login       - Iniciar sesión`);
    console.log(`   GET    /api/vehiculos        - Listar vehículos`);
    console.log(`   POST   /api/vehiculos        - Crear vehículo`);
    console.log(`   GET    /api/exchange/rates   - Ver tasas de cambio`);
    console.log(`   GET    /api/exchange/to-hnl/:monto - Convertir a Lempiras`);
    console.log(`   GET    /api/clientes         - Listar clientes`);
    console.log(`   POST   /api/clientes         - Crear cliente`);
    console.log(`   GET    /api/ventas           - Listar ventas`);
    console.log(`   POST   /api/ventas           - Registrar venta`);
    console.log('═══════════════════════════════════════════════════');
});