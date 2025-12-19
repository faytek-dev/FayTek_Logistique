import { io } from 'socket.io-client';

// Nettoyage de l'URL
const cleanUrl = (url) => url ? url.replace(/\/$/, '') : '';

const SOCKET_URL = cleanUrl(process.env.REACT_APP_SOCKET_URL) || 'http://192.168.1.31:4001';

console.log('🔌 Socket Target:', SOCKET_URL);

class SocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
    }

    connect(token) {
        if (this.socket?.connected) {
            console.log('Socket already connected');
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            auth: {
                token
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            console.log('✅ Socket.IO connected:', this.socket.id);
            this.connected = true;
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket.IO disconnected:', reason);
            this.connected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    // Émettre un événement
    emit(event, data) {
        if (this.socket && this.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn('Socket not connected, cannot emit:', event);
        }
    }

    // Écouter un événement
    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    // Arrêter d'écouter un événement
    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    // Mettre à jour la position GPS (pour les coursiers)
    updateLocation(latitude, longitude) {
        this.emit('location:update', { latitude, longitude });
    }

    // Demander toutes les positions des coursiers
    requestAllLocations() {
        this.emit('location:request:all');
    }

    // Changer le statut d'une tâche
    changeTaskStatus(taskId, status) {
        this.emit('task:status:change', { taskId, status });
    }

    // Écouter les mises à jour de position
    onLocationUpdate(callback) {
        this.on('location:updated', callback);
    }

    // Écouter les nouvelles tâches assignées
    onTaskAssigned(callback) {
        this.on('task:assigned', callback);
    }

    // Écouter les changements de statut de tâche
    onTaskStatusChanged(callback) {
        this.on('task:status:changed', callback);
    }

    // Écouter les notifications
    onNotification(callback) {
        this.on('notification', callback);
    }

    // Écouter toutes les positions des coursiers
    onAllLocations(callback) {
        this.on('location:all', callback);
    }
}

// Export d'une instance unique (Singleton)
const socketService = new SocketService();
export default socketService;
