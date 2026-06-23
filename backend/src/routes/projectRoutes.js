const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectTasks
} = require('../controllers/projectController');

router.use(authMiddleware);

router.route('/').get(getAllProjects).post(createProject);
router.route('/:id').get(getProjectById).put(updateProject).delete(deleteProject);
router.get('/:id/tasks', getProjectTasks);

module.exports = router;