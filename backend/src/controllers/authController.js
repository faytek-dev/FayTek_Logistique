const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public (ou Admin pour créer des dispatchers/admins)
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Cet email est déjà utilisé'
            });
        }

        // Seul un admin peut créer d'autres admins ou dispatchers
        if (role && ['admin', 'dispatcher'].includes(role)) {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Seul un administrateur peut créer ce type de compte'
                });
            }
        }

        // Créer l'utilisateur
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'courier',
            phone
        });

        // Générer le token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'inscription',
            error: error.message
        });
    }
};

// @desc    Connexion utilisateur
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email et mot de passe requis'
            });
        }

        // Trouver l'utilisateur avec le mot de passe
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Identifiants invalides'
            });
        }

        // Vérifier le mot de passe
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Identifiants invalides'
            });
        }

        // Vérifier si le compte est actif
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Votre compte a été désactivé'
            });
        }

        // Générer le token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Connexion réussie',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone
                },
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la connexion',
            error: error.message
        });
    }
};

// @desc    Obtenir le profil de l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du profil',
            error: error.message
        });
    }
};

// @desc    Mettre à jour le profil
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, phone },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Profil mis à jour',
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
