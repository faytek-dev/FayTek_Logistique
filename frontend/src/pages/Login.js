import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    // Effectuer la redirection une fois que l'état d'authentification est mis à jour
    React.useEffect(() => {
        if (isAuthenticated && user) {
            console.log('✅ Authenticated, redirecting...', user.role);
            switch (user.role) {
                case 'admin':
                    navigate('/admin/dashboard');
                    break;
                case 'dispatcher':
                    navigate('/dispatcher/dashboard');
                    break;
                case 'courier':
                    navigate('/courier/dashboard');
                    break;
                default:
                    navigate('/');
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log('🚀 Tentative de connexion...');

        try {
            const result = await login(formData.email, formData.password);
            console.log('Réultat login:', result);

            if (result.success) {
                console.log(`✅ Bienvenue ${result.user.name} !`);
                // toast.success(`Bienvenue ${result.user.name} !`); 
                // La redirection est gérée par le useEffect
            } else {
                console.error('❌ Erreur login:', result.message);
                alert(result.message); // Fallback visible
            }
        } catch (err) {
            console.error('💥 Crash in handleSubmit:', err);
            alert('Erreur critique dans le login');
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <div className="login-card card fade-in">
                <div className="login-header">
                    <div className="logo-container">
                        <div className="logo-icon">🚚</div>
                        <h1 className="logo-text">Logistics PWA</h1>
                    </div>
                    <p className="login-subtitle">Gestion logistique en temps réel</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            <span className="label-icon">📧</span>
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-input"
                            placeholder="votre@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            <span className="label-icon">🔒</span>
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner-small"></div>
                                Connexion...
                            </>
                        ) : (
                            <>
                                <span>Se connecter</span>
                                <span>→</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p className="demo-accounts-title">Comptes de démonstration :</p>
                    <div className="demo-accounts">
                        <div className="demo-account">
                            <span className="demo-role">Admin</span>
                            <code>admin@logistics.com / admin123</code>
                        </div>
                        <div className="demo-account">
                            <span className="demo-role">Dispatcheur</span>
                            <code>dispatcher@logistics.com / dispatch123</code>
                        </div>
                        <div className="demo-account">
                            <span className="demo-role">Coursier</span>
                            <code>courier@logistics.com / courier123</code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
