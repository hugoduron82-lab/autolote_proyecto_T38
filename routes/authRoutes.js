const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const { nombre, apellido, email, password, rol } = req.body;

        if (!nombre || !apellido || !email || !password) {
            return res.status(400).json({ 
                status: 400, 
                message: 'Todos los campos son obligatorios' 
            });
        }

        const [existe] = await db.query('SELECT * FROM Usuario WHERE email = ?', [email]);
        if (existe.length > 0) {
            return res.status(400).json({ 
                status: 400, 
                message: 'El email ya está registrado' 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.query(
            'INSERT INTO Usuario (nombre, apellido, email, password, rol) VALUES (?, ?, ?, ?, ?)',
            [nombre, apellido, email, hashedPassword, rol || 'cliente']
        );

        res.status(201).json({ 
            status: 201, 
            message: 'Usuario registrado exitosamente',
            data: { id: result.insertId, nombre, apellido, email }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Error en el servidor' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                status: 400, 
                message: 'Email y password son obligatorios' 
            });
        }

        const [users] = await db.query('SELECT * FROM Usuario WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ 
                status: 401, 
                message: 'Credenciales inválidas' 
            });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ 
                status: 401, 
                message: 'Credenciales inválidas' 
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, rol: user.rol },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '8h' }
        );

        res.json({
            status: 200,
            message: 'Login exitoso',
            data: {
                token,
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    email: user.email,
                    rol: user.rol
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Error en el servidor' });
    }
});

module.exports = router;