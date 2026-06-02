const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Todas las rutas de usuarios requieren estar autenticado
router.use(authMiddleware);

// Obtener todos los usuarios (Solo Admin)
router.get('/', authorize('admin'), userController.getAllUsers);

// Obtener sesiones de un usuario (Solo Admin)
router.get('/:id/sessions', authorize('admin'), userController.getUserSessions);

// Revocar una sesión (Solo Admin)
router.delete('/sessions/:sessionId', authorize('admin'), userController.deleteSession);

// Actualizar un usuario (Admin puede actualizar a cualquiera, Usuario solo a sí mismo)
router.put('/:id', userController.updateUser);

module.exports = router;
