const { pool } = require('../config/db');

/**
 * Obtener todos los usuarios (Solo para Administradores)
 */
const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, avatar, role, created_at FROM users ORDER BY created_at DESC'
        );
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor al recuperar usuarios'
        });
    }
};

/**
 * Actualizar rol o datos de un usuario
 */
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, avatar } = req.body;

        // Seguridad: Si no es admin, solo puede actualizarse a sí mismo
        if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
            return res.status(403).json({ 
                success: false, 
                message: 'No tienes permiso para actualizar este perfil' 
            });
        }

        // Verificar si el usuario existe
        const userExists = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (userExists.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        // Seguridad: Si no es admin, no puede cambiarse el rol a sí mismo
        const finalRole = (req.user.role === 'admin') ? (role || userExists.rows[0].role) : userExists.rows[0].role;

        const result = await pool.query(
            'UPDATE users SET name = $1, email = $2, role = $3, avatar = $4 WHERE id = $5 RETURNING id, name, email, role, avatar',
            [name || userExists.rows[0].name, email || userExists.rows[0].email, finalRole, avatar || userExists.rows[0].avatar, id]
        );

        res.json({
            success: true,
            message: 'Usuario actualizado correctamente',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

/**
 * Obtener las sesiones activas de un usuario (Solo Admin)
 */
const getUserSessions = async (req, res) => {
    try {
        const { id } = req.params;

        // Solo administradores pueden ver sesiones de otros
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'No autorizado' });
        }

        const result = await pool.query(
            'SELECT id, created_at, expires_at FROM refresh_tokens WHERE user_id = $1 ORDER BY created_at DESC',
            [id]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error al obtener sesiones:', error);
        res.status(500).json({ success: false, message: 'Error al recuperar sesiones' });
    }
};

/**
 * Eliminar (revocar) una sesión específica (Solo Admin)
 */
const deleteSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Solo administradores pueden revocar sesiones de otros de esta forma
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'No autorizado' });
        }

        await pool.query('DELETE FROM refresh_tokens WHERE id = $1', [sessionId]);

        res.json({
            success: true,
            message: 'Sesión cerrada correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar sesión:', error);
        res.status(500).json({ success: false, message: 'Error al cerrar la sesión' });
    }
};

module.exports = {
    getAllUsers,
    updateUser,
    getUserSessions,
    deleteSession
};
