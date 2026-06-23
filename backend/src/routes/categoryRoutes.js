const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

// Todas las rutas de categorías requieren autenticación
router.use(authMiddleware);

router.route('/').get(getAllCategories).post(createCategory);
router.route('/:id').get(getCategoryById).put(updateCategory).delete(deleteCategory);

module.exports = router;