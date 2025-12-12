import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import socketService from '../services/socket';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    // Initialisation synchrone pour éviter le flash de redirection
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            return null;
        }
    });
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
    const [loading, setLoading] = useState(true); // On garde loading true pour vérifier le token via API si besoin

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                try {
                    // Connecter Socket.IO immédiatement avec ce qu'on a
                    socketService.connect(storedToken);

                    // Vérifier si le token est toujours valide en arrière-plan
                    const response = await authAPI.getMe();
                    setUser(response.data.data); // Mise à jour avec les données fraîches
                    // Pas besoin de re-setToken ou setIsAuthenticated car déjà fait à l'init
                } catch (error) {
                    console.error('Token invalide ou erreur réseau:', error);
                    // Si vraiment invalide (401), on déconnecte. Si erreur réseau, on garde la session locale.
                    if (error.response && error.response.status === 401) {
                        logout();
                    }
                }
            } else {
                // Nettoyage si données incohérentes
                logout();
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            const { user: userData, token: userToken } = response.data.data;

            localStorage.setItem('token', userToken);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            setToken(userToken);
            setIsAuthenticated(true);

            // Connecter Socket.IO
            socketService.connect(userToken);

            return { success: true, user: userData };
        } catch (error) {
            console.error('Login Error Details:', error);
            let errorMessage = 'Erreur de connexion';

            if (error.response) {
                // Le serveur a répondu avec un code d'erreur
                errorMessage = error.response.data?.message || `Erreur serveur (${error.response.status})`;
            } else if (error.request) {
                // La requête a été faite mais pas de réponse
                errorMessage = 'Le serveur ne répond pas. Vérifiez votre connexion ou si le backend est démarré.';
            } else {
                // Erreur lors de la configuration de la requête
                errorMessage = error.message;
            }

            return {
                success: false,
                message: errorMessage
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            const { user: newUser, token: userToken } = response.data.data;

            localStorage.setItem('token', userToken);
            localStorage.setItem('user', JSON.stringify(newUser));

            setUser(newUser);
            setToken(userToken);
            setIsAuthenticated(true);

            // Connecter Socket.IO
            socketService.connect(userToken);

            return { success: true, user: newUser };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur d\'inscription'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);

        // Déconnecter Socket.IO
        socketService.disconnect();
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
