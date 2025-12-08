const User = require('../models/User');

// @desc    Mettre à jour la position GPS du coursier
// @route   POST /api/location/update
// @access  Private (Courier)
exports.updateLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude et longitude requises'
            });
        }

        // Vérifier que l'utilisateur est un coursier
        if (req.user.role !== 'courier') {
            return res.status(403).json({
                success: false,
                message: 'Seuls les coursiers peuvent mettre à jour leur position'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                currentLocation: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                },
                lastLocationUpdate: new Date()
            },
            { new: true }
        ).select('-password');

        // Émettre la mise à jour via Socket.IO
        if (req.app.get('io')) {
            req.app.get('io').emit('location:updated', {
                courierId: user._id,
                courierName: user.name,
                location: {
                    latitude,
                    longitude
                },
                timestamp: new Date()
            });
        }

        res.json({
            success: true,
            message: 'Position mise à jour',
            data: {
                location: user.currentLocation,
                lastUpdate: user.lastLocationUpdate
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de la position',
            error: error.message
        });
    }
};

// @desc    Obtenir la position de tous les coursiers actifs
// @route   GET /api/location/couriers
// @access  Private (Admin, Dispatcher)
exports.getCouriersLocations = async (req, res) => {
    try {
        const couriers = await User.find({
            role: 'courier',
            availability: { $in: ['available', 'busy'] }
        }).select('name email currentLocation lastLocationUpdate availability');

        res.json({
            success: true,
            count: couriers.length,
            data: couriers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des positions',
            error: error.message
        });
    }
};

// @desc    Trouver les coursiers à proximité
// @route   GET /api/location/nearby
// @access  Private (Admin, Dispatcher)
exports.findNearbyCouriers = async (req, res) => {
    try {
        const { latitude, longitude, maxDistance = 5000 } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude et longitude requises'
            });
        }

        const couriers = await User.find({
            role: 'courier',
            availability: 'available',
            currentLocation: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        }).select('name email phone currentLocation lastLocationUpdate');

        res.json({
            success: true,
            count: couriers.length,
            data: couriers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la recherche',
            error: error.message
        });
    }
};
