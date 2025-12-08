const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createTask,
    getTasks,
    getTask,
    updateTask,
    updateTaskStatus,
    deleteTask
} = require('../controllers/taskController');

// Toutes les routes nécessitent une authentification
router.use(protect);

router.route('/')
    .get(getTasks)
    .post(authorize('admin', 'dispatcher'), createTask);

router.route('/:id')
    .get(getTask)
    .put(authorize('admin', 'dispatcher'), updateTask)
    .delete(authorize('admin', 'dispatcher'), deleteTask);

router.patch('/:id/status', updateTaskStatus);

module.exports = router;
