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

    // Filtres
    // Filtres
    const [taskFilter, setTaskFilter] = useState('ALL'); // ALL, IN_PROGRESS, etc
    const [userFilter, setUserFilter] = useState('ALL'); // ALL, courier, available

    // États pour les visualisations avancées
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);

    // Données simulées pour la Heatmap (zones d'activité)
    const heatmapPoints = [
        { lat: 33.5731, lng: -7.5898, intensity: 0.8 }, // Maarif
        { lat: 33.5333, lng: -7.5833, intensity: 1.0 }, // Polytel
        { lat: 33.5900, lng: -7.6000, intensity: 0.5 }, // Port
    ];

    // State complet pour la création de tâche
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'medium',
        pickupStreet: '',
        pickupCity: 'Paris',
        deliveryStreet: '',
        deliveryCity: 'Paris',
        recipientName: '',
        recipientPhone: '',
        assignedCourierId: ''
    });

    // Form States
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'courier' });

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
            // Construction de l'objet Tâche selon le schéma Backend
            const taskPayload = {
                title: newTask.title,
                description: newTask.description,
                priority: newTask.priority,
                pickupAddress: {
                    fullAddress: `${newTask.pickupStreet}, ${newTask.pickupCity}`,
                    city: newTask.pickupCity,
                    location: { type: 'Point', coordinates: [2.3522, 48.8566] } // Paris par défaut
                },
                deliveryAddress: {
                    fullAddress: `${newTask.deliveryStreet}, ${newTask.deliveryCity}`,
                    city: newTask.deliveryCity,
                    location: { type: 'Point', coordinates: [2.3522, 48.8566] }
                },
                recipient: {
                    name: newTask.recipientName,
                    phone: newTask.recipientPhone
                },
                assignedTo: newTask.assignedCourierId || null,
                status: newTask.assignedCourierId ? 'IN_PROGRESS' : 'CREATED'
            };

            await tasksAPI.create(taskPayload);
            toast.success('Tâche créée avec succès !');

            // Reset form
            setNewTask({
                title: '', description: '', priority: 'medium',
                pickupStreet: '', pickupCity: 'Paris',
                deliveryStreet: '', deliveryCity: 'Paris',
                recipientName: '', recipientPhone: '',
                assignedCourierId: ''
            });
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Erreur création tâche');
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
                            <div
                                className="stat-card card clickable-card"
                                onClick={() => { setActiveTab('tasks'); setTaskFilter('ALL'); }}
                                style={{ borderLeft: '4px solid #6366f1', cursor: 'pointer' }}
                            >
                                <h4>Total Tâches</h4>
                                <p className="stat-value">{stats.totalTasks}</p>
                                <small>Voir tout ›</small>
                            </div>
                            <div
                                className="stat-card card clickable-card"
                                onClick={() => { setActiveTab('tasks'); setTaskFilter('IN_PROGRESS'); }}
                                style={{ borderLeft: '4px solid #f59e0b', cursor: 'pointer' }}
                            >
                                <h4>En cours</h4>
                                <p className="stat-value">{stats.activeTasks}</p>
                                <small>Filtrer ›</small>
                            </div>
                            <div
                                className="stat-card card clickable-card"
                                onClick={() => { setActiveTab('users'); setUserFilter('courier'); }}
                                style={{ borderLeft: '4px solid #10b981', cursor: 'pointer' }}
                            >
                                <h4>Coursiers</h4>
                                <p className="stat-value">{stats.totalCouriers}</p>
                                <small>Voir liste ›</small>
                            </div>
                            <div
                                className="stat-card card clickable-card"
                                onClick={() => { setActiveTab('users'); setUserFilter('available'); }}
                                style={{ borderLeft: '4px solid #3b82f6', cursor: 'pointer' }}
                            >
                                <h4>Disponibles</h4>
                                <p className="stat-value">{stats.availableCouriers}</p>
                                <small>Filtrer ›</small>
                            </div>
                        </div>
                        <div className="card">
                            <h3>🗺️ Carte Globale & Intelligence</h3>
                            <div className="admin-map-container" style={{ height: '500px', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: 10, right: 60, zIndex: 1000, background: 'white', padding: '5px 10px', borderRadius: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                        <input
                                            type="checkbox"
                                            checked={showHeatmap}
                                            onChange={(e) => setShowHeatmap(e.target.checked)}
                                            style={{ accentColor: '#ec4899' }}
                                        />
                                        🔥 Vue Thermique
                                    </label>
                                </div>
                                <TrackingMap
                                    couriers={couriers}
                                    heatmapData={showHeatmap ? heatmapPoints : null}
                                />
                            </div>
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h4>Liste des Utilisateurs</h4>
                            {userFilter !== 'ALL' && (
                                <button className="btn btn-sm btn-ghost" onClick={() => setUserFilter('ALL')}>❌ Effacer le filtre ({userFilter})</button>
                            )}
                        </div>
                        <table className="data-table">
                            <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th></tr></thead>
                            <tbody>
                                {users.filter(u => {
                                    if (userFilter === 'ALL') return true;
                                    if (userFilter === 'courier') return u.role === 'courier';
                                    if (userFilter === 'available') return u.role === 'courier' && u.availability === 'available';
                                    return true;
                                }).map(u => (
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
                        <h3>📋 Créer une Nouvelle Mission</h3>

                        {/* Formulaire complet */}
                        <form onSubmit={handleCreateTask} style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee' }}>
                            {/* Ligne 1 : Titre & Priorité */}
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <div>
                                    <label className="form-label">Titre de la mission</label>
                                    <input className="form-input" required value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="Ex: Livraison Colis #1234" />
                                </div>
                                <div>
                                    <label className="form-label">Priorité</label>
                                    <select className="form-input" value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                                        <option value="low">Basse</option>
                                        <option value="medium">Moyenne</option>
                                        <option value="high">Haute</option>
                                        <option value="urgent">🔴 URGENTE</option>
                                    </select>
                                </div>
                            </div>

                            {/* Ligne 2 : Adresses */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                                <div style={{ background: '#e3f2fd', padding: '10px', borderRadius: '8px' }}>
                                    <h5 style={{ marginBottom: '10px' }}>📍 Départ (Ramassage)</h5>
                                    <input className="form-input" style={{ marginBottom: '5px' }} placeholder="Rue / Adresse" required value={newTask.pickupStreet} onChange={e => setNewTask({ ...newTask, pickupStreet: e.target.value })} />
                                    <input className="form-input" placeholder="Ville" required value={newTask.pickupCity} onChange={e => setNewTask({ ...newTask, pickupCity: e.target.value })} />
                                </div>
                                <div style={{ background: '#fff3e0', padding: '10px', borderRadius: '8px' }}>
                                    <h5 style={{ marginBottom: '10px' }}>🏁 Arrivée (Livraison)</h5>
                                    <input className="form-input" style={{ marginBottom: '5px' }} placeholder="Rue / Adresse" required value={newTask.deliveryStreet} onChange={e => setNewTask({ ...newTask, deliveryStreet: e.target.value })} />
                                    <input className="form-input" placeholder="Ville" required value={newTask.deliveryCity} onChange={e => setNewTask({ ...newTask, deliveryCity: e.target.value })} />
                                </div>
                            </div>

                            {/* Ligne 3 : Destinataire & Coursier */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <div>
                                    <label className="form-label">Nom Client</label>
                                    <input className="form-input" required value={newTask.recipientName} onChange={e => setNewTask({ ...newTask, recipientName: e.target.value })} />
                                </div>
                                <div>
                                    <label className="form-label">Tél Client</label>
                                    <input className="form-input" required value={newTask.recipientPhone} onChange={e => setNewTask({ ...newTask, recipientPhone: e.target.value })} />
                                </div>
                                <div>
                                    <label className="form-label">Assigner Coursier (Optionnel)</label>
                                    <select className="form-input" value={newTask.assignedCourierId} onChange={e => setNewTask({ ...newTask, assignedCourierId: e.target.value })}>
                                        <option value="">-- Choisir plus tard --</option>
                                        {couriers.map(c => (
                                            <option key={c._id} value={c._id}>🚴 {c.name} ({c.availability})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-block">🚀 Créer la Mission</button>
                        </form>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h3>📋 Liste des Missions</h3>
                            {taskFilter !== 'ALL' && (
                                <button className="btn btn-sm btn-ghost" onClick={() => setTaskFilter('ALL')}>❌ Effacer le filtre ({taskFilter})</button>
                            )}
                        </div>
                        <table className="data-table">
                            <thead><tr><th>Titre</th><th>De</th><th>Vers</th><th>Statut</th><th>Coursier</th><th>Actions</th></tr></thead>
                            <tbody>
                                {tasks.filter(t => {
                                    if (taskFilter === 'ALL') return true;
                                    return t.status === taskFilter;
                                }).map(t => (
                                    <tr key={t._id}>
                                        <td>
                                            <strong>{t.title}</strong><br />
                                            <small style={{ color: '#666' }}>{t.recipient?.name}</small>
                                        </td>
                                        <td>{t.pickupAddress?.city}</td>
                                        <td>{t.deliveryAddress?.city}</td>
                                        <td><span className={`badge badge-${t.status === 'COMPLETED' ? 'success' : t.status === 'IN_PROGRESS' ? 'warning' : 'info'}`}>{t.status}</span></td>
                                        <td>{t.assignedTo ? t.assignedTo.name : '⛔ Non assigné'}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => setSelectedTaskDetails(t)}
                                                    title="Détails"
                                                >
                                                    👁️
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => {
                                                        const link = `${window.location.origin}/track/${t._id}`;
                                                        navigator.clipboard.writeText(link);
                                                        toast.success("🔗 Lien copié !");
                                                    }}
                                                    title="Copier lien de suivi"
                                                >
                                                    🔗
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTask(t._id)} title="Supprimer">🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL DÉTAILS TÂCHE & PREUVES */}
            {selectedTaskDetails && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 2000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="modal-content" style={{
                        background: 'white', padding: '2rem', borderRadius: '16px',
                        maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <h3>📦 Détails de la livraison</h3>
                        <p><strong>Titre:</strong> {selectedTaskDetails.title}</p>
                        <p><strong>Statut:</strong> <span className={`badge badge-${selectedTaskDetails.status === 'COMPLETED' ? 'success' : 'warning'}`}>{selectedTaskDetails.status}</span></p>

                        {selectedTaskDetails.proofOfDelivery ? (
                            <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                <h4>✅ Preuve de Livraison</h4>
                                <p><small>Livré le: {new Date(selectedTaskDetails.proofOfDelivery.timestamp).toLocaleString()}</small></p>

                                {selectedTaskDetails.proofOfDelivery.signature && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <p><strong>Signature Client:</strong></p>
                                        <img
                                            src={selectedTaskDetails.proofOfDelivery.signature}
                                            alt="Signature"
                                            style={{ border: '1px solid #ccc', background: 'white', maxWidth: '100%' }}
                                        />
                                    </div>
                                )}

                                {selectedTaskDetails.proofOfDelivery.photo && (
                                    <div>
                                        <p><strong>Photo du Colis:</strong></p>
                                        <img
                                            src={selectedTaskDetails.proofOfDelivery.photo}
                                            alt="Preuve Photo"
                                            style={{ borderRadius: '8px', maxWidth: '100%', maxHeight: '300px' }}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f1f5f9', borderRadius: '8px', textAlign: 'center' }}>
                                <p>⏳ Aucune preuve de livraison disponible.</p>
                                <p><small>(Le coursier doit valider la tâche avec signature/photo)</small></p>
                            </div>
                        )}

                        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                            <button
                                className="btn btn-primary"
                                onClick={() => setSelectedTaskDetails(null)}
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
