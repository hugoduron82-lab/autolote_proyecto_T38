const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            status: 401, 
            message: 'Acceso denegado. Token requerido.' 
        });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = verified;
        next();
    } catch (error) {
        res.status(401).json({ 
            status: 401, 
            message: 'Token inválido o expirado' 
        });
    }
};

module.exports = authMiddleware;