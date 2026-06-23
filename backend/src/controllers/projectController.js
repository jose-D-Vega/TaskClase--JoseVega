const { pool } = require('../config/db');

// ─────────────────────────────────────────────────────────────
// GET /api/projects — Obtener todos los proyectos del usuario
// ─────────────────────────────────────────────────────────────
const getAllProjects = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT
        p.*,
        COUNT(t.id)                                                         AS task_count,
        COUNT(t.id) FILTER (WHERE t.status = 'completed')                   AS completed_count,
        COUNT(t.id) FILTER (WHERE t.status = 'pending')                     AS pending_count,
        COUNT(t.id) FILTER (WHERE t.status = 'in_progress')                 AS in_progress_count
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id
      WHERE p.user_id = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC`,
      [user_id]
    );

    res.json({ success: true, count: result.rows.length, data: result.rows });

  } catch (error) {
    console.error('Error en getAllProjects:', error);
    res.status(500).json({ success: false, message: 'Error al obtener los proyectos' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/projects/:id — Obtener un proyecto por ID
// ─────────────────────────────────────────────────────────────
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT
        p.*,
        COUNT(t.id)                                                         AS task_count,
        COUNT(t.id) FILTER (WHERE t.status = 'completed')                   AS completed_count,
        COUNT(t.id) FILTER (WHERE t.status = 'pending')                     AS pending_count,
        COUNT(t.id) FILTER (WHERE t.status = 'in_progress')                 AS in_progress_count
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id
      WHERE p.id = $1 AND p.user_id = $2
      GROUP BY p.id`,
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado o sin permiso' });
    }

    res.json({ success: true, data: result.rows[0] });

  } catch (error) {
    console.error('Error en getProjectById:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el proyecto' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/projects — Crear un proyecto
// ─────────────────────────────────────────────────────────────
const createProject = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const user_id = req.user.id;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'El nombre del proyecto es obligatorio' });
    }

    const exists = await pool.query(
      'SELECT id FROM projects WHERE user_id = $1 AND name = $2',
      [user_id, name.trim()]
    );
    if (exists.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Ya existe un proyecto con ese nombre' });
    }

    const result = await pool.query(
      `INSERT INTO projects (name, description, color, user_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name.trim(), description || null, color || '#00f0ff', user_id]
    );

    res.status(201).json({
      success: true,
      message: 'Proyecto creado exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error en createProject:', error);
    res.status(500).json({ success: false, message: 'Error al crear el proyecto' });
  }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/projects/:id — Actualizar un proyecto
// ─────────────────────────────────────────────────────────────
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;
    const user_id = req.user.id;

    if (name !== undefined && name.trim() === '') {
      return res.status(400).json({ success: false, message: 'El nombre no puede estar vacío' });
    }

    const projectExists = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    if (projectExists.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado o sin permiso' });
    }

    if (name !== undefined) {
      const duplicate = await pool.query(
        'SELECT id FROM projects WHERE user_id = $1 AND name = $2 AND id != $3',
        [user_id, name.trim(), id]
      );
      if (duplicate.rows.length > 0) {
        return res.status(409).json({ success: false, message: 'Ya existe otro proyecto con ese nombre' });
      }
    }

    const result = await pool.query(
      `UPDATE projects SET
        name        = COALESCE($1, name),
        description = COALESCE($2, description),
        color       = COALESCE($3, color),
        updated_at  = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [
        name !== undefined ? name.trim() : null,
        description !== undefined ? description : null,
        color || null,
        id,
        user_id
      ]
    );

    res.json({
      success: true,
      message: 'Proyecto actualizado exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error en updateProject:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el proyecto' });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE /api/projects/:id — Eliminar un proyecto
// (Las tareas quedan sin proyecto por el ON DELETE SET NULL)
// ─────────────────────────────────────────────────────────────
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id, name',
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado o sin permiso' });
    }

    res.json({
      success: true,
      message: `Proyecto "${result.rows[0].name}" eliminado. Las tareas asociadas quedaron sin proyecto.`
    });

  } catch (error) {
    console.error('Error en deleteProject:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el proyecto' });
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/projects/:id/tasks — Obtener tareas de un proyecto
// ─────────────────────────────────────────────────────────────
const getProjectTasks = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.query;
    const user_id = req.user.id;

    // Verificar que el proyecto pertenece al usuario
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado o sin permiso' });
    }

    let query = `
      SELECT
        t.*,
        COALESCE(
          json_agg(
            json_build_object('id', c.id, 'name', c.name, 'color', c.color)
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS categories
      FROM tasks t
      LEFT JOIN task_categories tc ON tc.task_id = t.id
      LEFT JOIN categories c ON c.id = tc.category_id
      WHERE t.project_id = $1 AND t.user_id = $2
    `;

    const params = [id, user_id];
    let idx = 3;

    if (status) { query += ` AND t.status = $${idx}`; params.push(status); idx++; }
    if (priority) { query += ` AND t.priority = $${idx}`; params.push(priority); idx++; }

    query += ` GROUP BY t.id ORDER BY
      CASE t.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END,
      t.created_at DESC`;

    const result = await pool.query(query, params);

    res.json({ success: true, count: result.rows.length, data: result.rows });

  } catch (error) {
    console.error('Error en getProjectTasks:', error);
    res.status(500).json({ success: false, message: 'Error al obtener las tareas del proyecto' });
  }
};

module.exports = { getAllProjects, getProjectById, createProject, updateProject, deleteProject, getProjectTasks };