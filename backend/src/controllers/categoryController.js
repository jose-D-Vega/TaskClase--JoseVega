// Importamos el pool de conexiones a la base de datos
const { pool } = require('../config/db');

// ─────────────────────────────────────────────────────────────
// GET /api/categories — Obtener TODAS las categorías del usuario
// ─────────────────────────────────────────────────────────────
const getAllCategories = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT 
        c.id,
        c.name,
        c.color,
        c.user_id,
        c.created_at,
        COUNT(tc.task_id) AS task_count
      FROM categories c
      LEFT JOIN task_categories tc ON tc.category_id = c.id
      WHERE c.user_id = $1
      GROUP BY c.id
      ORDER BY c.created_at DESC`,
      [user_id]
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('Error en getAllCategories:', error);
    res.status(500).json({ success: false, message: 'Error al obtener las categorías' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/categories/:id — Obtener UNA categoría por su ID
// ─────────────────────────────────────────────────────────────
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT * FROM categories WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No se encontró la categoría o no tienes permiso`
      });
    }

    res.json({ success: true, data: result.rows[0] });

  } catch (error) {
    console.error('Error en getCategoryById:', error);
    res.status(500).json({ success: false, message: 'Error al obtener la categoría' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/categories — Crear una NUEVA categoría
// ─────────────────────────────────────────────────────────────
const createCategory = async (req, res) => {
  try {
    const { name, color } = req.body;
    const user_id = req.user.id;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la categoría es obligatorio'
      });
    }

    // Verificamos que no exista ya una categoría con ese nombre para el usuario
    const exists = await pool.query(
      'SELECT id FROM categories WHERE user_id = $1 AND name = $2',
      [user_id, name.trim()]
    );

    if (exists.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre'
      });
    }

    const result = await pool.query(
      `INSERT INTO categories (name, color, user_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        name.trim(),
        color || '#00f0ff',
        user_id
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error en createCategory:', error);
    res.status(500).json({ success: false, message: 'Error al crear la categoría' });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/categories/:id — Actualizar una categoría existente
// ─────────────────────────────────────────────────────────────
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    const user_id = req.user.id;

    if (name !== undefined && name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la categoría no puede estar vacío'
      });
    }

    // Verificamos que la categoría existe y pertenece al usuario
    const categoryExists = await pool.query(
      'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (categoryExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No se encontró la categoría o no tienes permiso`
      });
    }

    // Si se cambia el nombre, verificar que no choque con otra categoría
    if (name !== undefined) {
      const duplicate = await pool.query(
        'SELECT id FROM categories WHERE user_id = $1 AND name = $2 AND id != $3',
        [user_id, name.trim(), id]
      );

      if (duplicate.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe otra categoría con ese nombre'
        });
      }
    }

    const result = await pool.query(
      `UPDATE categories SET
        name  = COALESCE($1, name),
        color = COALESCE($2, color)
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [
        name !== undefined ? name.trim() : null,
        color || null,
        id,
        user_id
      ]
    );

    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error en updateCategory:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar la categoría' });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/categories/:id — Eliminar una categoría
// ─────────────────────────────────────────────────────────────
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id, name',
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No se encontró la categoría o no tienes permiso`
      });
    }

    res.json({
      success: true,
      message: `Categoría "${result.rows[0].name}" eliminada exitosamente`
    });

  } catch (error) {
    console.error('Error en deleteCategory:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar la categoría' });
  }
};

// Exportamos todas las funciones para usarlas en las rutas
module.exports = { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };