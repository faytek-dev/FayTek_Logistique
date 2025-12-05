const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware d'authentification Socket.IO
const socketAuth = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user || !user.isActive) {
            return next(new Error('Authentication error: Invalid user'));
        }

        socket.user = user;
        next();
    } catch (error) {
        next(new Error('Authentication error: Invalid token'));
    }
};

// Gestionnaire des événements Socket.IO
const setupSocketHandlers = (io) => {
    io.use(socketAuth);

    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.user.name} (${socket.user.role}) - Socket ID: ${socket.id}`);

        // Rejoindre une room personnelle basée sur l'ID utilisateur
        socket.join(`user_${socket.user._id}`);

        // Rejoindre une room basée sur le rôle
        socket.join(`role_${socket.user.role}`);

        // Événement: Mise à jour de la position GPS (Coursier)
        socket.on('location:update', async (data) => {
            try {
                const { latitude, longitude } = data;

                if (socket.user.role !== 'courier') {
                    return socket.emit('error', { message: 'Seuls les coursiers peuvent envoyer leur position' });
                }

                // Mettre à jour la position dans la base de données
                await User.findByIdAndUpdate(socket.user._id, {
                    currentLocation: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    lastLocationUpdate: new Date()
                });

                // Diffuser la mise à jour à tous les admins et dispatchers
                io.to('role_admin').to('role_dispatcher').emit('location:updated', {
                    courierId: socket.user._id,
                    courierName: socket.user.name,
                    location: { latitude, longitude },
                    timestamp: new Date()
                });

                console.log(`📍 Location updated for ${socket.user.name}: [${latitude}, ${longitude}]`);
            } catch (error) {
                console.error('Error updating location:', error);
                socket.emit('error', { message: 'Erreur lors de la mise à jour de la position' });
            }
        });

        // Événement: Demande de positions de tous les coursiers
        socket.on('location:request:all', async () => {
            try {
                if (!['admin', 'dispatcher'].includes(socket.user.role)) {
                    return socket.emit('error', { message: 'Non autorisé' });
                }

                const couriers = await User.find({
                    role: 'courier',
                    availability: { $in: ['available', 'busy'] }
                }).select('name email currentLocation lastLocationUpdate availability');

                socket.emit('location:all', { couriers });
            } catch (error) {
                console.error('Error fetching courier locations:', error);
                socket.emit('error', { message: 'Erreur lors de la récupération des positions' });
            }
        });

        // Événement: Changement de statut de tâche
        socket.on('task:status:change', async (data) => {
            try {
                const { taskId, status } = data;

                // La logique métier est gérée par le contrôleur
                // Ici on diffuse juste l'événement
                io.to('role_admin').to('role_dispatcher').emit('task:status:changed', {
                    taskId,
                    status,
                    changedBy: socket.user.name,
                    timestamp: new Date()
                });

                console.log(`📋 Task ${taskId} status changed to ${status} by ${socket.user.name}`);
            } catch (error) {
                console.error('Error changing task status:', error);
                socket.emit('error', { message: 'Erreur lors du changement de statut' });
            }
        });

        // Événement: Notification de typing (optionnel, pour chat futur)
        socket.on('typing', (data) => {
            socket.broadcast.emit('user:typing', {
                userId: socket.user._id,
                userName: socket.user.name
            });
        });

        // Événement: Déconnexion
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.user.name} - Socket ID: ${socket.id}`);
        });

        // Gestion des erreurs
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });

    // Fonction utilitaire pour envoyer une notification à un utilisateur spécifique
    io.sendNotification = (userId, notification) => {
        io.to(`user_${userId}`).emit('notification', notification);
    };

    // Fonction utilitaire pour diffuser une mise à jour de tâche
    io.broadcastTaskUpdate = (task, event = 'task:updated') => {
        io.emit(event, { task });
    };

    console.log('✅ Socket.IO handlers configured');
};

module.exports = { setupSocketHandlers };
