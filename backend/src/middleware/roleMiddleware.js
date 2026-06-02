/**
 * Middleware para validar roles de usuario.
 * Se asegura de que el usuario tenga uno de los roles permitidos para acceder a la ruta.
 */
const authorize = (roles = []) => {
    // Si se pasa un string, lo convertimos a array
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        // req.user viene del authMiddleware previo
        if (!req.user || (roles.length && !roles.includes(req.user.role))) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos suficientes para acceder a este recurso.'
            });
        }

        next();
    };
};

module.exports = authorize;
