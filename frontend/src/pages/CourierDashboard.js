import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, usersAPI } from '../services/api';
import socketService from '../services/socket';
import { toast } from 'react-toastify';
import { showNotification } from '../serviceWorkerRegistration';
import './CourierDashboard.css';

const CourierDashboard = () => {
    const { user, logout } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [availability, setAvailability] = useState(user?.availability || 'offline');
    const [locationTracking, setLocationTracking] = useState(false);
    const [watchId, setWatchId] = useState(null);

    const fetchTasks = useCallback(async () => {
        try {
            const response = await tasksAPI.getAll();
            setTasks(response.data.data);
        } catch (error) {
            toast.error('Erreur lors du chargement des tâches');
        } finally {
            setLoading(false);
        }
    }, []);

    const setupSocketListeners = useCallback(() => {
        socketService.onTaskAssigned((data) => {
            toast.info(`📦 Nouvelle tâche: ${data.task.title}`);
            showNotification('Nouvelle tâche assignée', { body: data.task.title });
            fetchTasks();
        });

        socketService.on('task:updated', () => fetchTasks());

        return () => {
            socketService.off('task:assigned');
            socketService.off('task:updated');
        };
    }, [fetchTasks]);

    const startLocationTracking = useCallback(() => {
        if (locationTracking) return;

        if (!navigator.geolocation) {
            toast.error('La géolocalisation n\'est pas supportée');
            return;
        }

        const id = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                socketService.updateLocation(latitude, longitude);
                console.log(`📍 Position envoyée: ${latitude}, ${longitude}`);
            },
            (error) => console.error('Erreur GPS:', error),
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
        );

        setWatchId(id);
        setLocationTracking(true);
        toast.success('📍 Suivi GPS actif');
    }, [locationTracking]);

    const stopLocationTracking = useCallback(() => {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
            setLocationTracking(false);
        }
    }, [watchId]);

    useEffect(() => {
        fetchTasks();
        const cleanup = setupSocketListeners();

        if (availability === 'available' || availability === 'busy') {
            startLocationTracking();
        } else {
            stopLocationTracking();
        }

        return () => {
            if (cleanup) cleanup();
            stopLocationTracking();
        };
    }, [availability, fetchTasks, setupSocketListeners, startLocationTracking, stopLocationTracking]);

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await tasksAPI.updateStatus(taskId, newStatus);
            toast.success(`Statut mis à jour: ${newStatus}`);
            fetchTasks();
        } catch (error) {
            toast.error('Erreur lors de la mise à jour du statut');
        }
    };

    const handleAvailabilityChange = async (newAvailability) => {
        try {
            await usersAPI.updateAvailability(newAvailability);
            setAvailability(newAvailability);
            toast.success(`Statut: ${newAvailability}`);
        } catch (error) {
            toast.error('Erreur lors de la mise à jour');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            CREATED: 'info',
            IN_PROGRESS: 'warning',
            COMPLETED: 'success',
            CANCELLED: 'error'
        };
        return colors[status] || 'info';
    };

    const activeTasks = tasks.filter(t => ['CREATED', 'IN_PROGRESS'].includes(t.status));
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Chargement...</p>
            </div>
        );
    }

    return (
        <div className="courier-dashboard">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="user-info">
                        <div className="user-avatar">🚴</div>
                        <div>
                            <h2>Bonjour, {user?.name}</h2>
                            <p className="user-role">Coursier</p>
                        </div>
                    </div>
                    <button onClick={logout} className="btn btn-ghost">
                        🚪 Déconnexion
                    </button>
                </div>
            </header>

            <div className="dashboard-container container">
                <div className="status-section card">
                    <h3>📊 Statut</h3>
                    <div className="status-controls">
                        <div className="availability-buttons">
                            <button
                                className={`btn ${availability === 'available' ? 'btn-success' : 'btn-outline'}`}
                                onClick={() => handleAvailabilityChange('available')}
                            >
                                ✅ Disponible
                            </button>
                            <button
                                className={`btn ${availability === 'busy' ? 'btn-warning' : 'btn-outline'}`}
                                onClick={() => handleAvailabilityChange('busy')}
                            >
                                ⏳ Occupé
                            </button>
                            <button
                                className={`btn ${availability === 'offline' ? 'btn-error' : 'btn-outline'}`}
                                onClick={() => handleAvailabilityChange('offline')}
                            >
                                🔴 Hors ligne
                            </button>
                        </div>

                        <div className="gps-status">
                            {locationTracking ? (
                                <div className="gps-active">
                                    <span className="pulse-dot"></span>
                                    <span>📍 GPS Actif</span>
                                </div>
                            ) : (
                                <span className="gps-inactive">📍 GPS Inactif</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="tasks-section">
                    <h3>📦 Tâches Actives ({activeTasks.length})</h3>
                    {activeTasks.length === 0 ? (
                        <div className="empty-state card">
                            <p>Aucune tâche active pour le moment</p>
                        </div>
                    ) : (
                        <div className="tasks-grid">
                            {activeTasks.map((task) => (
                                <div key={task._id} className="task-card card">
                                    <div className="task-header">
                                        <h4>{task.title}</h4>
                                        <span className={`badge badge-${getStatusColor(task.status)}`}>
                                            {task.status}
                                        </span>
                                    </div>

                                    <div className="task-details">
                                        <div className="task-address">
                                            <strong>📍 Départ:</strong>
                                            <p>{task.pickupAddress?.fullAddress || 'Non spécifié'}</p>
                                        </div>
                                        <div className="task-address">
                                            <strong>🎯 Livraison:</strong>
                                            <p>{task.deliveryAddress?.fullAddress || 'Non spécifié'}</p>
                                        </div>
                                        {task.recipient && (
                                            <div className="task-recipient">
                                                <strong>👤 Destinataire:</strong>
                                                <p>{task.recipient.name}</p>
                                                <p>{task.recipient.phone}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="task-actions">
                                        {task.status === 'CREATED' && (
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleStatusChange(task._id, 'IN_PROGRESS')}
                                            >
                                                🚀 Commencer
                                            </button>
                                        )}
                                        {task.status === 'IN_PROGRESS' && (
                                            <button
                                                className="btn btn-success"
                                                onClick={() => handleStatusChange(task._id, 'COMPLETED')}
                                            >
                                                ✅ Terminer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="tasks-section">
                    <h3>✅ Tâches Terminées ({completedTasks.length})</h3>
                    {completedTasks.length > 0 && (
                        <div className="completed-tasks">
                            {completedTasks.slice(0, 5).map((task) => (
                                <div key={task._id} className="completed-task">
                                    <span>{task.title}</span>
                                    <span className="badge badge-success">COMPLETED</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourierDashboard;
