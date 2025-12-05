const User = require('../models/User');

// @desc    Obtenir tous les utilisateurs
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');

        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des utilisateurs',
            error: error.message
        });
    }
};

// @desc    Obtenir tous les coursiers
// @route   GET /api/users/couriers
// @access  Private (Admin, Dispatcher)
exports.getCouriers = async (req, res) => {
    try {
        const couriers = await User.find({ role: 'courier' }).select('-password');

        res.json({
            success: true,
            count: couriers.length,
            data: couriers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des coursiers',
            error: error.message
        });
    }
};

// @desc    Obtenir un utilisateur par ID
// @route   GET /api/users/:id
// @access  Private (Admin)
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'utilisateur',
            error: error.message
        });
    }
};

// @desc    Mettre à jour un utilisateur
// @route   PUT /api/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
    try {
        const { password, ...updateData } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.json({
            success: true,
            message: 'Utilisateur mis à jour',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour',
            error: error.message
        });
    }
};

// @desc    Désactiver/Activer un utilisateur
// @route   PATCH /api/users/:id/toggle-active
// @access  Private (Admin)
exports.toggleUserActive = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            success: true,
            message: `Utilisateur ${user.isActive ? 'activé' : 'désactivé'}`,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification',
            error: error.message
        });
    }
};

// @desc    Supprimer un utilisateur
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        await user.deleteOne();

        res.json({
            success: true,
            message: 'Utilisateur supprimé'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression',
            error: error.message
        });
    }
};

// @desc    Mettre à jour la disponibilité d'un coursier
// @route   PATCH /api/users/availability
// @access  Private (Courier)
exports.updateAvailability = async (req, res) => {
    try {
        const { availability } = req.body;

        if (!['available', 'busy', 'offline'].includes(availability)) {
            return res.status(400).json({
                success: false,
                message: 'Statut de disponibilité invalide'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { availability },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Disponibilité mise à jour',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour',
            error: error.message
        });
    }
};
