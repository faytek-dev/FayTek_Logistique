import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DispatcherDashboard from './pages/DispatcherDashboard';
import CourierDashboard from './pages/CourierDashboard';

// Route protégée
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <ToastContainer position="top-right" autoClose={3000} />
            <Router>
                <Routes>
                    {/* Route publique */}
                    <Route path="/login" element={<Login />} />

                    {/* Routes protégées par rôle */}
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/dispatcher/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['dispatcher']}>
                                <DispatcherDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/courier/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['courier']}>
                                <CourierDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Redirection par défaut */}
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    {/* Page non autorisée */}
                    <Route
                        path="/unauthorized"
                        element={
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100vh',
                                textAlign: 'center'
                            }}>
                                <h1>🚫 Accès non autorisé</h1>
                                <p>Vous n'avez pas les permissions pour accéder à cette page.</p>
                                <a href="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                    Retour à la connexion
                                </a>
                            </div>
                        }
                    />

                    {/* 404 */}
                    <Route
                        path="*"
                        element={
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100vh',
                                textAlign: 'center'
                            }}>
                                <h1>404 - Page non trouvée</h1>
                                <a href="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                    Retour à l'accueil
                                </a>
                            </div>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
