const { pool } = require('../config/db');

// ─────────────────────────────────────────────────────────────
// GET /api/tasks/:taskId/subtasks — Obtener subtareas de una tarea
// ─────────────────────────────────────────────────────────────
const getSubtasks = async (req, res) => {
  try {
    const { taskId } = req.params;
    const user_id = req.user.id;

    // Verificamos que la tarea pertenece al usuario
    const taskCheck = await pool.query(
      'SELECT id FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, user_id]
    );
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada o sin permiso' });
    }

    const result = await pool.query(
      'SELECT * FROM subtasks WHERE task_id = $1 ORDER BY created_at ASC',
      [taskId]
    );

    res.json({ success: true, count: result.rows.length, data: result.rows });

  } catch (error) {
    console.error('Error en getSubtasks:', error);
    res.status(500).json({ success: false, message: 'Error al obtener las subtareas' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/tasks/:taskId/subtasks — Crear una subtarea
// ─────────────────────────────────────────────────────────────
const createSubtask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;
    const user_id = req.user.id;

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'El título de la subtarea es obligatorio' });
    }

    const taskCheck = await pool.query(
      'SELECT id FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, user_id]
    );
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada o sin permiso' });
    }

    const result = await pool.query(
      'INSERT INTO subtasks (task_id, title) VALUES ($1, $2) RETURNING *',
      [taskId, title.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Subtarea creada exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error en createSubtask:', error);
    res.status(500).json({ success: false, message: 'Error al crear la subtarea' });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/tasks/:taskId/subtasks/:id — Actualizar una subtarea
// ─────────────────────────────────────────────────────────────
const updateSubtask = async (req, res) => {
  try {
    const { taskId, id } = req.params;
    const { title, completed } = req.body;
    const user_id = req.user.id;

    if (title !== undefined && title.trim() === '') {
      return res.status(400).json({ success: false, message: 'El título no puede estar vacío' });
    }

    // Verificamos que la tarea pertenece al usuario
    const taskCheck = await pool.query(
      'SELECT id FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, user_id]
    );
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada o sin permiso' });
    }

    const result = await pool.query(
      `UPDATE subtasks SET
        title     = COALESCE($1, title),
        completed = COALESCE($2, completed)
       WHERE id = $3 AND task_id = $4
       RETURNING *`,
      [
        title !== undefined ? title.trim() : null,
        completed !== undefined ? completed : null,
        id,
        taskId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Subtarea no encontrada' });
    }

    res.json({
      success: true,
      message: 'Subtarea actualizada exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error en updateSubtask:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar la subtarea' });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/tasks/:taskId/subtasks/:id — Eliminar una subtarea
// ─────────────────────────────────────────────────────────────
const deleteSubtask = async (req, res) => {
  try {
    const { taskId, id } = req.params;
    const user_id = req.user.id;

    const taskCheck = await pool.query(
      'SELECT id FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, user_id]
    );
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada o sin permiso' });
    }

    const result = await pool.query(
      'DELETE FROM subtasks WHERE id = $1 AND task_id = $2 RETURNING id, title',
      [id, taskId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Subtarea no encontrada' });
    }

    res.json({
      success: true,
      message: `Subtarea "${result.rows[0].title}" eliminada exitosamente`
    });

  } catch (error) {
    console.error('Error en deleteSubtask:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar la subtarea' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/tasks/:taskId/subtasks/bulk — Crear varias subtareas a la vez
// (usado al crear una tarea con subtareas desde el formulario)
// ─────────────────────────────────────────────────────────────
const bulkCreateSubtasks = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { subtasks } = req.body;
    const user_id = req.user.id;

    if (!Array.isArray(subtasks) || subtasks.length === 0) {
      return res.status(400).json({ success: false, message: 'Se requiere un array de subtareas' });
    }

    const taskCheck = await pool.query(
      'SELECT id FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, user_id]
    );
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada o sin permiso' });
    }

    // Filtramos títulos vacíos
    const validSubtasks = subtasks.filter(s => s.title && s.title.trim() !== '');

    if (validSubtasks.length === 0) {
      return res.status(400).json({ success: false, message: 'Ninguna subtarea tiene un título válido' });
    }

    // Construimos el INSERT múltiple
    const values = validSubtasks.map((_, i) => `($1, $${i + 2})`).join(', ');
    const params = [taskId, ...validSubtasks.map(s => s.title.trim())];

    const result = await pool.query(
      `INSERT INTO subtasks (task_id, title) VALUES ${values} RETURNING *`,
      params
    );

    res.status(201).json({
      success: true,
      message: `${result.rows.length} subtareas creadas exitosamente`,
      data: result.rows
    });

  } catch (error) {
    console.error('Error en bulkCreateSubtasks:', error);
    res.status(500).json({ success: false, message: 'Error al crear las subtareas' });
  }
};

module.exports = { getSubtasks, createSubtask, updateSubtask, deleteSubtask, bulkCreateSubtasks };