import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, usersAPI, authAPI } from '../services/api';
import TrackingMap from '../components/TrackingMap';
import { toast } from 'react-toastify';
import '../pages/CourierDashboard.css';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview'); // overview, users, tasks
    const [tasks, setTasks] = useState([]);
    const [couriers, setCouriers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form States
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'courier' });
    const [newTask, setNewTask] = useState({ title: '', description: '', address: '', priority: 'normal' });

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
            console.error(error);
            toast.error('Erreur chargement données');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await authAPI.register(newUser);
            toast.success('Utilisateur créé avec succès !');
            setNewUser({ name: '', email: '', password: '', role: 'courier' });
            fetchData(); // Rafraîchir la liste
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur création utilisateur');
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await tasksAPI.create({
                ...newTask,
                location: { type: 'Point', coordinates: [0, 0] } // Placeholder loc
            });
            toast.success('Tâche créée avec succès !');
            setNewTask({ title: '', description: '', address: '', priority: 'normal' });
            fetchData();
        } catch (error) {
            toast.error('Erreur création tâche');
        }
    };

    const handleDeleteTask = async (id) => {
        if (!window.confirm('Supprimer cette tâche ?')) return;
        try {
            await tasksAPI.delete(id);
            toast.success('Tâche supprimée');
            fetchData();
        } catch (error) {
            toast.error('Erreur suppression');
        }
    };

    const stats = {
        totalTasks: tasks.length,
        activeTasks: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        totalCouriers: couriers.length,
        availableCouriers: couriers.filter(c => c.availability === 'available').length
    };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="courier-dashboard">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="user-info">
                        <div className="user-avatar">👨‍💼</div>
                        <div>
                            <h2>Dashboard Admin</h2>
                            <p className="user-role">{user?.name}</p>
                        </div>
                    </div>
                    <button onClick={logout} className="btn btn-ghost">🚪 Déconnexion</button>
                </div>
            </header>

            <div className="dashboard-container container">

                {/* Navigation Tabs */}
                <div className="tabs-container" style={{ marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
                    <button
                        className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('overview')}
                    >📊 Vue d'ensemble</button>
                    <button
                        className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('users')}
                    >👥 Utilisateurs</button>
                    <button
                        className={`btn ${activeTab === 'tasks' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab('tasks')}
                    >📋 Tâches</button>
                </div>

                {/* TAB: OVERVIEW */}
                {activeTab === 'overview' && (
                    <>
                        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
                            <div className="stat-card card"><h4>Total Tâches</h4><p className="stat-value">{stats.totalTasks}</p></div>
                            <div className="stat-card card"><h4>En cours</h4><p className="stat-value">{stats.activeTasks}</p></div>
                            <div className="stat-card card"><h4>Coursiers</h4><p className="stat-value">{stats.totalCouriers}</p></div>
                            <div className="stat-card card"><h4>Disponibles</h4><p className="stat-value">{stats.availableCouriers}</p></div>
                        </div>
                        <div className="card">
                            <h3>🗺️ Carte Globale</h3>
                            <TrackingMap couriers={couriers} />
                        </div>
                    </>
                )}

                {/* TAB: USERS */}
                {activeTab === 'users' && (
                    <div className="card">
                        <h3>👥 Gestion des Utilisateurs</h3>

                        {/* Création User */}
                        <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'end', marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                            <div>
                                <label>Nom</label>
                                <input className="form-input" required value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                            </div>
                            <div>
                                <label>Email</label>
                                <input className="form-input" type="email" required value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                            </div>
                            <div>
                                <label>Mot de passe</label>
                                <input className="form-input" type="password" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                            </div>
                            <div>
                                <label>Rôle</label>
                                <select className="form-input" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                    <option value="courier">Coursier</option>
                                    <option value="dispatcher">Dispatcheur</option>
                                    <option value="admin">Administrateur</option>
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary">➕ Créer</button>
                        </form>

                        {/* Liste Users */}
                        <table className="data-table">
                            <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th></tr></thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td><span className={`badge badge-info`}>{u.role}</span></td>
                                        <td>{u.isActive ? '✅ Actif' : '❌ Inactif'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TAB: TASKS */}
                {activeTab === 'tasks' && (
                    <div className="card">
                        <h3>📋 Gestion des Tâches</h3>

                        {/* Création Task */}
                        <form onSubmit={handleCreateTask} style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                <input className="form-input" placeholder="Titre de la tâche" required value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
                                <input className="form-input" placeholder="Adresse" required value={newTask.address} onChange={e => setNewTask({ ...newTask, address: e.target.value })} />
                            </div>
                            <textarea className="form-input" placeholder="Description" style={{ marginBottom: '10px' }} value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
                            <button type="submit" className="btn btn-primary">➕ Ajouter la tâche</button>
                        </form>

                        {/* Liste Tasks */}
                        <table className="data-table">
                            <thead><tr><th>Titre</th><th>Statut</th><th>Assigné à</th><th>Actions</th></tr></thead>
                            <tbody>
                                {tasks.map(t => (
                                    <tr key={t._id}>
                                        <td>{t.title}</td>
                                        <td><span className={`badge badge-${t.status === 'COMPLETED' ? 'success' : 'warning'}`}>{t.status}</span></td>
                                        <td>{t.assignedTo ? t.assignedTo.name : '⛔ Non assigné'}</td>
                                        <td>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(t._id)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
