import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, usersAPI } from '../services/api';
import TrackingMap from '../components/TrackingMap';
import { toast } from 'react-toastify';
import '../pages/CourierDashboard.css';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [couriers, setCouriers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tasksRes, couriersRes, usersRes] = await Promise.all([
                tasksAPI.getAll(),
                usersAPI.getCouriers(),
                usersAPI.getAll()
            ]);

            setTasks(tasksRes.data.data);
            setCouriers(couriersRes.data.data);
            setUsers(usersRes.data.data);
        } catch (error) {
            toast.error('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        totalTasks: tasks.length,
        activeTasks: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        completedTasks: tasks.filter(t => t.status === 'COMPLETED').length,
        totalCouriers: couriers.length,
        availableCouriers: couriers.filter(c => c.availability === 'available').length
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
                        <div className="user-avatar">👨‍💼</div>
                        <div>
                            <h2>Dashboard Administrateur</h2>
                            <p className="user-role">{user?.name}</p>
                        </div>
                    </div>
                    <button onClick={logout} className="btn btn-ghost">
                        🚪 Déconnexion
                    </button>
                </div>
            </header>

            <div className="dashboard-container container">
                {/* Statistiques */}
                <div className="stats-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--spacing-lg)',
                    marginBottom: 'var(--spacing-2xl)'
                }}>
                    <div className="stat-card card">
                        <h4>📦 Tâches Totales</h4>
                        <p className="stat-value">{stats.totalTasks}</p>
                    </div>
                    <div className="stat-card card">
                        <h4>⏳ En cours</h4>
                        <p className="stat-value">{stats.activeTasks}</p>
                    </div>
                    <div className="stat-card card">
                        <h4>✅ Terminées</h4>
                        <p className="stat-value">{stats.completedTasks}</p>
                    </div>
                    <div className="stat-card card">
                        <h4>🚴 Coursiers</h4>
                        <p className="stat-value">{stats.totalCouriers}</p>
                    </div>
                    <div className="stat-card card">
                        <h4>✅ Disponibles</h4>
                        <p className="stat-value">{stats.availableCouriers}</p>
                    </div>
                </div>

                {/* Carte de suivi */}
                <div className="card" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                    <h3>🗺️ Suivi en Temps Réel</h3>
                    <TrackingMap couriers={couriers} />
                </div>

                {/* Liste des tâches */}
                <div className="card">
                    <h3>📋 Dernières Tâches</h3>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Titre</th>
                                    <th>Statut</th>
                                    <th>Coursier</th>
                                    <th>Créé par</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.slice(0, 10).map(task => (
                                    <tr key={task._id}>
                                        <td>{task.title}</td>
                                        <td>
                                            <span className={`badge badge-${task.status === 'COMPLETED' ? 'success' :
                                                    task.status === 'IN_PROGRESS' ? 'warning' : 'info'
                                                }`}>
                                                {task.status}
                                            </span>
                                        </td>
                                        <td>{task.assignedTo?.name || 'Non assigné'}</td>
                                        <td>{task.createdBy?.name}</td>
                                        <td>{new Date(task.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .stat-card h4 {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: var(--spacing-sm);
        }
        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--primary-light);
          margin: 0;
        }
        .table-container {
          overflow-x: auto;
          margin-top: var(--spacing-lg);
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table th,
        .data-table td {
          padding: var(--spacing-md);
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }
        .data-table th {
          font-weight: 600;
          color: var(--text-primary);
          background: var(--bg-secondary);
        }
        .data-table td {
          color: var(--text-secondary);
        }
      `}</style>
        </div>
    );
};

export default AdminDashboard;
