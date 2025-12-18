import axios from 'axios';

// Nettoyage de l'URL (enlève le slash à la fin si présent)
const cleanUrl = (url) => url ? url.replace(/\/$/, '') : '';

// Revert to Direct Connection (CORS is now open on backend)
const API_URL = cleanUrl(process.env.REACT_APP_API_URL) || 'http://localhost:4001';

console.log('🌐 API Target (Direct):', API_URL);

console.log('🌐 API Configuration:', { API_URL });

// Instance Axios configurée
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expiré ou invalide
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ========== AUTH ==========
export const authAPI = {
    register: (data) => api.post('/api/auth/register', data),
    login: (data) => api.post('/api/auth/login', data),
    getMe: () => api.get('/api/auth/me'),
    updateProfile: (data) => api.put('/api/auth/profile', data)
};

// ========== TASKS ==========
export const tasksAPI = {
    getAll: (params) => api.get('/api/tasks', { params }),
    getById: (id) => api.get(`/api/tasks/${id}`),
    create: (data) => api.post('/api/tasks', data),
    update: (id, data) => api.put(`/api/tasks/${id}`, data),
    updateStatus: (id, status, note, proofOfDelivery) => api.patch(`/api/tasks/${id}/status`, { status, note, proofOfDelivery }),
    delete: (id) => api.delete(`/api/tasks/${id}`)
};

// ========== USERS ==========
export const usersAPI = {
    getAll: () => api.get('/api/users'),
    getCouriers: () => api.get('/api/users/couriers'),
    getById: (id) => api.get(`/api/users/${id}`),
    update: (id, data) => api.put(`/api/users/${id}`, data),
    toggleActive: (id) => api.patch(`/api/users/${id}/toggle-active`),
    delete: (id) => api.delete(`/api/users/${id}`),
    updateAvailability: (availability) => api.patch('/api/users/availability', { availability })
};

// ========== LOCATION ==========
export const locationAPI = {
    update: (latitude, longitude) => api.post('/api/location/update', { latitude, longitude }),
    getCouriers: () => api.get('/api/location/couriers'),
    findNearby: (latitude, longitude, maxDistance) =>
        api.get('/api/location/nearby', { params: { latitude, longitude, maxDistance } })
};

export default api;
