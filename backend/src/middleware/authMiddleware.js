const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const authMiddleware = async (req, res, next) => {
    // Obtener el token del header Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Acceso denegado. No se proporcionó un token.'
        });
    }

    try {
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        
        // VALIDACIÓN DE SESIÓN REMOTA
        // Verificamos si la sesión (sid) sigue existiendo en la base de datos
        if (decoded.sid) {
            const sessionCheck = await pool.query(
                'SELECT id FROM refresh_tokens WHERE id = $1',
                [decoded.sid]
            );

            if (sessionCheck.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Sesión revocada o cerrada remotamente.',
                    revoked: true
                });
            }
        }
        
        // Agregar los datos del usuario decodificados al objeto req
        req.user = decoded;
        
        next(); // Continuar a la siguiente función
    } catch (error) {
        console.error('Error al verificar token:', error.message);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado',
                expired: true
            });
        }

        res.status(403).json({
            success: false,
            message: 'Token no válido'
        });
    }
};

module.exports = authMiddleware;
