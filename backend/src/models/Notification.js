const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['task_assigned', 'task_updated', 'task_cancelled', 'status_changed', 'location_update'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedTask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    // Données supplémentaires pour les notifications push
    data: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Index pour récupérer rapidement les notifications non lues d'un utilisateur
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
