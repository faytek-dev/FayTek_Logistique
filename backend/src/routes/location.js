const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    updateLocation,
    getCouriersLocations,
    findNearbyCouriers
} = require('../controllers/locationController');

// Toutes les routes nécessitent une authentification
router.use(protect);

router.post('/update', authorize('courier'), updateLocation);
router.get('/couriers', authorize('admin', 'dispatcher'), getCouriersLocations);
router.get('/nearby', authorize('admin', 'dispatcher'), findNearbyCouriers);

module.exports = router;
