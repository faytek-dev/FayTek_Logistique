const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getUsers,
    getCouriers,
    getUser,
    updateUser,
    toggleUserActive,
    deleteUser,
    updateAvailability
} = require('../controllers/userController');

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes accessibles par Admin et Dispatcher
router.get('/couriers', authorize('admin', 'dispatcher'), getCouriers);

// Routes accessibles uniquement par Admin
router.route('/')
    .get(authorize('admin'), getUsers);

router.route('/:id')
    .get(authorize('admin'), getUser)
    .put(authorize('admin'), updateUser)
    .delete(authorize('admin'), deleteUser);

router.patch('/:id/toggle-active', authorize('admin'), toggleUserActive);

// Route pour les coursiers
router.patch('/availability', authorize('courier'), updateAvailability);

module.exports = router;
