const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Le titre est requis'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['CREATED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        default: 'CREATED'
    },
    // Adresse de départ
    pickupAddress: {
        street: String,
        city: String,
        postalCode: String,
        country: { type: String, default: 'France' },
        fullAddress: String,
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        }
    },
    // Adresse de livraison
    deliveryAddress: {
        street: String,
        city: String,
        postalCode: String,
        country: { type: String, default: 'France' },
        fullAddress: String,
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        }
    },
    // Informations du destinataire
    recipient: {
        name: String,
        phone: String,
        email: String
    },
    // Créé par (Admin ou Dispatcher)
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Assigné à (Coursier)
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Historique des changements de statut
    statusHistory: [{
        status: {
            type: String,
            enum: ['CREATED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        note: String
    }],
    // Dates importantes
    scheduledPickupTime: Date,
    scheduledDeliveryTime: Date,
    actualPickupTime: Date,
    actualDeliveryTime: Date,
    // Notes et commentaires
    notes: String,
    // Preuve de livraison
    proofOfDelivery: {
        signature: String, // URL ou base64
        photo: String, // URL ou base64
        timestamp: Date
    }
}, {
    timestamps: true
});

// Index géospatial pour recherche par localisation
taskSchema.index({ 'pickupAddress.location': '2dsphere' });
taskSchema.index({ 'deliveryAddress.location': '2dsphere' });

// Index pour les requêtes fréquentes
taskSchema.index({ status: 1, assignedTo: 1 });
taskSchema.index({ createdBy: 1, status: 1 });

// Middleware pour ajouter automatiquement l'historique lors du changement de statut
taskSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date(),
            updatedBy: this._updatedBy // Doit être défini avant save
        });
    }
    next();
});

module.exports = mongoose.model('Task', taskSchema);
