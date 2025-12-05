import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, usersAPI } from '../services/api';
import TrackingMap from '../components/TrackingMap';
import { toast } from 'react-toastify';
import '../pages/CourierDashboard.css';

const DispatcherDashboard = () => {
    const { user, logout } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [couriers, setCouriers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        pickupAddress: { fullAddress: '', coordinates: [2.3522, 48.8566] },
        deliveryAddress: { fullAddress: '', coordinates: [2.3522, 48.8566] },
        assignedTo: '',
        recipient: { name: '', phone: '', email: '' }
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tasksRes, couriersRes] = await Promise.all([
                tasksAPI.getAll(),
                usersAPI.getCouriers()
            ]);

            setTasks(tasksRes.data.data);
            setCouriers(couriersRes.data.data);
        } catch (error) {
            toast.error('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await tasksAPI.create({
                ...formData,
                pickupAddress: {
                    ...formData.pickupAddress,
                    location: {
                        type: 'Point',
                        coordinates: formData.pickupAddress.coordinates
                    }
                },
                deliveryAddress: {
                    ...formData.deliveryAddress,
                    location: {
                        type: 'Point',
                        coordinates: formData.deliveryAddress.coordinates
                    }
                }
            });

            toast.success('Tâche créée avec succès !');
            setShowCreateForm(false);
            fetchData();

            // Reset form
            setFormData({
                title: '',
                description: '',
                priority: 'medium',
                pickupAddress: { fullAddress: '', coordinates: [2.3522, 48.8566] },
                deliveryAddress: { fullAddress: '', coordinates: [2.3522, 48.8566] },
                assignedTo: '',
                recipient: { name: '', phone: '', email: '' }
            });
        } catch (error) {
            toast.error('Erreur lors de la création de la tâche');
        }
    };

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
                        <div className="user-avatar">📋</div>
                        <div>
                            <h2>Dashboard Dispatcheur</h2>
                            <p className="user-role">{user?.name}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="btn btn-primary"
                        >
                            ➕ Nouvelle Tâche
                        </button>
                        <button onClick={logout} className="btn btn-ghost">
                            🚪 Déconnexion
                        </button>
                    </div>
                </div>
            </header>

            <div className="dashboard-container container">
                {/* Formulaire de création */}
                {showCreateForm && (
                    <div className="card" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                        <h3>➕ Créer une Nouvelle Tâche</h3>
                        <form onSubmit={handleCreateTask}>
                            <div className="form-group">
                                <label className="form-label">Titre</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-textarea"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Priorité</label>
                                <select
                                    className="form-select"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="low">Basse</option>
                                    <option value="medium">Moyenne</option>
                                    <option value="high">Haute</option>
                                    <option value="urgent">Urgente</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Adresse de départ</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="123 Rue Example, Paris"
                                    value={formData.pickupAddress.fullAddress}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        pickupAddress: { ...formData.pickupAddress, fullAddress: e.target.value }
                                    })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Adresse de livraison</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="456 Avenue Test, Paris"
                                    value={formData.deliveryAddress.fullAddress}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        deliveryAddress: { ...formData.deliveryAddress, fullAddress: e.target.value }
                                    })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Assigner à un coursier</label>
                                <select
                                    className="form-select"
                                    value={formData.assignedTo}
                                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                >
                                    <option value="">Non assigné</option>
                                    {couriers.map(courier => (
                                        <option key={courier._id} value={courier._id}>
                                            {courier.name} ({courier.availability})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                                <button type="submit" className="btn btn-primary">
                                    ✅ Créer la Tâche
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="btn btn-ghost"
                                >
                                    ❌ Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Carte de suivi */}
                <div className="card" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                    <h3>🗺️ Suivi des Coursiers</h3>
                    <TrackingMap couriers={couriers} />
                </div>

                {/* Liste des tâches */}
                <div className="card">
                    <h3>📋 Mes Tâches ({tasks.length})</h3>
                    <div className="tasks-grid" style={{ marginTop: 'var(--spacing-lg)' }}>
                        {tasks.map(task => (
                            <div key={task._id} className="task-card card">
                                <div className="task-header">
                                    <h4>{task.title}</h4>
                                    <span className={`badge badge-${task.status === 'COMPLETED' ? 'success' :
                                            task.status === 'IN_PROGRESS' ? 'warning' : 'info'
                                        }`}>
                                        {task.status}
                                    </span>
                                </div>
                                <div className="task-details">
                                    <p><strong>Coursier:</strong> {task.assignedTo?.name || 'Non assigné'}</p>
                                    <p><strong>Priorité:</strong> {task.priority}</p>
                                    <p><strong>Créée le:</strong> {new Date(task.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DispatcherDashboard;
