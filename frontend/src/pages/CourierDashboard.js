import React, { useState, useEffect, useCallback, useRef } from 'react';
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

    // États pour le modal de preuve de livraison
    const [showProofModal, setShowProofModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [photo, setPhoto] = useState(null);
    const canvasRef = useRef(null);
    const isDrawing = useRef(false);

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
                // console.log(`📍 Position envoyée: ${latitude}, ${longitude}`);
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

    const optimizeRoute = () => {
        if (!navigator.geolocation) {
            toast.error("GPS non disponible");
            return;
        }

        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;

            // Calculer la distance simple (Euclidienne) pour chaque tâche
            const sortedTasks = [...tasks].sort((a, b) => {
                const getCoords = (task) => {
                    const coords = task.pickupAddress?.location?.coordinates;
                    if (coords && coords.length === 2) {
                        return { lat: coords[1], lng: coords[0] };
                    }
                    return null;
                };

                const coordsA = getCoords(a);
                const coordsB = getCoords(b);

                if (!coordsA) return 1;
                if (!coordsB) return -1;

                const distA = Math.sqrt(Math.pow(coordsA.lat - latitude, 2) + Math.pow(coordsA.lng - longitude, 2));
                const distB = Math.sqrt(Math.pow(coordsB.lat - latitude, 2) + Math.pow(coordsB.lng - longitude, 2));
                return distA - distB;
            });

            setTasks(sortedTasks);
            toast.success("⚡ Tournée optimisée par proximité !");
        }, (error) => {
            toast.error("Impossible d'obtenir votre position pour l'optimisation");
        });
    };

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

    // ========== GESTION DU STATUT ==========

    const handleStatusClick = (task, newStatus) => {
        if (newStatus === 'COMPLETED') {
            setSelectedTask(task);
            setShowProofModal(true);
            setPhoto(null);
            // On attend que le modal s'ouvre pour init le canvas si besoin, mais React gère ça
        } else {
            updateStatus(task._id, newStatus);
        }
    };

    const updateStatus = async (taskId, newStatus, proofData = null) => {
        try {
            await tasksAPI.updateStatus(taskId, newStatus, null, proofData);
            toast.success(`Statut mis à jour: ${newStatus}`);
            fetchTasks();
            setShowProofModal(false);
        } catch (error) {
            toast.error('Erreur lors de la mise à jour du statut');
        }
    };

    // ========== SIGNATURE CANVAS ==========

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
        isDrawing.current = true;
    };

    const draw = (e) => {
        if (!isDrawing.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        isDrawing.current = false;
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    // ========== PHOTO CAPTURE ==========
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // ========== VALIDER LA LIVRAISON ==========
    const confirmDelivery = () => {
        if (!selectedTask) return;

        const canvas = canvasRef.current;
        const signature = canvas ? canvas.toDataURL('image/png') : null;

        // On vérifie si la signature est vide (un canvas vide fait environ 3000 octets ou moins selon la taille)
        // Mais ici on n'a pas de validation stricte pour l'instant

        const proofData = {
            signature,
            photo
        };

        updateStatus(selectedTask._id, 'COMPLETED', proofData);
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                        <h3>📦 Tâches Actives ({activeTasks.length})</h3>
                        {activeTasks.length > 1 && (
                            <button className="btn btn-sm btn-primary" onClick={optimizeRoute}>
                                ⚡ Optimiser ma tournée
                            </button>
                        )}
                    </div>
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
                                                onClick={() => handleStatusClick(task, 'IN_PROGRESS')}
                                            >
                                                🚀 Commencer
                                            </button>
                                        )}
                                        {task.status === 'IN_PROGRESS' && (
                                            <button
                                                className="btn btn-success"
                                                onClick={() => handleStatusClick(task, 'COMPLETED')}
                                            >
                                                ✅ Terminer (Preuve)
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

            {/* Footer de version & Debug */}
            <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem', color: '#64748b', fontSize: '0.8rem' }}>
                <p>Version v1.1.2</p>
                <button
                    onClick={() => {
                        localStorage.clear();
                        window.location.reload(true);
                    }}
                    style={{ background: 'none', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '5px', marginTop: '5px' }}
                >
                    🔄 Forcer la mise à jour
                </button>
            </div>

            {/* MODAL DE PREUVE DE LIVRAISON */}
            {showProofModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>✍️ Preuve de Livraison</h3>

                        <div className="form-group">
                            <label className="form-label">Signature du client</label>
                            <div className="signature-pad-container">
                                <canvas
                                    ref={canvasRef}
                                    className="signature-canvas"
                                    width={400}
                                    height={200}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                />
                            </div>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={clearSignature}>
                                🗑️ Effacer la signature
                            </button>
                        </div>

                        <div className="form-group">
                            <label className="form-label">📸 Photo du colis (Optionnel)</label>
                            <label className="photo-upload-label">
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handlePhotoChange}
                                    style={{ display: 'none' }}
                                />
                                {photo ? (
                                    <img src={photo} alt="Preuve" style={{ maxWidth: '100%', maxHeight: '150px' }} />
                                ) : (
                                    <span>Cliquez pour prendre une photo</span>
                                )}
                            </label>
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn btn-outline"
                                onClick={() => setShowProofModal(false)}
                            >
                                Annuler
                            </button>
                            <button
                                className="btn btn-success"
                                onClick={confirmDelivery}
                            >
                                ✅ Confirmer la Livraison
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourierDashboard;
