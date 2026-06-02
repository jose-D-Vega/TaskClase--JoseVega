const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generar Access Token (vida configurable, default: 5 min)
// Incluimos el rol en el payload del JWT para validaciones rápidas en el cliente y middleware
const generateAccessToken = (user, sessionId) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role, sid: sessionId },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES || '5m' }
    );
};

// Generar Refresh Token (vida configurable, default: 1 hora)
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES || '1h' }
    );
};

// Registro de usuario
const register = async (req, res) => {
    try {
        const { name, email, password, avatar } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
        }

        // Verificar si el usuario ya existe
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear usuario
        const result = await pool.query(
            'INSERT INTO users (name, email, password, avatar) VALUES ($1, $2, $3, $4) RETURNING id, name, email, avatar, role, created_at',
            [name, email, hashedPassword, avatar || null]
        );

        const newUser = result.rows[0];

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: newUser
        });
    } catch (error) {
        console.error('Error en register:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

// Login de usuario
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email y contraseña requeridos' });
        }

        // Buscar usuario
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        const user = result.rows[0];

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        // Generar tokens preliminares (el refreshToken no depende del sessionId)
        const refreshToken = generateRefreshToken(user);

        // Guardar Refresh Token en la base de datos para rotación y seguridad
        // Usamos CURRENT_TIMESTAMP del motor de DB para total consistencia con created_at
        // y evitar problemas de desincronización entre Node.js y Postgres
        const resultToken = await pool.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL \'1 hour\') RETURNING id',
            [user.id, refreshToken]
        );
        
        const sessionId = resultToken.rows[0].id;
        const accessToken = generateAccessToken(user, sessionId);

        // Guardar Refresh Token en una cookie HTTP-only
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true en producción
            sameSite: 'strict',
            maxAge: 1 * 60 * 60 * 1000 // 1 hora
        });

        res.json({
            success: true,
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

// Renovar Access Token (con rotación de Refresh Token)
const refresh = async (req, res) => {
    try {
        const oldRefreshToken = req.cookies.refreshToken;

        if (!oldRefreshToken) {
            return res.status(401).json({ success: false, message: 'No hay refresh token' });
        }

        // 1. Verificar si el token existe en la base de datos
        const dbToken = await pool.query('SELECT * FROM refresh_tokens WHERE token = $1', [oldRefreshToken]);
        
        if (dbToken.rows.length === 0) {
            // Si el token no está en la DB pero sí en la cookie, podría ser un intento de reutilización
            // En un sistema estricto, aquí podríamos invalidar TODAS las sesiones del usuario
            
            res.clearCookie('refreshToken', {
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production'
            });

            return res.status(403).json({ success: false, message: 'Token no válido o ya utilizado' });
        }

        // 2. Verificar JWT
        jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
            if (err) {
                // Si el token expiró o es inválido, lo borramos de la DB
                await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [oldRefreshToken]);
                
                res.clearCookie('refreshToken', {
                    httpOnly: true,
                    sameSite: 'strict',
                    secure: process.env.NODE_ENV === 'production'
                });

                return res.status(403).json({ success: false, message: 'Refresh token inválido o expirado' });
            }

            // 3. Buscar usuario
            const result = await pool.query('SELECT id, name, email, avatar, role FROM users WHERE id = $1', [decoded.id]);
            if (result.rows.length === 0) {
                return res.status(403).json({ success: false, message: 'Usuario no encontrado' });
            }

            const user = result.rows[0];

            // 4. ROTACIÓN: Borrar token viejo y crear uno nuevo
            await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [oldRefreshToken]);
            
            const newRefreshToken = generateRefreshToken(user);

            const resultToken = await pool.query(
                'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL \'1 hour\') RETURNING id',
                [user.id, newRefreshToken]
            );

            const sessionId = resultToken.rows[0].id;
            const newAccessToken = generateAccessToken(user, sessionId);

            // 5. Actualizar cookie
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1 * 60 * 60 * 1000
            });

            res.json({ success: true, accessToken: newAccessToken });
        });
    } catch (error) {
        console.error('Error en refresh:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

// Logout
const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        
        if (refreshToken) {
            // Borrar de la base de datos
            await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
        }

        res.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });
        
        res.json({ success: true, message: 'Sesión cerrada correctamente' });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

// Obtener info del usuario actual
const getMe = async (req, res) => {
    try {
        // req.user viene del middleware de autenticación
        const result = await pool.query('SELECT id, name, email, avatar, role, created_at FROM users WHERE id = $1', [req.user.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error en getMe:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

module.exports = {
    register,
    login,
    refresh,
    logout,
    getMe
};
