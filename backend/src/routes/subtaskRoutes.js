const express = require('express');
// mergeParams permite acceder a :taskId del router padre
const router = express.Router({ mergeParams: true });
const authMiddleware = require('../middleware/authMiddleware');

const {
  getSubtasks,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  bulkCreateSubtasks
} = require('../controllers/subtaskController');

router.use(authMiddleware);

router.route('/').get(getSubtasks).post(createSubtask);
router.post('/bulk', bulkCreateSubtasks);
router.route('/:id').put(updateSubtask).delete(deleteSubtask);

module.exports = router;