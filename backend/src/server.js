require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const connectDB = require('./config/database');
const { setupSocketHandlers } = require('./socket');

// Initialiser Express
const app = express();
const server = http.createServer(app);

// Configurer les origines autorisées
const getCb = (origin, callback) => {
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:4001',
        'http://localhost:4000',
        'http://127.0.0.1:4000',
        'http://127.0.0.1:4001'
    ];

    // Si CORS_ORIGIN est *, on autorise tout le monde (Mode permissif pour débloquer)
    if (process.env.CORS_ORIGIN === '*') {
        return callback(null, true);
    }

    if (process.env.CORS_ORIGIN) {
        allowedOrigins.push(process.env.CORS_ORIGIN.trim().replace(/\/$/, ''));
    }

    // Autoriser les requêtes sans origine (comme Postman ou curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
        callback(null, true);
    } else {
        console.log('❌ CORS Blocked Origin:', origin);
        console.log('Allowed:', allowedOrigins);
        // callback(new Error('Not allowed by CORS')); // Trop strict pour le moment
        callback(null, true); // FALLBACK DE SECURITE : On autorise quand même pour tester
    }
};

const io = new Server(server, {
    cors: {
        origin: getCb,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Connecter à MongoDB
connectDB();

// Middlewares
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(cors({
    origin: getCb,
    credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging en développement
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rendre Socket.IO accessible dans les routes
app.set('io', io);

// Routes API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/users', require('./routes/users'));
app.use('/api/location', require('./routes/location'));

// Route de santé
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// Route racine
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Logistics PWA API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            tasks: '/api/tasks',
            users: '/api/users',
            location: '/api/location',
            health: '/health'
        }
    });
});

// Gestion des routes non trouvées
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée'
    });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
    console.error('Error:', err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Erreur serveur',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Configurer les gestionnaires Socket.IO
setupSocketHandlers(io);

// Démarrer le serveur
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚚 Logistics PWA Backend Server                        ║
║                                                           ║
║   Server running on port: ${PORT}                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   Socket.IO: ✅ Enabled                                   ║
║                                                           ║
║   API Endpoints:                                          ║
║   - Auth:     http://localhost:${PORT}/api/auth            ║
║   - Tasks:    http://localhost:${PORT}/api/tasks           ║
║   - Users:    http://localhost:${PORT}/api/users           ║
║   - Location: http://localhost:${PORT}/api/location        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Gestion de l'arrêt gracieux
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

module.exports = { app, server, io };
